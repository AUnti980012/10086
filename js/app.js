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
        document.body.style.overflow = 'hidden'; // 禁止背景滚动
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
const totalSteps = 3;

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
    } catch (e) { /* 静默忽略配额溢出 */ }
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
    if (globalOcrText.trim()) parts.push('【OCR识别文本】\n' + globalOcrText.trim());
    if (globalUserInputText.trim()) parts.push('【用户原始输入文本】\n' + globalUserInputText.trim());
    evidenceDiv.textContent = parts.join('\n\n---\n\n');
    if (!parts.length) evidenceDiv.textContent = '';
}

// ===== 从识别页导入证据文本 =====
function importEvidenceFromIdentify() {
    let fraudTextarea = document.getElementById('fraudText');
    let userText = fraudTextarea.value.trim();
    if (userText) {
        globalUserInputText = userText;
    }
    updateEvidenceTextBox();
    if (globalOcrText.trim() || globalUserInputText.trim()) {
        showToast('证据文本已导入！可在报案材料生成时一并导出到PDF。', 'success');
    } else {
        showToast('暂无可导入的证据文本。请先在"诈骗识别"页面输入文本或上传图片进行OCR识别。', 'warning');
    }
}

// ===== 清空证据文本 =====
function clearEvidenceText() {
    if (confirm('确定清空所有关联证据文本？')) {
        globalOcrText = '';
        globalUserInputText = '';
        updateEvidenceTextBox();
    }
}

