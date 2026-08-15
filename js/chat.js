/**
 * 聊天功能模块
 * 包含：消息渲染（Markdown支持）、用户发送、AI回复、打字指示器
 */

// ===== 构建 system prompt（注入反诈关键词知识库） =====
function buildSystemPrompt() {
    let base = "你是反诈科普与思政教育智能助手，专为大学生服务。结合法治意识、诚信责任，解析诈骗套路，给出预防建议，语气温和专业。";
    const knowledge = window.antiFraudKnowledge || [];
    if (knowledge.length) {
        base += "\n\n以下是你必须掌握的权威反诈关键词知识（含警方提示），回答相关问题时优先引用：\n" +
            knowledge.map(k => `【${k.keyword}】${k.desc} 警方提示：${k.tip}`).join('\n');
    }
    return base;
}

let conversationHistory = [{
    role: "system",
    content: buildSystemPrompt()
}];
let isWaitingReply = false;

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
    { text: '思考中', icon: '💭', minSec: 0 },
    { text: '寻找中', icon: '🔎', minSec: 1.5 },
    { text: '组织语言中', icon: '📝', minSec: 3 },
];

function showTypingIndicator() {
    removeTypingIndicator();
    let container = document.getElementById('chatMessages');
    if (!container) return;
    typingStartTime = Date.now();
    let div = document.createElement('div');
    div.id = 'typingIndicator';
    div.className = 'message bot';
    div.innerHTML = '<div class="message-avatar bot-avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><div class="typing-status" id="typingStatus"><span class="typing-icon">💭</span> <span class="typing-text">思考中</span> <span class="typing-time">(0.0s)</span><span class="typing-dots"><span>.</span><span>.</span><span>.</span></span></div>';
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
        timeEl.querySelector('.typing-icon').textContent = state.icon;
        timeEl.querySelector('.typing-text').textContent = state.text;
        timeEl.querySelector('.typing-time').textContent = `(${elapsed.toFixed(1)}s)`;
    }, 200);
}

function removeTypingIndicator() {
    if (typingInterval) { clearInterval(typingInterval); typingInterval = null; }
    let ind = document.getElementById('typingIndicator');
    if (ind) ind.remove();
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
        conversationHistory.push({ role: "user", content: msg });
        let res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: conversationHistory.slice(-20) })
        });
        if (!res.ok) {
            let errText;
            try { errText = (await res.json()).error || res.statusText; } catch { errText = res.statusText; }
            throw new Error(`HTTP ${res.status}: ${errText}`);
        }
        let data = await res.json();
        let reply = data.choices?.[0]?.message?.content || '抱歉，未收到有效回复';
        conversationHistory.push({ role: "assistant", content: reply });
        removeTypingIndicator();
        addMessageToUI('bot', reply);
    } catch (e) {
        removeTypingIndicator();
        addMessageToUI('bot', `请求失败：${e.message}`);
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
    let container = document.getElementById('chatMessages');
    if (container) {
        container.innerHTML = '<div class="message bot"><div class="message-avatar bot-avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><div class="message-bubble">对话已清空，请问有什么可以帮助你的？</div></div>';
    }
    let btn = document.getElementById('sendChatBtn');
    if (btn) btn.disabled = false;
}

// 暴露给全局
window.conversationHistory = conversationHistory;
window.addMessageToUI = addMessageToUI;
window.sendUserMessage = sendUserMessage;
window.clearChat = clearChat;
window.showTypingIndicator = showTypingIndicator;
window.removeTypingIndicator = removeTypingIndicator;
