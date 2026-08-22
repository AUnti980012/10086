/**
 * 主应用逻辑模块
 * 包含：表单验证、报案生成、账单解析、PDF导出、历史记录、设置、导航、初始化
 */

// ===== 图片灯箱功能 =====
function initImageLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCounter = document.getElementById('lightboxCounter');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    const backdrop = lightbox?.querySelector('.lightbox-backdrop');

    let currentIndex = 0;
    let thumbnails = [];

    // 事件委托：监听容器级 click，避免重复绑定
    const identifyPreview = document.getElementById('identifyPreview');
    const reportPreview = document.getElementById('reportPreview');

    function handleClick(e) {
        const item = e.target.closest('.preview-item');
        if (!item) return;
        const img = item.querySelector('img');
        if (!img) return;

        // 收集所有缩略图的 src
        const container = item.parentElement;
        thumbnails = Array.from(container.querySelectorAll('.preview-item img')).map(i => i.src);
        currentIndex = thumbnails.indexOf(img.src);
        openLightbox();
    }

    identifyPreview?.addEventListener('click', handleClick);
    reportPreview?.addEventListener('click', handleClick);

    function openLightbox() {
        if (!lightbox || !thumbnails[currentIndex]) return;
        lightboxImg.src = thumbnails[currentIndex];
        lightboxCounter.textContent = `${currentIndex + 1} / ${thumbnails.length}`;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showPrev() {
        if (thumbnails.length <= 1) return;
        currentIndex = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
        lightboxImg.src = thumbnails[currentIndex];
        lightboxCounter.textContent = `${currentIndex + 1} / ${thumbnails.length}`;
    }

    function showNext() {
        if (thumbnails.length <= 1) return;
        currentIndex = (currentIndex + 1) % thumbnails.length;
        lightboxImg.src = thumbnails[currentIndex];
        lightboxCounter.textContent = `${currentIndex + 1} / ${thumbnails.length}`;
    }

    closeBtn?.addEventListener('click', closeLightbox);
    backdrop?.addEventListener('click', closeLightbox);
    prevBtn?.addEventListener('click', showPrev);
    nextBtn?.addEventListener('click', showNext);

    // 键盘支持
    document.addEventListener('keydown', (e) => {
        if (!lightbox?.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'ArrowRight') showNext();
    });

    // 触摸滑动支持
    let touchStartX = 0;
    lightboxImg?.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    lightboxImg?.addEventListener('touchend', (e) => {
        const diff = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) showPrev();
            else showNext();
        }
    }, { passive: true });
}

// ===== 全局变量 =====
let historyRecords = [];
let systemSettings = { autoSave: true, defaultDesensitize: true };
let globalOcrText = '';
let globalUserInputText = '';
let currentStep = 1;

// ===== 语料标签（随语言切换重渲染） =====
let corpusLabelKey = 'identify.allTypes';
function setCorpusLabel(key) {
    corpusLabelKey = key;
    const el = document.getElementById('corpusLabel');
    if (el) el.textContent = t(key);
}

// 语言切换：重渲染动态文案
document.addEventListener('languagechange', function () {
    setCorpusLabel(corpusLabelKey);
    renderHistory();
    updateEvidenceTextBox();
});

// ===== localStorage安全读写（try/catch保护） =====
function safeLocalStorageGet(key, defaultVal) {
    try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
    } catch (e) { /* 数据损坏，使用默认值 */ }
    return defaultVal;
}

function safeLocalStorageSet(key, val) {
    try {
        localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
        // 配额溢出时提示用户
        if (e.name === 'QuotaExceededError' || e.code === 22) {
            showToast(t('toast.storageFull'), 'warning');
        }
    }
}

function safeLocalStorageRemove(key) {
    try {
        localStorage.removeItem(key);
    } catch (e) { /* 静默忽略 */ }
}

// ===== 证据文本框更新 =====
function updateEvidenceTextBox() {
    let evidenceDiv = document.getElementById('evidenceTextBox');
    if (!evidenceDiv) return;
    let parts = [];
    if (globalOcrText.trim()) parts.push(t('evidence.ocrLabel') + '\n' + globalOcrText.trim());
    if (globalUserInputText.trim()) parts.push(t('evidence.userLabel') + '\n' + globalUserInputText.trim());
    evidenceDiv.textContent = parts.join('\n\n---\n\n');
    if (!parts.length) evidenceDiv.textContent = '';
}

// ===== 从识别页导入证据文本 =====
function importEvidenceFromIdentify() {
    let fraudTextarea = document.getElementById('fraudText');
    if (!fraudTextarea) return;
    let userText = fraudTextarea.value.trim();
    if (userText) {
        globalUserInputText = userText;
    }
    updateEvidenceTextBox();
    if (globalOcrText.trim() || globalUserInputText.trim()) {
        showToast(t('evidence.imported'), 'success');
    } else {
        showToast(t('evidence.noneToImport'), 'warning');
    }
}

// ===== 清空证据文本 =====
function clearEvidenceText() {
    if (confirm(t('evidence.clearConfirm'))) {
        globalOcrText = '';
        globalUserInputText = '';
        updateEvidenceTextBox();
    }
}

// ===== 步骤导航 =====
function showStep(step) {
    const direction = step > currentStep ? 'next' : 'prev';
    // 隐藏所有步骤
    document.querySelectorAll('.step-content').forEach(el => {
        el.style.display = 'none';
        el.classList.remove('slide-next', 'slide-prev');
    });
    // 显示目标步骤
    let target = document.getElementById('step' + step);
    if (target) {
        target.style.display = 'block';
        // 重新触发动画
        target.classList.remove('step-content', 'slide-next', 'slide-prev');
        void target.offsetWidth; // force reflow
        target.classList.add('step-content', direction === 'next' ? 'slide-next' : 'slide-prev');
    }
    // 更新步骤指示器
    document.querySelectorAll('.step-item').forEach((item, idx) => {
        let s = idx + 1;
        item.classList.remove('step-active', 'step-completed');
        if (s === step) item.classList.add('step-active');
        else if (s < step) item.classList.add('step-completed');
    });
    // 更新连接线
    document.querySelectorAll('.step-connector').forEach((conn, idx) => {
        conn.classList.toggle('completed', idx < step - 1);
    });
    currentStep = step;
}

// ===== 身份证号校验（GB 11643-1999，含校验位） =====
function isValidIdNo(v) {
    if (!/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/.test(v)) return false;
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const codes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    let sum = 0;
    for (let i = 0; i < 17; i++) sum += parseInt(v[i], 10) * weights[i];
    return codes[sum % 11] === v[17].toUpperCase();
}

// ===== 必填字段统一定义（按步骤分组，供 validateStep / validateReportForm 复用） =====
const REPORT_FIELDS = [
    { step: 1, id: 'formName', getValue: () => document.getElementById('name').value.trim(), test: v => !!v },
    { step: 1, id: 'formIdNo', getValue: () => document.getElementById('idNo').value.trim().toUpperCase(), test: isValidIdNo },
    { step: 1, id: 'formPhone', getValue: () => document.getElementById('phone').value.trim(), test: v => /^1[0-9]{10}$/.test(v) },
    { step: 2, id: 'formAccusedName', getValue: () => document.getElementById('accusedName').value.trim(), test: v => !!v },
    { step: 3, id: 'formTime', getValue: () => document.getElementById('fraudTime').value.trim(), test: v => !!v },
    { step: 3, id: 'formLocation', getValue: () => document.getElementById('fraudLocation').value.trim(), test: v => !!v },
    { step: 3, id: 'formPlatform', getValue: () => document.getElementById('fraudPlatform').value.trim(), test: v => !!v },
    { step: 3, id: 'formType', getValue: () => document.getElementById('fraudType').value.trim(), test: v => !!v },
    { step: 3, id: 'formMoney', getValue: () => document.getElementById('fraudMoney').value.trim(), test: v => /^(\d+)(\.\d{1,2})?$/.test(v) && parseFloat(v) > 0 },
    { step: 3, id: 'formDetail', getValue: () => document.getElementById('fraudDetail').value.trim(), test: v => !!v },
];

// ===== 校验一组字段，聚焦首个错误项 =====
function validateFields(fields) {
    let isValid = true;
    let firstError = null;
    fields.forEach(f => {
        const val = f.getValue();
        if (!f.test(val)) {
            markError(f.id, true);
            isValid = false;
            if (!firstError) firstError = document.getElementById(f.id);
        } else {
            markError(f.id, false);
        }
    });
    // 聚焦第一个错误字段
    if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = firstError.querySelector('input, textarea');
        if (input) input.focus();
    }
    return isValid;
}

function validateStep(step) {
    return validateFields(REPORT_FIELDS.filter(f => f.step === step));
}

function validateReportForm() {
    return validateFields(REPORT_FIELDS);
}

function markError(formId, isError) {
    let group = document.getElementById(formId);
    if (group) {
        if (isError) group.classList.add('error');
        else group.classList.remove('error');
        // 同步 aria-invalid 给读屏（读屏可感知校验失败状态）
        const input = group.querySelector('input, textarea, select');
        if (input) {
            if (isError) input.setAttribute('aria-invalid', 'true');
            else input.removeAttribute('aria-invalid');
        }
    }
}