// ===== 步骤导航 =====
function showStep(step) {
    // 隐藏所有步骤
    document.querySelectorAll('.step-content').forEach(el => {
        el.style.display = 'none';
    });
    // 显示目标步骤
    let target = document.getElementById('step' + step);
    if (target) {
        target.style.display = 'block';
        // 重新触发动画
        target.classList.remove('step-content');
        void target.offsetWidth; // force reflow
        target.classList.add('step-content');
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

function validateStep(step) {
    let fields = [];
    if (step === 1) {
        fields = [
            { id: 'formName', getValue: () => document.getElementById('name').value.trim(), test: v => !!v },
            { id: 'formIdNo', getValue: () => document.getElementById('idNo').value.trim().toUpperCase(), test: v => /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/.test(v) },
            { id: 'formPhone', getValue: () => document.getElementById('phone').value.trim(), test: v => /^1[0-9]{10}$/.test(v) },
        ];
    } else if (step === 2) {
        fields = [
            { id: 'formAccusedName', getValue: () => document.getElementById('accusedName').value.trim(), test: v => !!v },
        ];
    } else if (step === 3) {
        fields = [
            { id: 'formTime', getValue: () => document.getElementById('fraudTime').value.trim(), test: v => !!v },
            { id: 'formLocation', getValue: () => document.getElementById('fraudLocation').value.trim(), test: v => !!v },
            { id: 'formPlatform', getValue: () => document.getElementById('fraudPlatform').value.trim(), test: v => !!v },
            { id: 'formType', getValue: () => document.getElementById('fraudType').value.trim(), test: v => !!v },
            { id: 'formMoney', getValue: () => document.getElementById('fraudMoney').value.trim(), test: v => v && !isNaN(parseFloat(v)) && parseFloat(v) > 0 },
            { id: 'formDetail', getValue: () => document.getElementById('fraudDetail').value.trim(), test: v => !!v },
        ];
    }
    let isValid = true;
    let firstError = null;
    fields.forEach(f => {
        let val = f.getValue();
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
        let input = firstError.querySelector('input, textarea');
        if (input) input.focus();
    }
    return isValid;
}

// ===== 表单验证 =====
function validateReportForm() {
    let isValid = true;
    let fields = [
        { id: 'formName', getValue: () => document.getElementById('name').value.trim(), test: v => !!v },
        { id: 'formIdNo', getValue: () => document.getElementById('idNo').value.trim().toUpperCase(), test: v => /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/.test(v) },
        { id: 'formPhone', getValue: () => document.getElementById('phone').value.trim(), test: v => /^1[0-9]{10}$/.test(v) },
        { id: 'formAccusedName', getValue: () => document.getElementById('accusedName').value.trim(), test: v => !!v },
        { id: 'formTime', getValue: () => document.getElementById('fraudTime').value.trim(), test: v => !!v },
        { id: 'formLocation', getValue: () => document.getElementById('fraudLocation').value.trim(), test: v => !!v },
        { id: 'formPlatform', getValue: () => document.getElementById('fraudPlatform').value.trim(), test: v => !!v },
        { id: 'formType', getValue: () => document.getElementById('fraudType').value.trim(), test: v => !!v },
        { id: 'formMoney', getValue: () => document.getElementById('fraudMoney').value.trim(), test: v => v && !isNaN(parseFloat(v)) && parseFloat(v) > 0 },
        { id: 'formDetail', getValue: () => document.getElementById('fraudDetail').value.trim(), test: v => !!v }
    ];
    let firstError = null;
    fields.forEach(f => {
        let val = f.getValue();
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
        let input = firstError.querySelector('input, textarea');
        if (input) input.focus();
    }
    return isValid;
}

function markError(formId, isError) {
    let group = document.getElementById(formId);
    if (group) {
        if (isError) group.classList.add('error');
        else group.classList.remove('error');
    }
}

// ===== 生成报案报告 =====
function generateReport() {
    let name = document.getElementById('name').value.trim();
    let idNo = document.getElementById('idNo').value.trim();
    let phone = document.getElementById('phone').value.trim();
    let address = document.getElementById('address').value.trim() || '未填写';
    let accusedName = document.getElementById('accusedName').value.trim() || '未知';
    let accusedPhone = document.getElementById('accusedPhone').value.trim() || '未知';
    let accusedWechat = document.getElementById('accusedWechat').value.trim() || '未知';
    let accusedAlipay = document.getElementById('accusedAlipay').value.trim() || '未知';
    let accusedBankCard = document.getElementById('accusedBankCard').value.trim() || '未知';
    let accusedAddress = document.getElementById('accusedAddress').value.trim() || '未知';
    let time = document.getElementById('fraudTime').value.trim();
    let location = document.getElementById('fraudLocation').value.trim();
    let contactMethod = document.getElementById('contactMethod').value.trim() || '未填写';
    let platform = document.getElementById('fraudPlatform').value.trim();
    let fType = document.getElementById('fraudType').value.trim();
    let moneyVal = parseFloat(document.getElementById('fraudMoney').value.trim());
    if (isNaN(moneyVal)) moneyVal = 0;
    let money = moneyVal.toFixed(2);
    let detail = document.getElementById('fraudDetail').value.trim();
    let evidenceCount = reportImages.length;
    let hasOcr = globalOcrText.trim() ? true : false;
    let hasUserInput = globalUserInputText.trim() ? true : false;

    let report = `==================== 刑事控告书 ====================

关于${accusedName}涉嫌诈骗罪的刑事控告书

致：有管辖权之公安机关

【控告人信息】
姓名：${name}
身份证号：${idNo}
联系电话：${phone}
住址：${address}

【被控告人信息】
网名/姓名：${accusedName}
电话：${accusedPhone}
微信号/QQ号：${accusedWechat}
支付宝账号：${accusedAlipay}
银行卡号：${accusedBankCard}
大概住址或活动范围：${accusedAddress}

【请求事项】
请求公安机关对被控告人${accusedName}涉嫌诈骗罪一案立案侦查，依法追究其刑事责任。

【事实与理由】
一、被骗基本情况
被骗时间：${time}
被骗地点/操作地：${location}
认识方式：${contactMethod}
被骗平台/渠道：${platform}
诈骗类型：${fType}
被骗总金额：人民币 ¥${money} 元

二、详细经过
${detail}

三、法律分析
被控告人虚构事实/隐瞒真相，致使控告人产生错误认识，控告人基于错误认识处分财产，被控告人获得财产，控告人遭受经济损失。被控告人的行为符合《中华人民共和国刑法》第二百六十六条诈骗罪的构成要件。

【证据清单】
证据1：控告人身份证复印件
证据2：控告人与被控告人之间的聊天记录截图（${evidenceCount}张图片）
证据3：转账记录/支付凭证
${hasOcr ? '证据4：OCR识别提取的文本内容（附后）\n' : ''}${hasUserInput ? '证据5：控告人原始输入文本内容（附后）\n' : ''}
【证据附件】${hasOcr ? '\n\n--- OCR识别文本 ---\n' + globalOcrText.trim() : ''}${hasUserInput ? '\n\n--- 用户原始输入文本 ---\n' + globalUserInputText.trim() : ''}

综上所述，被控告人${accusedName}的行为已涉嫌构成诈骗罪，恳请贵局依法立案侦查，维护控告人的合法权益。

此致
敬礼

控告人：${name}
日期：${new Date().toLocaleDateString('zh-CN')}
=====================================================`;

    let resultDiv = document.getElementById('reportResult');
    resultDiv.textContent = report;
    resultDiv.classList.add('show');
    if (systemSettings.autoSave) addHistory('report', report.substring(0, 200));
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

    // 如果有图片，优先执行 OCR
    if (hasImages) {
        try {
            await ocrImagesWithTesseract(identifyImages);
            txt = document.getElementById('fraudText').value.trim();
        } catch (e) {
            showToast('OCR 识别失败：' + e.message, 'error');
            return;
        }
    }

    if (!txt && !hasImages) {
        showToast('请输入文本或上传图片', 'warning');
        return;
    }

    // 关键词检测（懒加载字典）
    if (txt) {
        globalUserInputText = txt;
        updateEvidenceTextBox();

        // 确保关键词字典已加载
        await loadKeywordsAsync();

        let kwMap = window.fraudKeywordsMap || {};
        if (!Object.keys(kwMap).length) {
            let resDiv = document.getElementById('detectResult');
            resDiv.textContent = '⚠️ 关键词字典尚未加载，请稍后再试';
            resDiv.classList.add('show');
            return;
        }

        // 清除之前的高亮状态
        document.querySelectorAll('.corpus-btn').forEach(btn => {
            btn.classList.remove('highlighted', 'multi-highlighted');
        });

        // 逐个分类检测匹配
        let categories = ['police', 'loan', 'service', 'leader'];
        let matchedCategories = [];

        for (let cat of categories) {
            let keywords = kwMap[cat];
            if (!keywords) continue;
            let hits = keywords.filter(k => txt.includes(k));
            if (hits.length > 0) {
                matchedCategories.push({ cat, keywords: hits, count: hits.length });
                // 高亮对应的按钮
                let btn = document.querySelector(`.corpus-btn[data-type="${cat}"]`);
                if (btn) btn.classList.add('highlighted');
            }
        }

        // 检测"全类型"（all）关键词
        let allKeywords = kwMap.all || [];
        let allHits = allKeywords.filter(k => txt.includes(k));

        let result;
        let labelEl = document.getElementById('corpusLabel');

        if (matchedCategories.length === 0 && allHits.length === 0) {
            // 无任何匹配
            result = `✅ 未发现明显诈骗特征`;
            if (labelEl) labelEl.textContent = '全类型诈骗';
        } else if (matchedCategories.length === 0 && allHits.length > 0) {
            // 只有"all"匹配 → 亮起"全类型诈骗"标签（红色）
            result = `🚨 高度疑似诈骗！（匹配关键词：${allHits.join('、')}，共 ${allHits.length} 个）`;
            if (labelEl) {
                labelEl.textContent = '全类型诈骗';
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
            result = `🚨 高度疑似诈骗！（匹配关键词：${[...new Set(allHitKeywords)].join('、')}，共 ${allHitKeywords.length} 个）`;
            // 所有匹配的分类按钮变红
            matchedCategories.forEach(m => {
                let btn = document.querySelector(`.corpus-btn[data-type="${m.cat}"]`);
                if (btn) {
                    btn.classList.remove('highlighted');
                    btn.classList.add('multi-highlighted');
                }
            });
            if (labelEl) {
                labelEl.textContent = '全类型诈骗';
                labelEl.style.color = 'var(--danger)';
                labelEl.style.borderColor = 'var(--danger)';
                labelEl.style.background = 'var(--danger-bg)';
            }
        } else if (matchedCategories.length === 1) {
            // 单一分类匹配 → 蓝色高亮 + 显示分类名
            let m = matchedCategories[0];
            let catNames = { police: '公安诈骗', loan: '贷款诈骗', service: '冒充客服', leader: '冒充领导熟人' };
            result = `⚠️ 疑似${catNames[m.cat]}（匹配关键词：${m.keywords.join('、')}）`;
            if (labelEl) {
                labelEl.textContent = catNames[m.cat] || '疑似诈骗';
                labelEl.style.color = '';
                labelEl.style.borderColor = '';
                labelEl.style.background = '';
            }
        }

        let resDiv = document.getElementById('detectResult');
        resDiv.textContent = result;
        resDiv.classList.add('show');
        if (systemSettings.autoSave) addHistory('detect', result);
    }
}

// ===== DeepSeek深度判定 =====
async function deepDetect() {
    let txt = document.getElementById('fraudText').value.trim();
    let hasImages = identifyImages && identifyImages.length > 0;

    // 如果有图片，先执行 OCR 提取文本
    if (hasImages) {
        try {
            await ocrImagesWithTesseract(identifyImages);
            txt = document.getElementById('fraudText').value.trim();
        } catch (e) {
            showToast('OCR 识别失败：' + e.message, 'error');
            return;
        }
    }

    if (!txt) return showToast('请输入内容或上传图片', 'warning');
    globalUserInputText = txt;
    updateEvidenceTextBox();
    let resDiv = document.getElementById('detectResult');
    resDiv.innerHTML = '<div class="loading-tip"><span class="loading-spin"></span>DeepSeek分析中...</div>';
    resDiv.classList.add('show');
    try {
        let resp = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [{ role: "system", content: "反诈专家" }, { role: "user", content: `分析诈骗风险：${txt}` }] })
        });
        if (!resp.ok) {
            let errText;
            try { errText = (await resp.json()).error || resp.statusText; } catch { errText = resp.statusText; }
            throw new Error(`HTTP ${resp.status}: ${errText}`);
        }
        let data = await resp.json();
        let reply = data.choices?.[0]?.message?.content || '分析完成';
        resDiv.innerHTML = `【DeepSeek深度判定】\n${renderMarkdown(reply)}`;
        if (systemSettings.autoSave) addHistory('detect', reply.substring(0, 200));
    } catch (e) {
        resDiv.textContent = `判定失败：${e.message}`;        console.error('DeepDetect error:', e);
    }
}

// ===== 填充到报案表 =====
function fillToReport() {
    let res = document.getElementById('detectResult').textContent;
    // 只要不是判定失败或空结果，就允许填充
    if (res && !res.includes('判定失败') && res.trim()) {
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
    if (typeof XLSX === 'undefined') { showToast('XLSX 库尚未加载，请检查网络后重试。', 'error'); return; }
    if (!billData) { showToast('请先上传账单文件', 'warning'); return; }
    let billRes = document.getElementById('billResult');
    billRes.innerHTML = '<div class="loading-tip"><span class="loading-spin"></span>解析中...</div>';
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
                        amt = parseFloat(row[amtCol]);
                    }
                    if (amt < 0 || (row['收支类型'] && row['收支类型'].includes('支出'))) {
                        total += Math.abs(amt);
                        records.push(Math.abs(amt));
                    }
                });
            }
            billRes.textContent = `账单解析完成！\n总支出笔数：${records.length}笔\n总支出金额：¥${total.toFixed(2)}元`;
            billData.parsed = { totalOut: total };
        } catch (e) {
            billRes.textContent = '解析失败';
        }
    }, 1000);
}

