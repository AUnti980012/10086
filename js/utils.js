/**
 * 工具函数模块
 * 包含：HTML转义、Markdown渲染、脱敏、加载器控制
 */

// ===== HTML实体转义（防XSS） =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== 轻量级Markdown渲染 =====
function renderMarkdown(text) {
    let html = escapeHtml(text);
    // 加粗 **text**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // 斜体 *text*（兼容半角 * 和全角 ＊）
    html = html.replace(/[＊*](.+?)[＊*]/g, '<em>$1</em>');
    // 行内代码 `text`
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');
    // 引用 > text
    html = html.replace(/^&gt;\s?(.+)$/gm, '<blockquote>$1</blockquote>');
    // 无序列表 - item
    html = html.replace(/^- \s?(.+)$/gm, '<div style="padding-left:16px;">• $1</div>');
    return html;
}

// ===== 脱敏函数（修复正则顺序：先长匹配后短匹配） =====
function desensitizeText(text) {
    // 1. 先处理身份证号(15/18位，带边界)
    text = text.replace(/\b\d{17}[\dXx]\b|\b\d{15}\b/g, (m) => m.slice(0, 6) + '********' + m.slice(-4));
    // 2. 再处理手机号(11位，带边界)
    text = text.replace(/\b1[3-9]\d{9}\b/g, (m) => m.slice(0, 3) + '****' + m.slice(7));
    // 3. 最后处理银行卡号(16-19位，以常见银行卡前缀开头：62/4/5)
    text = text.replace(/\b(62|4[0-9]|5[1-5])\d{4}(\d{8,10})\d{4}\b/g, (m) => m.slice(0, 6) + '***********' + m.slice(-4));
    return text;
}

// ===== 加载器控制 =====
function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'flex';
}

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 500);
    }
}

// ===== Toast 通知组件 =====
let toastQueue = [];
let toastActive = false;

function showToast(message, type = 'success') {
    // type: 'success' | 'error' | 'warning'
    const icons = { success: '✓', error: '✕', warning: '⚠' };
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${icons[type] || '●'}</span>
        <span>${message}</span>
        <button class="toast-close" aria-label="关闭">×</button>
    `;
    toast.querySelector('.toast-close').addEventListener('click', () => dismissToast(toast));
    container.appendChild(toast);

    // 3秒后自动消失
    const timer = setTimeout(() => dismissToast(toast), 3000);
    toast._timer = timer;
}

function dismissToast(toast) {
    if (toast._dismissed) return;
    toast._dismissed = true;
    clearTimeout(toast._timer);
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
}