// ===== 生成报案报告 =====
let reportSnapshot = null; // 保存报案快照
let reportText = ''; // 保存报告纯文本，供 TXT 导出 / 复制全文使用

function generateReport() {
    // 生成前先校验全部必填项（含第三步）
    if (!validateReportForm()) return;
    // 收集当前表单所有字段
    let formData = {
        name: document.getElementById('name').value.trim(),
        idNo: document.getElementById('idNo').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim() || t('report.unfilled'),
        accusedName: document.getElementById('accusedName').value.trim() || t('report.unknown'),
        accusedPhone: document.getElementById('accusedPhone').value.trim() || t('report.unknown'),
        accusedWechat: document.getElementById('accusedWechat').value.trim() || t('report.unknown'),
        accusedAlipay: document.getElementById('accusedAlipay').value.trim() || t('report.unknown'),
        accusedBankCard: document.getElementById('accusedBankCard').value.trim() || t('report.unknown'),
        accusedAddress: document.getElementById('accusedAddress').value.trim() || t('report.unknown'),
        fraudTime: document.getElementById('fraudTime').value.trim(),
        fraudLocation: document.getElementById('fraudLocation').value.trim(),
        contactMethod: document.getElementById('contactMethod').value.trim() || t('report.unfilled'),
        fraudPlatform: document.getElementById('fraudPlatform').value.trim(),
        fraudType: document.getElementById('fraudType').value.trim(),
        fraudMoney: document.getElementById('fraudMoney').value.trim(),
        fraudDetail: document.getElementById('fraudDetail').value.trim(),
        evidenceCount: reportImages?.length || 0,
        hasOcr: globalOcrText.trim() ? true : false,
        hasUserInput: globalUserInputText.trim() ? true : false,
        ocrText: globalOcrText.trim(),
        userInputText: globalUserInputText.trim(),
        generatedAt: new Date().toISOString()
    };

    // 保存快照
    reportSnapshot = formData;

    // 生成报告文本
    let moneyVal = parseFloat(formData.fraudMoney);
    if (isNaN(moneyVal)) moneyVal = 0;
    let money = moneyVal.toFixed(2);

    let report = `${t('report.doc.title')}

${t('report.doc.about', { name: formData.accusedName })}

${t('report.doc.to')}

${t('report.doc.complainantInfo')}
${t('report.doc.name')}${formData.name}
${t('report.doc.idNo')}${formData.idNo}
${t('report.doc.phone')}${formData.phone}
${t('report.doc.address')}${formData.address}

${t('report.doc.accusedInfo')}
${t('report.doc.accusedName')}${formData.accusedName}
${t('report.doc.accusedPhone')}${formData.accusedPhone}
${t('report.doc.accusedWechat')}${formData.accusedWechat}
${t('report.doc.accusedAlipay')}${formData.accusedAlipay}
${t('report.doc.accusedBankCard')}${formData.accusedBankCard}
${t('report.doc.accusedAddress')}${formData.accusedAddress}

${t('report.doc.relief')}
${t('report.doc.reliefBody', { name: formData.accusedName })}

${t('report.doc.facts')}
${t('report.doc.facts1')}
${t('report.doc.fraudTime')}${formData.fraudTime}
${t('report.doc.fraudLocation')}${formData.fraudLocation}
${t('report.doc.contactMethod')}${formData.contactMethod}
${t('report.doc.fraudPlatform')}${formData.fraudPlatform}
${t('report.doc.fraudType')}${formData.fraudType}
${t('report.doc.fraudMoney', { money: money })}

${t('report.doc.facts2')}
${formData.fraudDetail}

${t('report.doc.facts3')}
${t('report.doc.legalAnalysis')}

${t('report.doc.evidenceList')}
${t('report.doc.evidence1')}
${t('report.doc.evidence2', { count: formData.evidenceCount })}
${t('report.doc.evidence3')}
${formData.hasOcr ? t('report.doc.evidence4') + '\n' : ''}${formData.hasUserInput ? t('report.doc.evidence5') + '\n' : ''}
${t('report.doc.evidenceAttachment')}${formData.hasOcr ? '\n\n' + t('report.doc.ocrText') + '\n' + formData.ocrText : ''}${formData.hasUserInput ? '\n\n' + t('report.doc.userText') + '\n' + formData.userInputText : ''}

${t('report.doc.conclusion', { name: formData.accusedName })}

${t('report.doc.closing')}

${t('report.doc.complainant')}${formData.name}
${t('report.doc.date')}${new Date().toLocaleDateString((window.I18N.current === 'en' ? 'en-US' : (window.I18N.current === 'ru' ? 'ru-RU' : 'zh-CN')))}
${t('report.doc.frame')}`;

    reportText = report; // 保存纯文本供 TXT 导出 / 复制全文（保持原格式不变）

    let resultDiv = document.getElementById('reportResult');
    resultDiv.innerHTML = renderReportHtml(formData, money);
    resultDiv.classList.add('show');
    if (systemSettings.autoSave) addHistory('report', formData);
}

// ===== 生成报案报告的排版化 HTML（预览用，内容与纯文本一致，仅去等号 + 语义标签） =====
function renderReportHtml(data, money) {
    const esc = escapeHtml;
    const escNl = (s) => escapeHtml(s).replace(/\n/g, '<br>');
    const title = t('report.doc.title').replace(/[=]+/g, '').trim();
    const dateStr = new Date().toLocaleDateString((window.I18N.current === 'en' ? 'en-US' : (window.I18N.current === 'ru' ? 'ru-RU' : 'zh-CN')));

    const rows = [];
    rows.push('<h1 class="doc-title">' + esc(title) + '</h1>');
    rows.push('<h2 class="doc-subtitle">' + esc(t('report.doc.about', { name: data.accusedName })) + '</h2>');
    rows.push('<div class="doc-info">' + esc(t('report.doc.to')) + '</div>');

    rows.push('<h3 class="doc-section">' + esc(t('report.doc.complainantInfo')) + '</h3>');
    rows.push('<div class="doc-info">' + esc(t('report.doc.name') + data.name) + '</div>');
    rows.push('<div class="doc-info">' + esc(t('report.doc.idNo') + data.idNo) + '</div>');
    rows.push('<div class="doc-info">' + esc(t('report.doc.phone') + data.phone) + '</div>');
    rows.push('<div class="doc-info">' + esc(t('report.doc.address') + data.address) + '</div>');

    rows.push('<h3 class="doc-section">' + esc(t('report.doc.accusedInfo')) + '</h3>');
    rows.push('<div class="doc-info">' + esc(t('report.doc.accusedName') + data.accusedName) + '</div>');
    rows.push('<div class="doc-info">' + esc(t('report.doc.accusedPhone') + data.accusedPhone) + '</div>');
    rows.push('<div class="doc-info">' + esc(t('report.doc.accusedWechat') + data.accusedWechat) + '</div>');
    rows.push('<div class="doc-info">' + esc(t('report.doc.accusedAlipay') + data.accusedAlipay) + '</div>');
    rows.push('<div class="doc-info">' + esc(t('report.doc.accusedBankCard') + data.accusedBankCard) + '</div>');
    rows.push('<div class="doc-info">' + esc(t('report.doc.accusedAddress') + data.accusedAddress) + '</div>');

    rows.push('<h3 class="doc-section">' + esc(t('report.doc.relief')) + '</h3>');
    rows.push('<p class="doc-para">' + escNl(t('report.doc.reliefBody', { name: data.accusedName })) + '</p>');

    rows.push('<h3 class="doc-section">' + esc(t('report.doc.facts')) + '</h3>');
    rows.push('<p class="doc-subhead">' + esc(t('report.doc.facts1')) + '</p>');
    rows.push('<div class="doc-info">' + esc(t('report.doc.fraudTime') + data.fraudTime) + '</div>');
    rows.push('<div class="doc-info">' + esc(t('report.doc.fraudLocation') + data.fraudLocation) + '</div>');
    rows.push('<div class="doc-info">' + esc(t('report.doc.contactMethod') + data.contactMethod) + '</div>');
    rows.push('<div class="doc-info">' + esc(t('report.doc.fraudPlatform') + data.fraudPlatform) + '</div>');
    rows.push('<div class="doc-info">' + esc(t('report.doc.fraudType') + data.fraudType) + '</div>');
    rows.push('<div class="doc-info">' + esc(t('report.doc.fraudMoney', { money: money })) + '</div>');

    rows.push('<p class="doc-subhead">' + esc(t('report.doc.facts2')) + '</p>');
    rows.push('<p class="doc-para">' + escNl(data.fraudDetail) + '</p>');

    rows.push('<p class="doc-subhead">' + esc(t('report.doc.facts3')) + '</p>');
    rows.push('<p class="doc-para">' + escNl(t('report.doc.legalAnalysis')) + '</p>');

    rows.push('<h3 class="doc-section">' + esc(t('report.doc.evidenceList')) + '</h3>');
    rows.push('<div class="doc-info">' + esc(t('report.doc.evidence1')) + '</div>');
    rows.push('<div class="doc-info">' + esc(t('report.doc.evidence2', { count: data.evidenceCount })) + '</div>');
    rows.push('<div class="doc-info">' + esc(t('report.doc.evidence3')) + '</div>');
    if (data.hasOcr) rows.push('<div class="doc-info">' + esc(t('report.doc.evidence4')) + '</div>');
    if (data.hasUserInput) rows.push('<div class="doc-info">' + esc(t('report.doc.evidence5')) + '</div>');

    rows.push('<h3 class="doc-section">' + esc(t('report.doc.evidenceAttachment')) + '</h3>');
    if (data.hasOcr) {
        rows.push('<div class="doc-info">' + esc(t('report.doc.ocrText')) + '</div>');
        rows.push('<p class="doc-para">' + escNl(data.ocrText) + '</p>');
    }
    if (data.hasUserInput) {
        rows.push('<div class="doc-info">' + esc(t('report.doc.userText')) + '</div>');
        rows.push('<p class="doc-para">' + escNl(data.userInputText) + '</p>');
    }

    rows.push('<p class="doc-para">' + escNl(t('report.doc.conclusion', { name: data.accusedName })) + '</p>');

    rows.push('<div class="doc-sign">' + escNl(t('report.doc.closing')) + '</div>');
    rows.push('<div class="doc-sign">' + esc(t('report.doc.complainant') + data.name) + '</div>');
    rows.push('<div class="doc-sign">' + esc(t('report.doc.date') + dateStr) + '</div>');

    return '<div class="report-doc">' + rows.join('\n') + '</div>';
}