function billToReport() {
    if (billData?.parsed) {
        document.getElementById('fraudMoney').value = billData.parsed.totalOut;
        switchPage('reportPage');
    } else {
        showToast('请先解析账单', 'warning');
    }
}

// ===== 复制/导出 =====
function copyReport() {
    let div = document.getElementById('reportResult');
    if (div.classList.contains('show')) {
        navigator.clipboard.writeText(div.textContent).then(
            () => showToast('已复制到剪贴板', 'success'),
            () => showToast('复制失败，请手动复制', 'error')
        );
    } else {
        showToast('请先生成刑事控告书', 'warning');
    }
}

function exportTxt() {
    let div = document.getElementById('reportResult');
    if (div.classList.contains('show')) {
        let blob = new Blob([div.textContent], { type: 'text/plain' });
        let a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `刑事控告书_${new Date().toISOString().slice(0,10)}.txt`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        showToast('TXT 文件已下载', 'success');
    } else {
        showToast('请先生成刑事控告书', 'warning');
    }
}

async function exportPdf() {
    let div = document.getElementById('reportResult');
    if (!div.classList.contains('show') || !div.textContent.trim()) {
        showToast('请先生成刑事控告书', 'warning');
        return;
    }
    try {
        if (typeof html2canvas === 'undefined') { showToast('html2canvas 未加载，请检查网络后重试。', 'error'); return; }
        if (typeof window.jspdf === 'undefined') { showToast('jsPDF 未加载，请检查网络后重试。', 'error'); return; }
        const canvas = await html2canvas(div, {
            scale: 1.5,
            backgroundColor: '#1A2740',
            logging: false
        });
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 20; // 左右各留 10mm 边距
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // 计算报告内容需要的页数
        const usableHeight = pdfHeight - 20; // 上下各留 10mm
        const totalPages = Math.ceil(imgHeight / usableHeight);

        if (totalPages <= 1) {
            // 单页：直接添加
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        } else {
            // 多页：按内容高度裁剪图片分段添加到每页
            const pxPerMm = canvas.height / pdfHeight;
            const sliceHeightPx = Math.floor(usableHeight * pxPerMm);

            for (let page = 0; page < totalPages; page++) {
                if (page === 0) {
                    // 第一页：完整图片，从顶部开始
                    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, usableHeight));
                } else {
                    // 后续页：裁剪图片的对应段
                    const srcY = page * sliceHeightPx;
                    const srcH = Math.min(sliceHeightPx, imgHeight - srcY);
                    if (srcH <= 0) break;

                    // 创建临时 canvas 裁剪图片段
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = canvas.width;
                    tempCanvas.height = srcH;
                    const ctx = tempCanvas.getContext('2d');
                    ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

                    const tempImgData = tempCanvas.toDataURL('image/png');
                    const displayedHeight = (tempCanvas.height * imgWidth) / tempCanvas.width;
                    pdf.addPage();
                    pdf.addImage(tempImgData, 'PNG', 10, 10, imgWidth, displayedHeight);
                }
            }
        }
        pdf.save(`刑事控告书_${Date.now()}.pdf`);
        showToast('PDF 文件已生成', 'success');
    } catch (error) {
        let msg = 'PDF 生成失败';
        if (error.name === 'AbortError' || error.message?.includes('memory')) {
            msg = 'PDF 生成失败：内存不足，请尝试使用导出 TXT 功能。';
        } else if (error.message?.includes('network')) {
            msg = 'PDF 生成失败：网络连接异常，请检查网络后重试。';
        }
        showToast(msg, 'error');
        console.error(error);
    }
}

