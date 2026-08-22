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

    // 1. 代码块（ fenced code block，必须在行内代码之前处理）
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
        return `<pre style="background:var(--bg-elevated);padding:12px 14px;border-radius:8px;overflow-x:auto;font-size:13px;font-family:'SF Mono','Fira Code','Menlo',monospace;line-height:1.5;"><code>${code.trim()}</code></pre>`;
    });

    // 2. 水平线 ---
    html = html.replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid var(--border-subtle);margin:12px 0;">');

    // 3. 标题（支持 # 到 ######）
    html = html.replace(/^######\s+(.+)$/gm, '<h6 style="font-size:13px;color:var(--text-secondary);margin:8px 0 4px;">$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5 style="font-size:14px;color:var(--text-secondary);margin:10px 0 4px;">$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4 style="font-size:16px;font-weight:700;color:var(--text-primary);margin:12px 0 6px;">$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3 style="font-size:17px;font-weight:700;color:var(--primary);margin:14px 0 6px;">$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2 style="font-size:19px;font-weight:700;color:var(--primary);margin:16px 0 8px;">$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1 style="font-size:22px;font-weight:700;color:var(--primary);margin:18px 0 8px;">$1</h1>');

    // 4. 有序列表（先检测有序列表块，再逐项处理）
    //    匹配连续的数字+点开头的行
    html = html.replace(/((?:^\d+\.\s+.+\n?)+)/gm, (match) => {
        const items = match.trim().split(/\n/).map(line => {
            return '<li style="padding-left:20px;position:relative;">' + line.replace(/^\d+\.\s+/, '') + '</li>';
        }).join('');
        return `<ol style="margin:4px 0 8px 0;padding-left:24px;">${items}</ol>`;
    });

    // 5. 无序列表（- item）
    html = html.replace(/^- \s?(.+)$/gm, '<div style="padding-left:20px;position:relative;"><span style="position:absolute;left:4px;">•</span>$1</div>');

    // 6. 引用（> text）
    html = html.replace(/^&gt;\s?(.+)$/gm, '<blockquote style="border-left:3px solid var(--border-medium);padding-left:10px;color:var(--text-secondary);margin:6px 0;">$1</blockquote>');

    // 7. 行内代码 `text`
    html = html.replace(/`(.+?)`/g, '<code style="background:var(--bg-elevated);padding:1px 5px;border-radius:4px;font-size:13px;font-family:\'SF Mono\',\'Fira Code\',\'Menlo\',monospace;">$1</code>');

    // 8. 加粗 **text**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // 9. 斜体 *text*（兼容半角 * 和全角 ＊）
    html = html.replace(/[＊*](.+?)[＊*]/g, '<em>$1</em>');

    // 10. 段落换行：将连续两行以上的空行转为 <br> 分隔的段落
    html = html.replace(/\n{2,}/g, '<br><br>');

    // 11. 剩余换行转为 <br>
    html = html.replace(/\n/g, '<br>');

    return html;
}

// ===== 脱敏函数（修复正则顺序：先长匹配后短匹配） =====
function desensitizeText(text) {
    // 1. 先处理身份证号(15/18位，带边界)
    text = text.replace(/\b\d{17}[\dXx]\b|\b\d{15}\b/g, (m) => m.slice(0, 6) + '********' + m.slice(-4));
    // 2. 再处理手机号(11位，带边界)
    text = text.replace(/\b1[3-9]\d{9}\b/g, (m) => m.slice(0, 3) + '****' + m.slice(7));
    // 3. 最后处理银行卡号(16-19位，以常见银行卡前缀开头：62/4/5)
    text = text.replace(/\b(62|4[0-9]|5[1-5])\d{14,17}\b/g, (m) => m.slice(0, 6) + '***********' + m.slice(-4));
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

// ===== 统一 SVG 图标库（单一线宽 1.8，随 currentColor 着色，尺寸 1em 跟随字号） =====
window.ICONS = (function () {
    const svg = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
    return {
        home: svg('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'),
        search: svg('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'),
        chart: svg('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>'),
        doc: svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>'),
        history: svg('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
        settings: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>'),
        chat: svg('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
        sun: svg('<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'),
        moon: svg('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'),
        check: svg('<polyline points="20 6 9 17 4 12"/>'),
        close: svg('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'),
        warning: svg('<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'),
        zap: svg('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'),
    };
})();

// ===== Toast 通知组件 =====
function showToast(message, type = 'success') {
    // type: 'success' | 'error' | 'warning'
    const icons = { success: ICONS.check, error: ICONS.close, warning: ICONS.warning };
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || ICONS.check}</span>
        <span>${escapeHtml(message)}</span>
        <button class="toast-close" aria-label="${t('common.close')}">${ICONS.close}</button>
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