// ===== 关键词字典懒加载 =====
let kwMapLoaded = false;
let kwMapResolve = null;

function loadKeywordsAsync() {
    if (kwMapLoaded) return Promise.resolve();
    kwMapLoaded = true;

    return new Promise((resolve) => {
        kwMapResolve = resolve;

        // 如果字典已通过独立文件加载完成
        if (window.fraudKeywordsMap) {
            resolve();
            return;
        }

        // 动态注入 <script> 按需加载
        const script = document.createElement('script');
        script.src = 'js/fraud-keywords.js';
        script.async = true;
        script.onload = () => {
            if (kwMapResolve) kwMapResolve();
        };
        script.onerror = () => {
            console.warn('关键词字典加载失败，将使用空字典');
            window.fraudKeywordsMap = {};
            if (kwMapResolve) kwMapResolve();
        };
        document.head.appendChild(script);
    });
}

// ===== 诈骗识别 =====
async function detectFraud() {
    let txt = document.getElementById('fraudText').value.trim();
    let hasImages = identifyImages && identifyImages.length > 0;
    let userTyped = txt; // OCR 前的用户手打文本快照

    // 如果有图片，优先执行 OCR
    if (hasImages) {
        try {
            await ocrImagesWithTesseract(identifyImages);
            txt = document.getElementById('fraudText').value.trim();
        } catch (e) {
            showToast(t('ocr.failed') + e.message, 'error');
            return;
        }
    }

    if (!txt && !hasImages) {
        showToast(t('detect.needTextOrImage'), 'warning');
        return;
    }

    // 关键词检测（懒加载字典）
    if (txt) {
        globalUserInputText = userTyped;
        updateEvidenceTextBox();

        // 确保关键词字典已加载
        await loadKeywordsAsync();

        const lang = window.I18N && window.I18N.current;
        let kwMap = (lang === 'ru' ? (window.fraudKeywordsMapRu || window.fraudKeywordsMap)
            : lang === 'en' ? (window.fraudKeywordsMapEn || window.fraudKeywordsMap)
            : window.fraudKeywordsMap) || {};
        if (!Object.keys(kwMap).length) {
            let resDiv = document.getElementById('detectResult');
            if (resDiv) {
                resDiv.textContent = t('detect.keywordDictNotLoaded');
                resDiv.classList.add('show');
            }
            return;
        }

        // 清除之前的高亮状态
        document.querySelectorAll('.corpus-btn').forEach(btn => {
            btn.classList.remove('highlighted', 'multi-highlighted');
        });

        // 逐个分类检测匹配
        let categories = ['police', 'loan', 'service', 'leader'];
        let matchedCategories = [];

        const hay = txt.toLowerCase(); // 大小写不敏感匹配（英文/俄文）
        for (let cat of categories) {
            let keywords = kwMap[cat];
            if (!keywords) continue;
            let hits = keywords.filter(k => hay.includes(k.toLowerCase()));
            if (hits.length > 0) {
                matchedCategories.push({ cat, keywords: hits, count: hits.length });
                // 高亮对应的按钮
                let btn = document.querySelector(`.corpus-btn[data-type="${cat}"]`);
                if (btn) btn.classList.add('highlighted');
            }
        }

        // 检测"全类型"（all）关键词
        let allKeywords = kwMap.all || [];
        let allHits = allKeywords.filter(k => hay.includes(k.toLowerCase()));

        let result;
        let labelEl = document.getElementById('corpusLabel');

        if (matchedCategories.length === 0 && allHits.length === 0) {
            // 无任何匹配
            result = t('detect.none');
            if (labelEl) setCorpusLabel('identify.allTypes');
        } else if (matchedCategories.length === 0 && allHits.length > 0) {
            // 只有"all"匹配 → 亮起"全类型诈骗"标签（红色）
            result = t('detect.highlySuspicious', { keywords: allHits.join('、'), count: allHits.length });
            if (labelEl) {
                setCorpusLabel('identify.allTypes');
                labelEl.style.color = 'var(--danger)';
                labelEl.style.borderColor = 'var(--danger)';
                labelEl.style.background = 'var(--danger-bg)';
            }
        } else if (matchedCategories.length >= 2) {
            // 多个分类同时匹配 → 红色高亮 + "全类型诈骗"
            let allHitKeywords = [];
            matchedCategories.forEach(m => {
                allHitKeywords.push(...m.keywords);
            });
            result = t('detect.highlySuspicious', { keywords: [...new Set(allHitKeywords)].join('、'), count: allHitKeywords.length });
            // 所有匹配的分类按钮变红
            matchedCategories.forEach(m => {
                let btn = document.querySelector(`.corpus-btn[data-type="${m.cat}"]`);
                if (btn) {
                    btn.classList.remove('highlighted');
                    btn.classList.add('multi-highlighted');
                }
            });
            if (labelEl) {
                setCorpusLabel('identify.allTypes');
                labelEl.style.color = 'var(--danger)';
                labelEl.style.borderColor = 'var(--danger)';
                labelEl.style.background = 'var(--danger-bg)';
            }
        } else if (matchedCategories.length === 1) {
            // 单一分类匹配 → 蓝色高亮 + 显示分类名
            let m = matchedCategories[0];
            let catNames = { police: t('identify.cat.police'), loan: t('identify.cat.loan'), service: t('identify.cat.service'), leader: t('identify.cat.leader') };
            result = t('detect.suspected', { category: catNames[m.cat], keywords: m.keywords.join('、') });
            if (labelEl) {
                setCorpusLabel('identify.cat.' + m.cat);
                labelEl.style.color = '';
                labelEl.style.borderColor = '';
                labelEl.style.background = '';
            }
        }

        let resDiv = document.getElementById('detectResult');
        resDiv.textContent = result;
        resDiv.classList.add('show');
        if (systemSettings.autoSave) addHistory('detect', { result, matchedCategories, allHits, timestamp: Date.now() });
    }
}

// ===== DeepSeek深度判定 =====
async function deepDetect() {
    let txt = document.getElementById('fraudText').value.trim();
    let hasImages = identifyImages && identifyImages.length > 0;
    let userTyped = txt; // OCR 前的用户手打文本快照

    // 如果有图片，先执行 OCR 提取文本
    if (hasImages) {
        try {
            await ocrImagesWithTesseract(identifyImages);
            txt = document.getElementById('fraudText').value.trim();
        } catch (e) {
            showToast(t('ocr.failed') + e.message, 'error');
            return;
        }
    }

    if (!txt) return showToast(t('detect.needInput'), 'warning');
    globalUserInputText = userTyped;
    updateEvidenceTextBox();
    const safeTxt = systemSettings.defaultDesensitize ? desensitizeText(txt) : txt;
    let resDiv = document.getElementById('detectResult');
    resDiv.innerHTML = '<div class="loading-tip"><span class="loading-spin"></span>' + t('detect.deepAnalyzing') + '</div>';
    resDiv.classList.add('show');
    try {
        let resp = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [{ role: "system", content: t('ai.expert') }, { role: "user", content: t('ai.analyzeFraud') + safeTxt }] })
        });
        if (!resp.ok) {
            let errText;
            try { errText = (await resp.json()).error || resp.statusText; } catch { errText = resp.statusText; }
            throw new Error(`HTTP ${resp.status}: ${errText}`);
        }
        let data = await resp.json();
        let reply = data.choices?.[0]?.message?.content || t('ai.analysisDone');
        resDiv.innerHTML = t('detect.deepResult') + renderMarkdown(reply);
        if (systemSettings.autoSave) addHistory('deepDetect', { reply, timestamp: Date.now() });
    } catch (e) {
        resDiv.textContent = t('detect.deepFailedMsg') + e.message;
        console.error('DeepDetect error:', e);
    }
}

