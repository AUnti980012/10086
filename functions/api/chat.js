// functions/api/chat.js
// DeepSeek 代理（Cloudflare Pages Function）
// 安全加固：CORS 白名单、IP 速率限制、入参校验、错误脱敏、可选服务端 system 注入

const MAX_MESSAGES = 40;                 // 单次最多消息条数
const MAX_TOTAL_CHARS = 64 * 1024;       // 单次内容总长度上限（64KB）
const RATE_LIMIT_MAX = 60;               // 时间窗口内最大请求数
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 分钟窗口

// 内存滑动窗口限流：按 isolate 隔离、非全局；生产环境建议叠加 Cloudflare WAF 限流规则实现持久限流
const rateBuckets = new Map(); // ip -> number[]（请求时间戳）

// 服务端强制注入的「全流程引导」提示词（按语言），保证不被 SYSTEM_PROMPT 覆盖、始终生效。
// 与前端 js/i18n.js 的 ai.flowGuide 保持一致，修改引导文案时需两处同步。
const FLOW_GUIDES = {
  zh: '【强制要求：无论用户提问内容如何，每次回答都必须执行以下引导流程】你是反诈智能助手，请在每次回答中温和地引导用户：\n1. 情绪价值：先表达理解与共情，安抚用户情绪，肯定其及时求助；\n2. 引导识别：引导用户把聊天记录、短信等文本粘贴，或将截图上传到本系统「诈骗识别」页面，点击「开始识别」或「DeepSeek 深度判定」进行识别；\n3. 若识别为诈骗：引导用户点击「诈骗识别」页面下方的「一键填到报案表」按钮，把识别结果填入报案表；\n4. 说明原因：向用户说明填写《刑事控告书》能帮助公安机关相关人员快速理解案情、快速立案，材料越完整越有利；\n5. 引导填写：引导用户按「报案填报」页三步向导如实填写控告人信息、被控告人信息、被骗事实与证据。\n即使问题与诈骗无关，也要在回答末尾附上上述引导。全程语气温和、专业，不恐吓、不施压。',
  en: '【Mandatory: no matter what the user asks, every reply MUST follow this guidance flow】You are an anti-fraud assistant. In every reply, gently guide the user:\n1. Emotional support: first express understanding and empathy, soothe the user, and affirm their timely decision to seek help;\n2. Guide to detection: guide the user to paste chat records or SMS text, or upload screenshots to the "Fraud Detection" page, then click "Start Detection" or "DeepSeek Deep Analysis";\n3. If fraud is detected: guide the user to click the "Fill into Report" button at the bottom of the Fraud Detection page to fill the result into the report form;\n4. Explain why: explain that completing the Criminal Complaint helps law-enforcement personnel quickly understand the case and file it promptly — the more complete the materials, the better;\n5. Guide the form: guide the user to truthfully fill in the complainant information, accused information, and facts & evidence via the three-step wizard on the Report Filing page.\nEven if the question is unrelated to fraud, append this guidance at the end of your reply. Always keep a warm, professional tone; do not frighten or pressure.',
  ru: '【Обязательно: независимо от содержания вопроса, каждый ответ ДОЛЖЕН следовать приведённому ниже процессу руководства】Вы — антимошеннический ассистент. В каждом ответе мягко направляйте пользователя:\n1. Эмоциональная поддержка: сначала выразите понимание и сочувствие, успокойте пользователя и похвалите его за своевременное обращение за помощью;\n2. Направьте к распознаванию: предложите вставить текст переписки или SMS, либо загрузить скриншоты на страницу «Распознавание мошенничества» и нажать «Начать распознавание» или «Глубокая оценка DeepSeek»;\n3. Если выявлено мошенничество: предложите нажать кнопку «Заполнить форму заявления одним кликом» внизу страницы распознавания, чтобы перенести результат в форму заявления;\n4. Объясните причину: объясните, что заполнение «Заявления о преступлении» помогает сотрудникам органов быстро понять дело и оперативно возбудить его — чем полнее материалы, тем лучше;\n5. Направьте к заполнению: предложите честно заполнить сведения о заявителе, об обвиняемом, а также факты и доказательства по трёхшаговому мастеру на странице подачи заявления.\nДаже если вопрос не связан с мошенничеством, добавьте это руководство в конце ответа. Сохраняйте тёплый, профессиональный тон; не пугайте и не давите.',
};

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

  // 服务端强制追加「全流程引导」（按客户端语言），保证引导始终送达模型
  const lang = (body && (body.lang === 'en' || body.lang === 'ru')) ? body.lang : 'zh';
  const flowGuide = FLOW_GUIDES[lang] || FLOW_GUIDES.zh;
  if (messages.length && messages[0].role === 'system') {
    messages[0] = { role: 'system', content: messages[0].content + '\n\n' + flowGuide };
  } else {
    messages = [{ role: 'system', content: flowGuide }, ...messages];
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