// ===== 历史记录 =====
function addHistory(type, content) {
    historyRecords.unshift({ id: Date.now(), time: new Date().toLocaleString(), type, content });
    safeLocalStorageSet('fraudHistory', historyRecords.slice(0, 50));
    renderHistory();
}

function renderHistory() {
    let listDiv = document.getElementById('historyList');
    if (!listDiv) return;
    if (!historyRecords.length) {
        listDiv.innerHTML = '<div class="history-empty">暂无记录</div>';
        return;
    }
    let html = '';
    historyRecords.forEach(r => {
        html += `<div class="history-item"><div class="history-header"><span>${r.type==='detect'?'🔍识别':'📄报案'}</span><span>${r.time}</span></div><div>${escapeHtml(r.content).substring(0,100)}...</div></div>`;
    });
    listDiv.innerHTML = html;
}

function clearHistory() {
    if (confirm('清空所有历史记录？')) {
        historyRecords = [];
        safeLocalStorageRemove('fraudHistory');
        renderHistory();
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
    showToast('设置已保存', 'success');
}

function resetSettings() {
    systemSettings = { autoSave: true, defaultDesensitize: true };
    initSettings();
    safeLocalStorageSet('systemSettings', systemSettings);
    showToast('已恢复默认设置', 'success');
}

// ===== 导航 =====
function switchPage(pageId) {
    // 清除所有页面的残留状态
    document.querySelectorAll('.page .form-group.error').forEach(g => g.classList.remove('error'));

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    let el = document.getElementById(pageId);
    if (el) el.classList.add('active');
    updateNavActive(pageId);

    // 切换到报案填报页时，如果是首次访问（currentStep === 1 且无已填数据），重置到第1步
    // 如果用户已经在第2/3步填写了数据，保持当前步骤不变
    if (pageId === 'reportPage') {
        updateEvidenceTextBox();
        // 检查是否已有填写的数据，避免无意义重置
        const nameVal = document.getElementById('name')?.value.trim();
        if (!nameVal && currentStep !== 1) {
            showStep(1);
        }
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
    updateUnderline();
}

function updateUnderline() {
    let active = document.querySelector('#globalNav .nav-btn.active');
    if (!active) return;
    let underline = document.getElementById('globalNavUnderline');
    if (!underline) return;
    let rect = active.getBoundingClientRect();
    let parentRect = active.parentElement.getBoundingClientRect();
    underline.style.width = `${rect.width}px`;
    underline.style.left = `${rect.left - parentRect.left + active.parentElement.scrollLeft}px`;
}

// ===== 字体后台加载（非阻塞） =====
let fontLoaded = false;

function initFontLoad() {
    if (fontLoaded) return;
    fontLoaded = true;

    // 立即注入字体 CSS（font-display: optional 让浏览器决定策略）
    const style = document.createElement('style');
    style.textContent = `
        @font-face {
            font-family: 'PingFang SC';
            font-style: normal;
            font-weight: 600;
            font-display: optional;
            src: url('fonts/PingFangSC-Semibold.ttf') format('truetype');
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

    // 后台静默预加载字体，不阻塞页面
    preloadFontAsync('fonts/PingFangSC-Semibold.ttf', 'PingFang SC', '600');
    preloadFontAsync('fonts/KumbhSans-Regular.ttf', 'Kumbh Sans', '400');
}

function preloadFontAsync(url, name, weight) {
    const fontFace = new FontFace(name, `url(${url})`, { weight, style: 'normal' });
    fontFace.load().then((font) => {
        document.fonts.add(font);
    }).catch(() => {
        // 字体加载失败不影响页面使用
    });
}

// ===== 初始化 =====
window.onload = function() {
    // 从localStorage安全读取
    historyRecords = safeLocalStorageGet('fraudHistory', []);
    systemSettings = safeLocalStorageGet('systemSettings', { autoSave: true, defaultDesensitize: true });

    // 首页内容完全就绪后，延迟300ms淡出loader
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('fade-out');
            setTimeout(() => { loader.style.display = 'none'; }, 500);
        }
        document.getElementById('homePage').classList.add('active');
        updateUnderline();
        initSettings();
        renderHistory();
        initImageUpload();
        initBillUpload();
        updateEvidenceTextBox();

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
            else showToast('请完成当前步骤的必填项', 'error');
        });
        document.getElementById('nextStep2')?.addEventListener('click', () => {
            if (validateStep(2)) showStep(3);
            else showToast('请完成当前步骤的必填项', 'error');
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
                labelEl.textContent = '全类型诈骗';
                labelEl.style.color = '';
                labelEl.style.borderColor = '';
                labelEl.style.background = '';
            }
            // 清空检测结果
            let resDiv = document.getElementById('detectResult');
            if (resDiv) resDiv.textContent = '';
            resDiv.classList.remove('show');
        }));

        document.querySelectorAll('[data-goto]').forEach(btn => btn.addEventListener('click', () => switchPage(btn.getAttribute('data-goto'))));
        document.querySelectorAll('#globalNav .nav-btn').forEach(btn => btn.addEventListener('click', () => switchPage(btn.getAttribute('data-target'))));

        document.getElementById('clearChatBtn')?.addEventListener('click', clearChat);
        document.getElementById('sendChatBtn')?.addEventListener('click', sendUserMessage);
        document.getElementById('chatInput')?.addEventListener('keypress', e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendUserMessage(); }
        });

        window.addEventListener('resize', updateUnderline);

        // ===== 图片灯箱：点击缩略图放大查看 =====
        initImageLightbox();
    }, 300);
};

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
window.updateUnderline = updateUnderline;
window.showStep = showStep;
window.validateStep = validateStep;
window.initImageLightbox = initImageLightbox;