// ===== 填充到报案表 =====
function fillToReport() {
    let res = document.getElementById('detectResult').textContent;
    // 只要不是判定失败或空结果，就允许填充
    if (res && !res.includes(t('detect.deepFailed')) && res.trim()) {
        document.getElementById('fraudDetail').value = res;
    }
    let fraudTextarea = document.getElementById('fraudText');
    if (fraudTextarea.value.trim()) {
        globalUserInputText = fraudTextarea.value.trim();
    }
    updateEvidenceTextBox();
    switchPage('reportPage');
}

// ===== 清空识别页 =====
function clearIdentify() {
    document.getElementById('fraudText').value = '';
    document.getElementById('identifyPreview').innerHTML = '';
    identifyImages = [];
    document.getElementById('ocrResult').innerHTML = '';
    document.getElementById('detectResult').classList.remove('show');
    hideOcrProgress();
    // 重置全局变量
    globalOcrText = '';
    globalUserInputText = '';
    updateEvidenceTextBox();
}

// ===== 账单解析 =====
function parseBill() {
    if (typeof XLSX === 'undefined') { showToast(t('bill.xlsxNotLoaded'), 'error'); return; }
    if (!billData) { showToast(t('bill.uploadFirst'), 'warning'); return; }
    let billRes = document.getElementById('billResult');
    billRes.innerHTML = '<div class="loading-tip"><span class="loading-spin"></span>' + t('bill.parsing') + '</div>';
    billRes.classList.add('show');
    setTimeout(() => {
        try {
            let total = 0, records = [];
            if (billData.type === 'csv') {
                let lines = billData.raw.split(/\r?\n/);
                let delim = billData.delimiter || ',';
                // 解析表头，找到金额列的索引
                let headerParts = lines[0].split(delim);
                let amountIdx = -1;
                for (let h = 0; h < headerParts.length; h++) {
                    let col = headerParts[h].trim().toLowerCase();
                    if (col.includes('金额') || col.includes('amount') || col.includes('支出') || col.includes('借方') || col.includes('消费')) {
                        amountIdx = h;
                        break;
                    }
                }
                lines.forEach((l, idx) => {
                    if (idx === 0) return; // 跳过表头
                    let parts = l.split(delim);
                    if (amountIdx >= 0 && parts[amountIdx]) {
                        let num = parseFloat(parts[amountIdx].trim().replace(/[^0-9.-]/g, ''));
                        if (!isNaN(num) && num !== 0) {
                            // 判断是否为支出：负数金额，或包含"支出"/"付款"标记
                            let isExpense = num < 0 || l.includes('支出') || l.includes('付款');
                            if (isExpense) {
                                total += Math.abs(num);
                                records.push(Math.abs(num));
                            }
                        }
                    }
                });
            } else {
                let wb = billData.raw,
                    ws = wb.Sheets[wb.SheetNames[0]],
                    data = XLSX.utils.sheet_to_json(ws);
                data.forEach(row => {
                    // 模糊匹配金额列：遍历所有键，找包含"金额"/"amount"的列
                    let amt = 0;
                    let amtCol = Object.keys(row).find(k =>
                        k.toLowerCase().includes('金额') ||
                        k.toLowerCase().includes('amount') ||
                        k.toLowerCase().includes('发生额') ||
                        k.toLowerCase().includes('交易金额')
                    );
                    if (amtCol !== undefined) {
                        amt = parseFloat(String(row[amtCol]).replace(/[^0-9.-]/g, '')) || 0;
                    }
                    const isExpense = amt < 0 || ['收/支', '收支类型', '交易类型', '资金流向'].some(c => row[c] != null && String(row[c]).includes('支出'));
                    if (isExpense) {
                        total += Math.abs(amt);
                        records.push(Math.abs(amt));
                    }
                });
            }
            billRes.textContent = t('bill.parseDone', { count: records.length, total: total.toFixed(2) });
            billData.parsed = { totalOut: total };
        } catch (e) {
            billRes.textContent = t('bill.parseFailed');
        }
    }, 1000);
}

function billToReport() {
    if (billData?.parsed) {
        document.getElementById('fraudMoney').value = billData.parsed.totalOut;
        switchPage('reportPage');
    } else {
        showToast(t('bill.parseFirst'), 'warning');
    }
}

// ===== 复制/导出 =====
function copyReport() {
    if (reportText) {
        navigator.clipboard.writeText(reportText).then(
            () => showToast(t('report.copied'), 'success'),
            () => showToast(t('report.copyFailed'), 'error')
        );
    } else {
        showToast(t('report.generateFirst'), 'warning');
    }
}

function exportTxt() {
    if (reportText) {
        let blob = new Blob([reportText], { type: 'text/plain' });
        let a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = t('report.fileBase') + '_' + new Date().toISOString().slice(0,10) + '.txt';
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        showToast(t('report.txtDownloaded'), 'success');
    } else {
        showToast(t('report.generateFirst'), 'warning');
    }
}

// ===== PDF 导出（纯文本排版 + 末尾证据图片附加页） =====
let pdfFontBase64 = null;   // 缓存的 PDF 字体 base64（按语言区分）
let pdfFontPromise = null;
let pdfFontName = 'SimSun'; // 当前 PDF 字体名（中文 SimSun / 俄文 DejaVuSans）
let pdfFontLang = null;     // 已缓存字体的语言标识

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
}

async function ensurePdfFont(pdf) {
    const isRu = window.I18N && window.I18N.current === 'ru';
    const url = isRu ? 'fonts/dejavu-sans-subset.ttf' : 'fonts/simsun-subset.ttf';
    const name = isRu ? 'DejaVuSans' : 'SimSun';
    const langTag = isRu ? 'ru' : 'zh';

    // 语言变化时清空旧字体缓存
    if (pdfFontLang !== langTag) {
        pdfFontBase64 = null;
        pdfFontPromise = null;
        pdfFontLang = langTag;
    }

    if (!pdfFontBase64) {
        if (!pdfFontPromise) {
            pdfFontPromise = fetch(url)
                .then(r => { if (!r.ok) throw new Error('font load failed'); return r.arrayBuffer(); })
                .then(buf => { pdfFontBase64 = arrayBufferToBase64(buf); });
        }
        await pdfFontPromise;
    }
    pdfFontName = name;
    pdf.addFileToVFS(name + '.ttf', pdfFontBase64);
    pdf.addFont(name + '.ttf', name, 'normal');
}

// 创建一个带分页与排版状态的 PDF 写入器
function createPdfWriter(pdf) {
    const margin = { left: 20, right: 20, top: 15, bottom: 15 }; // 左右 2cm、上下 1.5cm
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const contentW = pageW - margin.left - margin.right;
    const ptToMm = (pt) => pt * 25.4 / 72;
    let y = margin.top;

    function newPage() { pdf.addPage(); y = margin.top; }

    function gap(mm) {
        y += mm;
        if (y > pageH - margin.bottom) newPage();
    }

    function writeText(text, opts) {
        opts = opts || {};
        const size = opts.size || 12;
        const bold = !!opts.bold;
        const align = opts.align || 'left';
        const lineHeight = opts.lineHeight || 1.5;
        const indentEm = opts.indentEm || 0;
        const keepTogether = opts.keepTogether !== false;

        pdf.setFont(pdfFontName, 'normal');
        pdf.setFontSize(size);
        pdf.setTextColor(0, 0, 0);

        const lineHmm = ptToMm(size) * lineHeight;

        // 首行缩进：中文用全角空格（U+3000），俄文用普通空格（DejaVu 无 U+3000）
        let content = text;
        if (indentEm > 0) content = (window.I18N && window.I18N.current === 'ru' ? ' '.repeat(6) : '　'.repeat(indentEm)) + content;

        const lines = pdf.splitTextToSize(content, contentW);
        const paraHmm = lines.length * lineHmm;

        // 段落整体不被分页截断（等价 page-break-inside: avoid）
        if (keepTogether && lines.length > 1 && y + paraHmm > pageH - margin.bottom && y > margin.top) {
            newPage();
        }

        for (let i = 0; i < lines.length; i++) {
            if (y + lineHmm > pageH - margin.bottom) newPage();
            const line = lines[i];
            let x = margin.left;
            let textAlign = 'left';
            if (align === 'center') { x = margin.left + contentW / 2; textAlign = 'center'; }
            else if (align === 'right') { x = margin.left + contentW; textAlign = 'right'; }

            const opts2 = { align: textAlign };

            // 两端对齐：末行左对齐；首行（含缩进）不撑满
            if (align === 'justify' && i < lines.length - 1 && !(indentEm > 0 && i === 0)) {
                const w = pdf.getTextWidth(line);
                const extra = contentW - w;
                const n = line.length;
                if (n > 1 && extra > 0) {
                    opts2.charSpace = extra / (n - 1); // charSpace 单位为 mm（实测 jsPDF 以 mm 计）
                }
            }

            // 加粗：宋体无独立 bold，用横向微偏移重绘实现伪粗体
            if (bold) {
                pdf.text(line, x - 0.15, y, opts2);
                pdf.text(line, x + 0.15, y, opts2);
            }
            pdf.text(line, x, y, opts2);
            y += lineHmm;
        }
        return y;
    }

    return { writeText, gap, newPage, getY: () => y, margin, contentW, pageW, pageH, ptToMm };
}

