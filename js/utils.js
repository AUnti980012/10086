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
        return `<pre style="background:rgba(0,0,0,0.25);padding:12px 14px;border-radius:8px;overflow-x:auto;font-size:13px;font-family:'SF Mono','Fira Code','Courier New',monospace;line-height:1.5;"><code>${code.trim()}</code></pre>`;
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
    html = html.replace(/^&gt;\s?(.+)$/gm, '<blockquote style="border-left:3px solid var(--border-mid);padding-left:10px;color:var(--text-secondary);margin:6px 0;">$1</blockquote>');

    // 7. 行内代码 `text`
    html = html.replace(/`(.+?)`/g, '<code style="background:rgba(0,0,0,0.2);padding:1px 5px;border-radius:3px;font-size:13px;font-family:\'SF Mono\',\'Fira Code\',\'Courier New\',monospace;">$1</code>');

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
