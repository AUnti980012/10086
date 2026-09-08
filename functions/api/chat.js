// functions/api/chat.js
// DeepSeek 代理（Cloudflare Pages Function）
// 安全加固：CORS 白名单、IP 速率限制、入参校验、错误脱敏、可选服务端 system 注入

const MAX_MESSAGES = 40;                 // 单次最多消息条数
const MAX_TOTAL_CHARS = 64 * 1024;       // 单次内容总长度上限（64KB）
const RATE_LIMIT_MAX = 60;               // 时间窗口内最大请求数
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 分钟窗口

// 内存滑动窗口限流：按 isolate 隔离、非全局；生产环境建议叠加 Cloudflare WAF 限流规则实现持久限流
const rateBuckets = new Map(); // ip -> number[]（请求时间戳）

function isAllowedOrigin(origin, env) {
  if (!origin) return true; // 无 Origin（同源/非浏览器）不触发 CORS
  const list = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!list.length) return false; // 未配置白名单 → 仅同源可用
  return list.includes(origin);
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  if (origin && isAllowedOrigin(origin, env)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Vary': 'Origin',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
  }
  return {};
}

function json(data, status, extraHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

function hitRateLimit(request) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = (rateBuckets.get(ip) || []).filter(t => t > windowStart);
  if (timestamps.length >= RATE_LIMIT_MAX) {
    rateBuckets.set(ip, timestamps); // 保留最新，避免无限增长
    return true;
  }
  timestamps.push(now);
  rateBuckets.set(ip, timestamps);
  return false;
}

export async function onRequest(context) {
  const { request, env } = context;
  const headers = corsHeaders(request, env);

  // 处理 OPTIONS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  // 仅允许 POST
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, headers);
  }

  if (hitRateLimit(request)) {
    return json({ error: 'Too many requests' }, 429, headers);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400, headers);
  }

  let messages = body && body.messages;
  if (!Array.isArray(messages)) {
    return json({ error: 'Invalid request: messages must be an array' }, 400, headers);
  }

  // 可选：服务端强制 system 提示词，并丢弃客户端传入的 system（缓解提示注入）
  const serverSystem = env.SYSTEM_PROMPT;
  if (serverSystem) {
    messages = messages.filter(m => m && m.role !== 'system');
    messages = [{ role: 'system', content: serverSystem }, ...messages];
  }

  if (messages.length > MAX_MESSAGES) {
    return json({ error: 'Too many messages' }, 400, headers);
  }

  let totalChars = 0;
  for (const m of messages) {
    if (!m || typeof m.role !== 'string' || typeof m.content !== 'string') {
      return json({ error: 'Invalid message format' }, 400, headers);
    }
    totalChars += m.content.length;
  }
  if (totalChars > MAX_TOTAL_CHARS) {
    return json({ error: 'Request too large' }, 400, headers);
  }

  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return json({ error: 'Service not configured' }, 500, headers);
  }

  try {
    // 调用 DeepSeek API
    const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
      }),
    });

    if (!resp.ok) {
      // 不透传上游原始错误体，避免泄露敏感信息
      console.error('DeepSeek API error', resp.status, await resp.text());
      return json({ error: 'Upstream error' }, 502, headers);
    }

    const data = await resp.json();
    return json(data, 200, headers);
  } catch (err) {
    console.error('Chat function error:', err);
    return json({ error: 'Internal server error' }, 500, headers);
  }
}