function loadImageSize(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => reject(new Error('image load failed'));
        img.src = url;
    });
}

// 证据图片单独成页（等比缩放居中）
async function appendImagePage(pdf, w, imgUrl) {
    const size = await loadImageSize(imgUrl);
    pdf.addPage();
    const pad = 15;
    const maxW = w.pageW - pad * 2;
    const maxH = w.pageH - pad * 2;
    let dw = maxW, dh = (size.h * maxW) / size.w;
    if (dh > maxH) { dh = maxH; dw = (size.w * maxH) / size.h; }
    const x = (w.pageW - dw) / 2;
    const y = (w.pageH - dh) / 2;

    const mime = (imgUrl.match(/^data:image\/(png|jpe?g|gif|webp)/i) || [])[1];
    let format = 'PNG';
    if (mime) {
        const t = mime.toLowerCase();
        if (t === 'jpg' || t === 'jpeg') format = 'JPEG';
        else if (t === 'gif') format = 'GIF';
    }
    pdf.addImage(imgUrl, format, x, y, dw, dh);
}

async function exportPdf() {
    const data = reportSnapshot;
    if (!data) {
        showToast(t('report.generateFirst'), 'warning');
        return;
    }
    try {
        if (typeof window.jspdf === 'undefined') { showToast(t('report.jspdfNotLoaded'), 'error'); return; }
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');

        // 注册 PDF 字体（中文嵌入宋体子集，俄文嵌入 DejaVu Sans 子集，实现真正的文本）
        await ensurePdfFont(pdf);

        const w = createPdfWriter(pdf);
        const title = t('report.doc.title').replace(/[=]+/g, '').trim();
        const dateStr = new Date().toLocaleDateString((window.I18N.current === 'en' ? 'en-US' : (window.I18N.current === 'ru' ? 'ru-RU' : 'zh-CN')));
        let money = parseFloat(data.fraudMoney);
        if (isNaN(money)) money = 0;
        money = money.toFixed(2);

        const info = (text) => w.writeText(text, { size: 12, lineHeight: 1.5, keepTogether: false });
        const section = (text) => { w.gap(3); w.writeText(text, { size: 12, bold: true, lineHeight: 1.5, keepTogether: false }); };
        const para = (text) => { w.gap(1.5); w.writeText(text, { size: 12, lineHeight: 1.5, align: 'justify', indentEm: 2 }); };
        const subhead = (text) => { w.gap(2); w.writeText(text, { size: 12, bold: true, lineHeight: 1.5, keepTogether: false }); };

        // 主标题 / 副标题
        w.writeText(title, { size: 22, bold: true, align: 'center', lineHeight: 1.2 });
        w.gap(4);
        w.writeText(t('report.doc.about', { name: data.accusedName }), { size: 14, bold: true, align: 'center', lineHeight: 1.4 });
        w.gap(4);

        // 致
        info(t('report.doc.to'));

        // 控告人信息
        section(t('report.doc.complainantInfo'));
        info(t('report.doc.name') + data.name);
        info(t('report.doc.idNo') + data.idNo);
        info(t('report.doc.phone') + data.phone);
        info(t('report.doc.address') + data.address);

        // 被控告人信息
        section(t('report.doc.accusedInfo'));
        info(t('report.doc.accusedName') + data.accusedName);
        info(t('report.doc.accusedPhone') + data.accusedPhone);
        info(t('report.doc.accusedWechat') + data.accusedWechat);
        info(t('report.doc.accusedAlipay') + data.accusedAlipay);
        info(t('report.doc.accusedBankCard') + data.accusedBankCard);
        info(t('report.doc.accusedAddress') + data.accusedAddress);

        // 请求事项
        section(t('report.doc.relief'));
        para(t('report.doc.reliefBody', { name: data.accusedName }));

        // 事实与理由
        section(t('report.doc.facts'));
        subhead(t('report.doc.facts1'));
        info(t('report.doc.fraudTime') + data.fraudTime);
        info(t('report.doc.fraudLocation') + data.fraudLocation);
        info(t('report.doc.contactMethod') + data.contactMethod);
        info(t('report.doc.fraudPlatform') + data.fraudPlatform);
        info(t('report.doc.fraudType') + data.fraudType);
        info(t('report.doc.fraudMoney', { money: money }));

        subhead(t('report.doc.facts2'));
        para(data.fraudDetail);

        subhead(t('report.doc.facts3'));
        para(t('report.doc.legalAnalysis'));

        // 证据清单
        section(t('report.doc.evidenceList'));
        info(t('report.doc.evidence1'));
        info(t('report.doc.evidence2', { count: data.evidenceCount }));
        info(t('report.doc.evidence3'));
        if (data.hasOcr) info(t('report.doc.evidence4'));
        if (data.hasUserInput) info(t('report.doc.evidence5'));

        // 证据附件
        section(t('report.doc.evidenceAttachment'));
        if (data.hasOcr) { info(t('report.doc.ocrText')); para(data.ocrText); }
        if (data.hasUserInput) { info(t('report.doc.userText')); para(data.userInputText); }

        // 结论
        para(t('report.doc.conclusion', { name: data.accusedName }));

        // 落款（右对齐）
        w.gap(3);
        w.writeText(t('report.doc.closing'), { size: 12, lineHeight: 1.5, align: 'right', keepTogether: false });
        w.writeText(t('report.doc.complainant') + data.name, { size: 12, lineHeight: 1.5, align: 'right', keepTogether: false });
        w.writeText(t('report.doc.date') + dateStr, { size: 12, lineHeight: 1.5, align: 'right', keepTogether: false });

        // 证据图片：逐张单独成页追加到 PDF 末尾
        if (reportImages && reportImages.length) {
            for (const img of reportImages) {
                await appendImagePage(pdf, w, img.url);
            }
        }

        pdf.save(t('report.fileBase') + '_' + Date.now() + '.pdf');
        showToast(t('report.pdfGenerated'), 'success');
    } catch (error) {
        let msg = t('report.pdfFailed');
        if (error.name === 'AbortError' || error.message?.includes('memory')) {
            msg = t('report.pdfMemoryError');
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
            msg = t('report.pdfNetworkError');
        }
        showToast(msg, 'error');
        console.error(error);
    }
}

// ===== 落盘前对敏感字段脱敏（避免 PII 明文写入 localStorage） =====
function maskPiiForStorage(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const masked = { ...obj };
    ['idNo', 'phone', 'accusedPhone', 'accusedWechat', 'accusedAlipay', 'accusedBankCard'].forEach(k => {
        if (typeof masked[k] === 'string' && masked[k]) masked[k] = desensitizeText(masked[k]);
    });
    return masked;
}

// ===== 历史记录（结构化存储 + 可点击恢复） =====
function addHistory(type, data) {
    // data 现在可以是结构化对象（报案数据、检测结果等）
    let preview = '';
    let displayType = '';
    let icon = '';

    if (type === 'report') {
        // 报案：保存完整表单数据
        preview = t('history.reportPreview', { name: data.name || t('report.unknown'), money: data.fraudMoney || '0', type: data.fraudType || '' });
        displayType = t('history.type.report');
        icon = ICONS.doc;
    } else if (type === 'detect') {
        // 识别：保存检测结果
        preview = data.result || '';
        displayType = t('history.type.detect');
        icon = ICONS.search;
    } else if (type === 'deepDetect') {
        // DeepSeek深度判定
        preview = (data.reply || '').substring(0, 80) + '...';
        displayType = t('history.type.deepDetect');
        icon = ICONS.zap;
    } else {
        // 其他类型
        preview = typeof data === 'string' ? data.substring(0, 100) : String(data);
        displayType = type;
        icon = ICONS.doc;
    }

    const storedData = type === 'report' ? maskPiiForStorage(data) : data;
    let record = {
        id: Date.now(),
        time: new Date().toLocaleString(),
        type,
        data: storedData, // 敏感字段已脱敏
        preview,
        displayType,
        icon
    };

    historyRecords.unshift(record);
    // 限制最多 30 条（每条包含完整数据，体积较大）
    historyRecords = historyRecords.slice(0, 30);
    safeLocalStorageSet('fraudHistory', historyRecords);
    renderHistory();
}

function historyTypeLabel(record) {
    const map = { report: 'history.type.report', detect: 'history.type.detect', deepDetect: 'history.type.deepDetect' };
    const key = map[record.type];
    return key ? t(key) : (record.displayType || record.type);
}

