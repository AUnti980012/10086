/**
 * 聊天功能模块
 * 包含：消息渲染（Markdown支持）、用户发送、AI回复、打字指示器
 */

// ===== 构建 system prompt（注入反诈关键词知识库） =====
function buildSystemPrompt() {
    const lang = window.I18N && window.I18N.current;
    const isEn = lang === 'en';
    const isRu = lang === 'ru';
    let base = t('ai.systemPrompt');
    const knowledge = window.antiFraudKnowledge || [];
    if (knowledge.length) {
        base += "\n\n" + t('ai.knowledgeHeader') + "\n" +
            knowledge.map(k => t('ai.knowledgeItem', isEn
                ? { keyword: k.keyword_en || k.keyword, desc: k.desc_en || k.desc, tip: k.tip_en || k.tip }
                : isRu
                    ? { keyword: k.keyword_ru || k.keyword, desc: k.desc_ru || k.desc, tip: k.tip_ru || k.tip }
                    : { keyword: k.keyword, desc: k.desc, tip: k.tip }
            )).join('\n');
    }
    return base;
}

let conversationHistory = [{
    role: "system",
    content: buildSystemPrompt()
}];
let isWaitingReply = false;
let chatCleared = false;

// ===== 添加消息到UI（用户消息不做Markdown，AI消息渲染Markdown） =====
function addMessageToUI(sender, text) {
    let container = document.getElementById('chatMessages');
    if (!container) return;
    let div = document.createElement('div');
    div.className = `message ${sender}`;
    let bubbleContent = sender === 'user' ? escapeHtml(text) : renderMarkdown(text);
    let avatarHTML = sender === 'user'
        ? '<div class="message-avatar user-avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>'
        : '<div class="message-avatar bot-avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>';
    div.innerHTML = `${avatarHTML}<div class="message-bubble">${bubbleContent}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// ===== 显示/隐藏打字指示器（动态状态文字 + 计时） =====
let typingInterval = null;
let typingStartTime = 0;

const typingStates = [
    { key: 'chat.typing.think', icon: ICONS.chat, minSec: 0 },
    { key: 'chat.typing.search', icon: ICONS.search, minSec: 1.5 },
    { key: 'chat.typing.compose', icon: ICONS.doc, minSec: 3 },
];

function showTypingIndicator() {
    removeTypingIndicator();
    let container = document.getElementById('chatMessages');
    if (!container) return;
    typingStartTime = Date.now();
    let div = document.createElement('div');
    div.id = 'typingIndicator';
    div.className = 'message bot';
    div.innerHTML = '<div class="message-avatar bot-avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><div class="typing-status" id="typingStatus"><span class="typing-icon">' + ICONS.chat + '</span> <span class="typing-text">' + t('chat.typing.think') + '</span> <span class="typing-time">(0.0s)</span><span class="typing-dots"><span>.</span><span>.</span><span>.</span></span></div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;

    // 动态更新计时和状态文字
    typingInterval = setInterval(() => {
        let elapsed = (Date.now() - typingStartTime) / 1000;
        let timeEl = document.getElementById('typingStatus');
        if (!timeEl) { clearInterval(typingInterval); return; }
        let state = typingStates[0];
        for (let i = typingStates.length - 1; i >= 0; i--) {
            if (elapsed >= typingStates[i].minSec) { state = typingStates[i]; break; }
        }
        timeEl.querySelector('.typing-icon').innerHTML = state.icon;
        timeEl.querySelector('.typing-text').textContent = t(state.key);
        timeEl.querySelector('.typing-time').textContent = `(${elapsed.toFixed(1)}s)`;
    }, 200);
}

function removeTypingIndicator() {
    if (typingInterval) { clearInterval(typingInterval); typingInterval = null; }
    let ind = document.getElementById('typingIndicator');
    if (ind) ind.remove();
}

// ===== 构造发送载荷：始终保留 system 消息，仅截断非 system 的历史 =====
function buildPayload() {
    const system = conversationHistory.find(m => m.role === 'system');
    const recent = conversationHistory.filter(m => m.role !== 'system').slice(-19);
    return system ? [system, ...recent] : recent;
}

// ===== 发送用户消息 =====
async function sendUserMessage() {
    let inp = document.getElementById('chatInput');
    let msg = inp.value.trim();
    if (!msg || isWaitingReply) return;

    // 防止重复发送：禁用发送按钮
    let btn = document.getElementById('sendChatBtn');
    if (btn) btn.disabled = true;

    addMessageToUI('user', msg);
    isWaitingReply = true;
    showTypingIndicator();
    try {
        // 外发前按设置脱敏（默认开启），本地 UI 显示仍为原文
        const shouldMask = typeof systemSettings !== 'undefined' && systemSettings.defaultDesensitize;
        const safeMsg = shouldMask ? desensitizeText(msg) : msg;
        conversationHistory.push({ role: "user", content: safeMsg });
        let res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: buildPayload() })
        });
        if (!res.ok) {
            let errText;
            try { errText = (await res.json()).error || res.statusText; } catch { errText = res.statusText; }
            throw new Error(`HTTP ${res.status}: ${errText}`);
        }
        let data = await res.json();
        let reply = data.choices?.[0]?.message?.content || t('chat.noReply');
        conversationHistory.push({ role: "assistant", content: reply });
        removeTypingIndicator();
        addMessageToUI('bot', reply);
    } catch (e) {
        removeTypingIndicator();
        addMessageToUI('bot', t('chat.requestFailed') + e.message);
        console.error('Chat error:', e);
    } finally {
        // 无论成功失败都清空输入框
        inp.value = '';
        isWaitingReply = false;
        if (btn) btn.disabled = false;
    }
}

// ===== 清空对话 =====
function clearChat() {
    conversationHistory = [{
        role: "system",
        content: buildSystemPrompt()
    }];
    isWaitingReply = false;
    chatCleared = true;
    let container = document.getElementById('chatMessages');
    if (container) {
        container.innerHTML = '<div class="message bot"><div class="message-avatar bot-avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><div class="message-bubble">' + t('chat.cleared') + '</div></div>';
    }
    let btn = document.getElementById('sendChatBtn');
    if (btn) btn.disabled = false;
}

// 语言切换时：重建系统提示词，并在无对话记录时重渲染欢迎/清空提示
document.addEventListener('languagechange', function () {
    if (conversationHistory.length && conversationHistory[0].role === 'system') {
        conversationHistory[0].content = buildSystemPrompt();
    }
    const container = document.getElementById('chatMessages');
    if (container && conversationHistory.length <= 1 && !isWaitingReply) {
        const bubble = container.querySelector('.message-bubble');
        if (bubble) bubble.textContent = t(chatCleared ? 'chat.cleared' : 'chat.welcome');
    }
});

// 暴露给全局
window.conversationHistory = conversationHistory;
window.addMessageToUI = addMessageToUI;
window.sendUserMessage = sendUserMessage;
window.clearChat = clearChat;
window.showTypingIndicator = showTypingIndicator;
window.removeTypingIndicator = removeTypingIndicator;
