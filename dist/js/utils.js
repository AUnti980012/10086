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
    // 斜体 *text*
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
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
    // 3. 最后处理银行卡号(16-19位，带边界)
    text = text.replace(/\b\d{6}(\d{8,10})\d{4}\b/g, (m) => m.slice(0, 6) + '***********' + m.slice(-4));
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