function renderHistory() {
    let listDiv = document.getElementById('historyList');
    if (!listDiv) return;
    if (!historyRecords.length) {
        listDiv.innerHTML = '<div class="history-empty">' + t('history.empty') + '</div>';
        return;
    }

    let html = '';
    for (let r of historyRecords) {
        html += `<div class="history-item" data-id="${r.id}" tabindex="0" role="button" style="cursor:pointer;" title="${t('history.itemTitle')}">
            <div class="history-header">
                <span>${r.icon || ICONS.doc} ${historyTypeLabel(r)}</span>
                <span>${r.time}</span>
            </div>
            <div style="font-size:13px;color:var(--text-secondary);margin-bottom:4px;">${escapeHtml(r.preview || '').substring(0, 80)}</div>
            <div style="display:flex;gap:6px;">
                <button class="btn btn-default restore-btn" data-id="${r.id}" style="padding:4px 10px;font-size:11px;min-height:auto;border-radius:4px;">${t('history.restore')}</button>
                <button class="btn btn-default detail-btn" data-id="${r.id}" style="padding:4px 10px;font-size:11px;min-height:auto;border-radius:4px;">${t('history.detail')}</button>
                <button class="btn btn-default delete-btn" data-id="${r.id}" style="padding:4px 10px;font-size:11px;min-height:auto;border-radius:4px;color:var(--danger);">${t('history.delete')}</button>
            </div>
        </div>`;
    }
    listDiv.innerHTML = html;

    // 事件委托绑定
    listDiv.querySelectorAll('.history-item').forEach(item => {
        const activate = () => restoreHistoryRecord(item.dataset.id);
        item.addEventListener('click', (e) => {
            // 如果点击的是按钮则不触发卡片点击
            if (e.target.tagName === 'BUTTON') return;
            activate();
        });
        item.addEventListener('keydown', (e) => {
            // 键盘可达：Enter/Space 触发恢复（按钮自身已原生支持）
            if (e.target.tagName === 'BUTTON') return;
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
        });
    });
    listDiv.querySelectorAll('.restore-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            restoreHistoryRecord(btn.dataset.id);
        });
    });
    listDiv.querySelectorAll('.detail-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            viewHistoryDetail(btn.dataset.id);
        });
    });
    listDiv.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteHistoryRecord(btn.dataset.id);
        });
    });
}

// 恢复历史记录到表单
window.restoreHistoryRecord = function(id) {
    let record = historyRecords.find(r => String(r.id) === String(id));
    if (!record) {
        showToast(t('history.notFound'), 'error');
        return;
    }

    let data = record.data;
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch (e) {
            data = { content: data };
        }
    }

    if (record.type === 'report' && data.name) {
        // 恢复报案表单
        document.getElementById('name').value = data.name || '';
        document.getElementById('idNo').value = data.idNo || '';
        document.getElementById('phone').value = data.phone || '';
        document.getElementById('address').value = data.address || '';
        document.getElementById('accusedName').value = data.accusedName || '';
        document.getElementById('accusedPhone').value = data.accusedPhone || '';
        document.getElementById('accusedWechat').value = data.accusedWechat || '';
        document.getElementById('accusedAlipay').value = data.accusedAlipay || '';
        document.getElementById('accusedBankCard').value = data.accusedBankCard || '';
        document.getElementById('accusedAddress').value = data.accusedAddress || '';
        document.getElementById('fraudTime').value = data.fraudTime || '';
        document.getElementById('fraudLocation').value = data.fraudLocation || '';
        document.getElementById('contactMethod').value = data.contactMethod || '';
        document.getElementById('fraudPlatform').value = data.fraudPlatform || '';
        document.getElementById('fraudType').value = data.fraudType || '';
        document.getElementById('fraudMoney').value = data.fraudMoney || '';
        document.getElementById('fraudDetail').value = data.fraudDetail || '';

        // 恢复证据文本
        globalOcrText = data.ocrText || '';
        globalUserInputText = data.userInputText || '';
        updateEvidenceTextBox();

        // 切换到报案页第3步
        showStep(3);
        switchPage('reportPage');
        showToast(t('history.reportRestored'), 'success');
    } else if (record.type === 'detect') {
        // 恢复检测结果
        let resDiv = document.getElementById('detectResult');
        resDiv.textContent = data.result || t('history.noResult');
        resDiv.classList.add('show');
        showToast(t('history.detectRestored'), 'success');
    } else if (record.type === 'deepDetect') {
        // 恢复DeepSeek结果
        let resDiv = document.getElementById('detectResult');
        resDiv.innerHTML = t('detect.deepResult') + renderMarkdown(data.reply || t('history.noResult'));
        resDiv.classList.add('show');
        showToast(t('history.deepDetectRestored'), 'success');
    } else {
        showToast(t('history.restoreUnsupported'), 'warning');
    }
};

