/**
 * 聊天功能模块
 * 包含：消息渲染（Markdown支持）、用户发送、AI回复、打字指示器
 */

let conversationHistory = [{
    role: "system",
    content: "你是反诈科普与思政教育智能助手，专为大学生服务。结合法治意识、诚信责任，解析诈骗套路，给出预防建议，语气温和专业。"
}];
let isWaitingReply = false;

// ===== 添加消息到UI（用户消息不做Markdown，AI消息渲染Markdown） =====
function addMessageToUI(sender, text) {
    let container = document.getElementById('chatMessages');
    if (!container) return;
    let div = document.createElement('div');
    div.className = `message ${sender}`;
    let bubbleContent = sender === 'user' ? escapeHtml(text) : renderMarkdown(text);
    div.innerHTML = `<div class="message-avatar">${sender==='user'?'我':'🤖'}</div><div class="message-bubble">${bubbleContent}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// ===== 显示/隐藏打字指示器 =====
function showTypingIndicator() {
    removeTypingIndicator();
    let container = document.getElementById('chatMessages');
    if (!container) return;
    let div = document.createElement('div');
    div.id = 'typingIndicator';
    div.className = 'message bot';
    div.innerHTML = '<div class="message-avatar">🤖</div><div class="typing-indicator"><span></span><span></span><span></span></div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
    let ind = document.getElementById('typingIndicator');
    if (ind) ind.remove();
}

// ===== 发送用户消息 =====
async function sendUserMessage() {
    let inp = document.getElementById('chatInput');
    let msg = inp.value.trim();
    if (!msg || isWaitingReply) return;
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
        inp.value = ''; // 成功后才清空输入
    } catch (e) {
        removeTypingIndicator();
        addMessageToUI('bot', `请求失败：${e.message}`);
        inp.value = msg; // 失败时恢复用户输入
        console.error('Chat error:', e);
    } finally {
        isWaitingReply = false;
        let btn = document.getElementById('sendChatBtn');
        if (btn) btn.disabled = false;
    }
}

// ===== 清空对话 =====
function clearChat() {
    conversationHistory = [{
        role: "system",
        content: "你是反诈科普与思政教育智能助手，专为大学生服务。结合法治意识、诚信责任，解析诈骗套路，给出预防建议，语气温和专业。"
    }];
    isWaitingReply = false;
    let container = document.getElementById('chatMessages');
    if (container) {
        container.innerHTML = '<div class="message bot"><div class="message-avatar">🤖</div><div class="message-bubble">对话已清空，请问有什么可以帮助你的？</div></div>';
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