// 查看历史记录详情
window.viewHistoryDetail = function(id) {
    let record = historyRecords.find(r => String(r.id) === String(id));
    if (!record) {
        showToast(t('history.notFound'), 'error');
        return;
    }

    let data = record.data;
    let detail = '';
    if (typeof data === 'object') {
        detail = JSON.stringify(data, null, 2);
    } else {
        detail = String(data);
    }

    // 创建详情弹窗
    let overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:20000;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
        <div style="background:var(--bg-surface);border-radius:16px;padding:24px;max-width:600px;max-height:70vh;overflow-y:auto;width:90%;">
            <h3 style="font-size:17px;font-weight:600;margin-bottom:12px;color:var(--text-primary);">${t('history.detailTitle')}</h3>
            <p style="font-size:13px;color:var(--text-tertiary);margin-bottom:12px;">${record.time} | ${historyTypeLabel(record)}</p>
            <pre style="font-size:13px;color:var(--text-primary);white-space:pre-wrap;word-break:break-all;font-family:-apple-system,sans-serif;">${escapeHtml(detail).substring(0, 2000)}</pre>
            <button style="margin-top:16px;padding:8px 20px;background:var(--primary);color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px;" onclick="this.closest('div[style*=fixed]').remove()">${t('common.close')}</button>
        </div>
    `;
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);
};

// 删除历史记录
window.deleteHistoryRecord = function(id) {
    if (!confirm(t('history.deleteConfirm'))) return;
    historyRecords = historyRecords.filter(r => String(r.id) !== String(id));
    safeLocalStorageSet('fraudHistory', historyRecords);
    renderHistory();
    showToast(t('history.deleted'), 'success');
};

function clearHistory() {
    if (confirm(t('history.clearConfirm'))) {
        historyRecords = [];
        safeLocalStorageRemove('fraudHistory');
        renderHistory();
        showToast(t('history.cleared'), 'success');
    }
}

// ===== 设置 =====
function initSettings() {
    let autoSaveEl = document.getElementById('autoSaveSwitch');
    let defaultDescEl = document.getElementById('defaultDesensitizeSwitch');
    let descEl = document.getElementById('desensitizeSwitch');
    if (autoSaveEl) autoSaveEl.checked = systemSettings.autoSave;
    if (defaultDescEl) defaultDescEl.checked = systemSettings.defaultDesensitize;
    if (descEl) descEl.checked = systemSettings.defaultDesensitize;
    // 监听识别页脱敏开关变化
    if (descEl) {
        descEl.addEventListener('change', () => {
            systemSettings.defaultDesensitize = descEl.checked;
            safeLocalStorageSet('systemSettings', systemSettings);
        });
    }
}

function saveSettings() {
    systemSettings.autoSave = document.getElementById('autoSaveSwitch').checked;
    systemSettings.defaultDesensitize = document.getElementById('defaultDesensitizeSwitch').checked;
    safeLocalStorageSet('systemSettings', systemSettings);
    showToast(t('setting.saved'), 'success');
}

function resetSettings() {
    systemSettings = { autoSave: true, defaultDesensitize: true };
    initSettings();
    safeLocalStorageSet('systemSettings', systemSettings);
    showToast(t('setting.resetDone'), 'success');
}

// ===== 表单自动保存与恢复 =====
const FORM_STORAGE_KEY = 'formDraft';

function saveFormDraft() {
    let draft = {
        name: document.getElementById('name')?.value || '',
        idNo: document.getElementById('idNo')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        address: document.getElementById('address')?.value || '',
        accusedName: document.getElementById('accusedName')?.value || '',
        accusedPhone: document.getElementById('accusedPhone')?.value || '',
        accusedWechat: document.getElementById('accusedWechat')?.value || '',
        accusedAlipay: document.getElementById('accusedAlipay')?.value || '',
        accusedBankCard: document.getElementById('accusedBankCard')?.value || '',
        accusedAddress: document.getElementById('accusedAddress')?.value || '',
        fraudTime: document.getElementById('fraudTime')?.value || '',
        fraudLocation: document.getElementById('fraudLocation')?.value || '',
        contactMethod: document.getElementById('contactMethod')?.value || '',
        fraudPlatform: document.getElementById('fraudPlatform')?.value || '',
        fraudType: document.getElementById('fraudType')?.value || '',
        fraudMoney: document.getElementById('fraudMoney')?.value || '',
        fraudDetail: document.getElementById('fraudDetail')?.value || '',
        fraudText: document.getElementById('fraudText')?.value || '',
        globalOcrText: globalOcrText,
        globalUserInputText: globalUserInputText,
        savedAt: Date.now()
    };
    // 落盘前对敏感字段脱敏
    ['idNo', 'phone', 'accusedPhone', 'accusedWechat', 'accusedAlipay', 'accusedBankCard'].forEach(k => {
        if (typeof draft[k] === 'string' && draft[k]) draft[k] = desensitizeText(draft[k]);
    });
    try { localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(draft)); } catch(e) {}
}

function restoreFormDraft() {
    try {
        let raw = localStorage.getItem(FORM_STORAGE_KEY);
        if (!raw) return;
        let draft = JSON.parse(raw);
        if (!draft || !draft.savedAt) return;

        // 如果草稿超过 24 小时，自动清除
        if (Date.now() - draft.savedAt > 24 * 60 * 60 * 1000) {
            localStorage.removeItem(FORM_STORAGE_KEY);
            return;
        }

        const nameEl = document.getElementById('name');
        if (nameEl) nameEl.value = draft.name || '';
        const idNoEl = document.getElementById('idNo');
        if (idNoEl) idNoEl.value = draft.idNo || '';
        const phoneEl = document.getElementById('phone');
        if (phoneEl) phoneEl.value = draft.phone || '';
        const addressEl = document.getElementById('address');
        if (addressEl) addressEl.value = draft.address || '';
        const accusedNameEl = document.getElementById('accusedName');
        if (accusedNameEl) accusedNameEl.value = draft.accusedName || '';
        const accusedPhoneEl = document.getElementById('accusedPhone');
        if (accusedPhoneEl) accusedPhoneEl.value = draft.accusedPhone || '';
        const accusedWechatEl = document.getElementById('accusedWechat');
        if (accusedWechatEl) accusedWechatEl.value = draft.accusedWechat || '';
        const accusedAlipayEl = document.getElementById('accusedAlipay');
        if (accusedAlipayEl) accusedAlipayEl.value = draft.accusedAlipay || '';
        const accusedBankCardEl = document.getElementById('accusedBankCard');
        if (accusedBankCardEl) accusedBankCardEl.value = draft.accusedBankCard || '';
        const accusedAddressEl = document.getElementById('accusedAddress');
        if (accusedAddressEl) accusedAddressEl.value = draft.accusedAddress || '';
        const fraudTimeEl = document.getElementById('fraudTime');
        if (fraudTimeEl) fraudTimeEl.value = draft.fraudTime || '';
        const fraudLocationEl = document.getElementById('fraudLocation');
        if (fraudLocationEl) fraudLocationEl.value = draft.fraudLocation || '';
        const contactMethodEl = document.getElementById('contactMethod');
        if (contactMethodEl) contactMethodEl.value = draft.contactMethod || '';
        const fraudPlatformEl = document.getElementById('fraudPlatform');
        if (fraudPlatformEl) fraudPlatformEl.value = draft.fraudPlatform || '';
        const fraudTypeEl = document.getElementById('fraudType');
        if (fraudTypeEl) fraudTypeEl.value = draft.fraudType || '';
        const fraudMoneyEl = document.getElementById('fraudMoney');
        if (fraudMoneyEl) fraudMoneyEl.value = draft.fraudMoney || '';
        const fraudDetailEl = document.getElementById('fraudDetail');
        if (fraudDetailEl) fraudDetailEl.value = draft.fraudDetail || '';
        const fraudTextEl = document.getElementById('fraudText');
        if (fraudTextEl) fraudTextEl.value = draft.fraudText || '';

        if (draft.globalOcrText) globalOcrText = draft.globalOcrText;
        if (draft.globalUserInputText) globalUserInputText = draft.globalUserInputText;
        updateEvidenceTextBox();
    } catch (e) {
        // 恢复失败不影响使用
    }
}

// 表单输入时自动保存
function bindFormAutoSave() {
    let formIds = ['name','idNo','phone','address','accusedName','accusedPhone','accusedWechat','accusedAlipay','accusedBankCard','accusedAddress','fraudTime','fraudLocation','contactMethod','fraudPlatform','fraudType','fraudMoney','fraudDetail','fraudText'];
    formIds.forEach(id => {
        let el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', saveFormDraft);
            el.addEventListener('change', saveFormDraft);
        }
    });
}
function switchPage(pageId) {
    // 清除所有页面的残留状态
    document.querySelectorAll('.page .form-group.error').forEach(g => g.classList.remove('error'));

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    let el = document.getElementById(pageId);
    if (el) el.classList.add('active');
    updateNavActive(pageId);

    // 回到首页时复位聊天聚焦态
    if (pageId === 'homePage') {
        document.getElementById('homePage')?.classList.remove('chat-focused');
        document.getElementById('homeChatPanel')?.classList.remove('open');
        document.getElementById('homeChatCard')?.classList.remove('expanded');
    }

    // 切换到报案填报页时，保留当前步骤（不重置）
    if (pageId === 'reportPage') {
        updateEvidenceTextBox();
    }
    // 切换到诈骗识别页时预加载Tesseract（静默加载，不阻塞）
    if (pageId === 'identifyPage') {
        loadTesseract();
    }
}

function updateNavActive(id) {
    document.querySelectorAll('#globalNav .nav-btn').forEach(btn => {
        if (btn.getAttribute('data-target') === id) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    // 移动端底部 Dock 同步高亮
    document.querySelectorAll('#bottomTabBar .tab-item').forEach(btn => {
        if (btn.getAttribute('data-target') === id) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

// ===== 字体加载与全局替换 =====
let fontLoaded = false;

function initFontLoad() {
    if (fontLoaded) return;
    fontLoaded = true;

    // 立即注入字体 CSS（font-display: optional 让浏览器决定策略）
    const style = document.createElement('style');
    style.textContent = `
        @font-face {
            font-family: 'HYRunYuan';
            font-style: normal;
            font-weight: 700;
            font-display: optional;
            src: url('fonts/汉仪润圆-75W.ttf') format('truetype');
        }
        @font-face {
            font-family: 'Kumbh Sans';
            font-style: normal;
            font-weight: 400;
            font-display: optional;
            src: url('fonts/KumbhSans-Regular.ttf') format('truetype');
        }
    `;
    document.head.appendChild(style);

    // 后台静默预加载字体，加载完成后全局替换
    preloadFontAsync('fonts/汉仪润圆-75W.ttf', 'HYRunYuan', '700', () => {
        // HYRunYuan 加载完成，应用到所有元素
        applyGlobalFontSwap();
    });
    preloadFontAsync('fonts/KumbhSans-Regular.ttf', 'Kumbh Sans', '400', () => {
        // Kumbh Sans 加载完成，应用到所有元素
        applyGlobalFontSwap();
    });
}

function applyGlobalFontSwap() {
    // 全局替换字体：body 设置新字体，浏览器会自动应用到所有子元素
    document.body.style.fontFamily = '"Kumbh Sans", -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "HYRunYuan", "PingFang SC", "Microsoft YaHei", sans-serif';
}

function preloadFontAsync(url, name, weight, onReady) {
    const fontFace = new FontFace(name, `url(${url})`, { weight, style: 'normal' });
    fontFace.load().then((font) => {
        document.fonts.add(font);
        if (onReady) onReady();
    }).catch(() => {
        // 字体加载失败不影响页面使用
    });
}

// ===== 明暗主题切换 =====
let currentTheme = 'light'; // 'light' | 'dark'

function applyTheme(theme) {
    // 对角线帷幕主题过渡动画
    const overlay = document.getElementById('themeTransitionOverlay');
    if (overlay) {
        overlay.classList.remove('to-dark', 'to-light', 'active');
        void overlay.offsetWidth;
        // 重置 animation 让 clip-path 动画重新触发
        overlay.style.animation = 'none';
        void overlay.offsetWidth;
        overlay.style.animation = '';
        overlay.classList.add(theme === 'dark' ? 'to-dark' : 'to-light');
        overlay.classList.add('active');
        setTimeout(() => {
            overlay.classList.remove('active', 'to-dark', 'to-light');
        }, 1050);
    }

    document.documentElement.setAttribute('data-theme', theme);
    currentTheme = theme;
    const btn = document.getElementById('themeToggleBtn');
    if (btn) btn.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
    // 同步移动端设置页「主题」分段控件激活态
    document.querySelectorAll('#themeSegmented .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.value === theme));
    // 持久化用户选择
    try { localStorage.setItem('themePref', theme); } catch(e) {}
}

function initTheme() {
    let theme;
    // 优先使用 localStorage 中持久化的偏好
    try { theme = localStorage.getItem('themePref'); } catch(e) { theme = null; }

    if (!theme) {
        // 无存储偏好 — 回退到 HTML data-theme 属性
        const htmlTheme = document.documentElement.getAttribute('data-theme');
        if (htmlTheme === 'auto') {
            theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
            theme = htmlTheme || 'light';
        }
    }

    applyTheme(theme);

    // 监听系统主题变化 — 仅在用户未设置手动偏好时生效
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        let stored;
        try { stored = localStorage.getItem('themePref'); } catch(err) { stored = null; }
        if (!stored) {
            // 没有手动覆盖 — 跟随系统
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // 按钮点击切换
    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
        btn.addEventListener('click', () => {
            applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }
    // 移动端设置页「主题」分段控件点击
    document.querySelectorAll('#themeSegmented .seg-btn').forEach(b => b.addEventListener('click', () => applyTheme(b.dataset.value)));
}

// ===== 注入统一 SVG 图标（替换 emoji 图标）=====
// 独立函数：在 onload 前即调用一次，静态 [data-icon] 元素不受外部资源（CDN）加载阻塞；
// onload 内再调用一次作为兜底，覆盖动态插入的 [data-icon]。
function injectIcons() {
    document.querySelectorAll('[data-icon]').forEach(el => {
        const icon = ICONS[el.getAttribute('data-icon')];
        if (icon) el.innerHTML = icon;
    });
}
injectIcons();

// ===== 初始化 =====
window.onload = function() {
    // 主题初始化（同步，最快执行）
    initTheme();

    // 从localStorage安全读取（同步）
    historyRecords = safeLocalStorageGet('fraudHistory', []);
    systemSettings = safeLocalStorageGet('systemSettings', { autoSave: true, defaultDesensitize: true });

    // 立即显示首页，不等待任何异步操作
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.add('fade-out');
        setTimeout(() => { loader.style.display = 'none'; }, 500);
    }
    document.getElementById('homePage').classList.add('active');
    initSettings();
    renderHistory();
    setCorpusLabel(corpusLabelKey);
    initImageUpload();
    initBillUpload();
    updateEvidenceTextBox();

    // 首页聊天面板展开（点击 → 下滚 + 只隐藏四个功能卡片）
    const homeChatCard = document.getElementById('homeChatCard');
    const homeChatPanel = document.getElementById('homeChatPanel');
    const homePage = document.getElementById('homePage');
    const collapseChatBtn = document.getElementById('collapseChatBtn');

    function openHomeChat() {
        homePage.classList.add('chat-focused');
        homeChatPanel.classList.add('open');
        homeChatCard.classList.add('expanded');
        setTimeout(() => {
            homeChatPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            document.getElementById('chatInput')?.focus();
        }, 60);
    }
    function closeHomeChat() {
        homePage.classList.remove('chat-focused');
        homeChatPanel.classList.remove('open');
        homeChatCard.classList.remove('expanded');
    }

    if (homeChatCard && homeChatPanel) {
        homeChatCard.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            if (homePage.classList.contains('chat-focused')) closeHomeChat();
            else openHomeChat();
        });
    }
    collapseChatBtn?.addEventListener('click', closeHomeChat);

    // 恢复表单草稿
    restoreFormDraft();
    bindFormAutoSave();

    // 字体后台加载（非阻塞，不弹窗）
    initFontLoad();

    // 事件绑定
    document.getElementById('startDetectBtn')?.addEventListener('click', detectFraud);
    document.getElementById('doubaoBtn')?.addEventListener('click', deepDetect);
    document.getElementById('clearIdentifyBtn')?.addEventListener('click', clearIdentify);
    document.getElementById('fillToReportBtn')?.addEventListener('click', fillToReport);
    document.getElementById('parseBillBtn')?.addEventListener('click', parseBill);
    document.getElementById('billToReportBtn')?.addEventListener('click', billToReport);
    document.getElementById('generateReportBtn')?.addEventListener('click', generateReport);
    document.getElementById('copyReportBtn')?.addEventListener('click', copyReport);
    document.getElementById('exportTxtBtn')?.addEventListener('click', exportTxt);
    document.getElementById('exportPdfBtn')?.addEventListener('click', exportPdf);
    document.getElementById('clearHistoryBtn')?.addEventListener('click', clearHistory);
    document.getElementById('saveSettingBtn')?.addEventListener('click', saveSettings);
    document.getElementById('resetSettingBtn')?.addEventListener('click', resetSettings);
    document.getElementById('importEvidenceBtn')?.addEventListener('click', importEvidenceFromIdentify);
    document.getElementById('clearEvidenceBtn')?.addEventListener('click', clearEvidenceText);

    // 步骤导航
    document.getElementById('nextStep1')?.addEventListener('click', () => {
        if (validateStep(1)) showStep(2);
        else showToast(t('report.completeRequired'), 'error');
    });
    document.getElementById('nextStep2')?.addEventListener('click', () => {
        if (validateStep(2)) showStep(3);
        else showToast(t('report.completeRequired'), 'error');
    });
    document.getElementById('prevStep2')?.addEventListener('click', () => showStep(1));
    document.getElementById('prevStep3')?.addEventListener('click', () => showStep(2));

    document.querySelectorAll('.corpus-btn').forEach(btn => btn.addEventListener('click', function() {
        // 点击按钮清除所有高亮状态（重置检测结果）
        document.querySelectorAll('.corpus-btn').forEach(b => {
            b.classList.remove('active', 'highlighted', 'multi-highlighted');
        });
        // 重置标签
        let labelEl = document.getElementById('corpusLabel');
        if (labelEl) {
            setCorpusLabel('identify.allTypes');
            labelEl.style.color = '';
            labelEl.style.borderColor = '';
            labelEl.style.background = '';
        }
        // 清空检测结果
        let resDiv = document.getElementById('detectResult');
        if (resDiv) {
            resDiv.textContent = '';
            resDiv.classList.remove('show');
        }
    }));

    document.querySelectorAll('[data-goto]').forEach(btn => {
        btn.setAttribute('tabindex', '0');
        btn.setAttribute('role', 'button');
        const goto = () => switchPage(btn.getAttribute('data-goto'));
        btn.addEventListener('click', goto);
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goto(); }
        });
    });
    document.querySelectorAll('#globalNav .nav-btn').forEach(btn => btn.addEventListener('click', () => switchPage(btn.getAttribute('data-target'))));
    // 底部标签栏事件
    document.querySelectorAll('#bottomTabBar .tab-item').forEach(btn => btn.addEventListener('click', () => switchPage(btn.getAttribute('data-target'))));

    // 快捷卡片 3D tilt 效果 + 按钮磁吸
    initMagneticEffects();

    // 全局鼠标跟踪（按钮磁吸光照）— 用 rAF 节流，避免每次 mousemove 都触发全页样式重算
    let mouseRaf = null;
    document.addEventListener('mousemove', (e) => {
        if (mouseRaf) return;
        mouseRaf = requestAnimationFrame(() => {
            mouseRaf = null;
            const x = (e.clientX / window.innerWidth * 100).toFixed(1);
            const y = (e.clientY / window.innerHeight * 100).toFixed(1);
            document.documentElement.style.setProperty('--mx', x + '%');
            document.documentElement.style.setProperty('--my', y + '%');
        });
    });

    document.getElementById('clearChatBtn')?.addEventListener('click', clearChat);
    document.getElementById('sendChatBtn')?.addEventListener('click', sendUserMessage);
    document.getElementById('chatInput')?.addEventListener('keypress', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendUserMessage(); }
    });

    // ===== 图片灯箱：点击缩略图放大查看 =====
    initImageLightbox();

    // 注入统一 SVG 图标（onload 兜底，覆盖动态插入的 [data-icon]）
    injectIcons();
};

// ===== 磁吸+3D卡片+按钮光照效果 =====
function initMagneticEffects() {
    document.querySelectorAll('.home-card, .quick-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            card.style.setProperty('--mouse-x', x);
            card.style.setProperty('--mouse-y', y);
        });
        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--mouse-x', 0.5);
            card.style.setProperty('--mouse-y', 0.5);
        });
    });
    // 按钮相对位置光斑
    document.querySelectorAll('.btn-primary, .btn-deep, .chat-send-btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const mx = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
            const my = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
            btn.style.setProperty('--mx', mx + '%');
            btn.style.setProperty('--my', my + '%');
        });
    });
}

// 暴露给全局
window.safeLocalStorageGet = safeLocalStorageGet;
window.safeLocalStorageSet = safeLocalStorageSet;
window.safeLocalStorageRemove = safeLocalStorageRemove;
window.updateEvidenceTextBox = updateEvidenceTextBox;
window.importEvidenceFromIdentify = importEvidenceFromIdentify;
window.clearEvidenceText = clearEvidenceText;
window.validateReportForm = validateReportForm;
window.markError = markError;
window.generateReport = generateReport;
window.detectFraud = detectFraud;
window.deepDetect = deepDetect;
window.doubaoDeepDetect = deepDetect; // 保留别名以兼容外部调用
window.fillToReport = fillToReport;
window.clearIdentify = clearIdentify;
window.parseBill = parseBill;
window.billToReport = billToReport;
window.copyReport = copyReport;
window.exportTxt = exportTxt;
window.exportPdf = exportPdf;
window.addHistory = addHistory;
window.renderHistory = renderHistory;
window.clearHistory = clearHistory;
window.initSettings = initSettings;
window.saveSettings = saveSettings;
window.resetSettings = resetSettings;
window.switchPage = switchPage;
window.updateNavActive = updateNavActive;
window.showStep = showStep;
window.validateStep = validateStep;
window.initImageLightbox = initImageLightbox;
