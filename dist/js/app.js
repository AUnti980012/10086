/**
 * 主应用逻辑模块
 * 包含：表单验证、报案生成、账单解析、PDF导出、历史记录、设置、导航、初始化
 */

// ===== 全局变量 =====
let historyRecords = [];
let systemSettings = { autoSave: true, defaultDesensitize: true };
let globalOcrText = '';
let globalUserInputText = '';

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
        alert('证据文本已导入！可在报案材料生成时一并导出到PDF。');
    } else {
        alert('暂无可导入的证据文本。请先在"诈骗识别"页面输入文本或上传图片进行OCR识别。');
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
    if (!validateReportForm()) {
        alert('请正确填写所有必填项（控告人姓名、身份证号、电话；被控告人网名/姓名；被骗时间、地点、平台、类型、金额、详细经过）。');
        return;
    }
    let name = document.getElementById('name').value.trim();
    let idNo = document.getElementById('idNo').value.trim();
    let phone = document.getElementById('phone').value.trim();
    let address = document.getElementById('address').value.trim() || '未填写';
    let accusedName = document.getElementById('accusedName').value.trim();
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
    let money = parseFloat(document.getElementById('fraudMoney').value.trim()).toFixed(2);
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

// ===== 诈骗识别 =====
function detectFraud() {
    let txt = document.getElementById('fraudText').value.trim();
    if (!txt) { alert('请输入文本或上传图片'); return; }
    globalUserInputText = txt;
    updateEvidenceTextBox();
    let type = document.querySelector('.corpus-btn.active').getAttribute('data-type');
    let kwMap = {
        police: ['公安局', '安全账户'],
        loan: ['贷款', '手续费'],
        service: ['客服', '退款'],
        leader: ['领导', '转账'],
        all: ['刷单', '返利', '验证码']
    };
    let matched = kwMap[type] || kwMap.all;
    let result = matched.filter(k => txt.includes(k)).length
        ? `⚠️ 疑似诈骗，请提高警惕`
        : `✅ 未发现明显诈骗特征`;
    let resDiv = document.getElementById('detectResult');
    resDiv.textContent = result;
    resDiv.classList.add('show');
    if (systemSettings.autoSave) addHistory('detect', result);
}

// ===== DeepSeek深度判定 =====
async function doubaoDeepDetect() {
    let txt = document.getElementById('fraudText').value.trim();
    if (!txt) return alert('请输入内容');
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
        let data = await resp.json();
        let reply = data.choices?.[0]?.message?.content || '分析完成';
        resDiv.textContent = `【DeepSeek深度判定】\n${reply}`;
        if (systemSettings.autoSave) addHistory('detect', reply.substring(0, 200));
    } catch (e) {
        resDiv.textContent = '判定失败：请配置后端API。';
    }
}

// ===== 填充到报案表 =====
function fillToReport() {
    let res = document.getElementById('detectResult').textContent;
    if (res && !res.includes('判定失败')) {
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
}

// ===== 账单解析 =====
function parseBill() {
    if (!billData) { alert('请先上传账单文件'); return; }
    let billRes = document.getElementById('billResult');
    billRes.innerHTML = '<div class="loading-tip"><span class="loading-spin"></span>解析中...</div>';
    billRes.classList.add('show');
    setTimeout(() => {
        try {
            let total = 0, records = [];
            if (billData.type === 'csv') {
                let lines = billData.raw.split(/\r?\n/); // 支持Windows换行
                lines.forEach((l, idx) => {
                    if (idx === 0) return;
                    let amount = 0;
                    let parts = l.split(',');
                    parts.forEach(c => {
                        let num = parseFloat(c.replace(/[^0-9.-]/g, ''));
                        if (!isNaN(num) && num !== 0 && (c.includes('支出') || c.includes('付款'))) amount = Math.abs(num);
                    });
                    if (amount > 0) { total += amount; records.push(amount); }
                });
            } else {
                let wb = billData.raw,
                    ws = wb.Sheets[wb.SheetNames[0]],
                    data = XLSX.utils.sheet_to_json(ws);
                data.forEach(row => {
                    let amt = parseFloat(row['金额'] || row['Amount'] || 0);
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
        alert('请先解析账单');
    }
}

// ===== 复制/导出 =====
function copyReport() {
    let div = document.getElementById('reportResult');
    if (div.classList.contains('show')) {
        navigator.clipboard.writeText(div.textContent).then(() => alert('复制成功'));
    } else {
        alert('请先生成刑事控告书');
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
    } else {
        alert('请先生成刑事控告书');
    }
}

async function exportPdf() {
    let div = document.getElementById('reportResult');
    if (!div.classList.contains('show') || !div.textContent.trim()) {
        alert('请先生成刑事控告书');
        return;
    }
    try {
        if (typeof html2canvas === 'undefined') { alert('html2canvas未加载，请检查网络后重试。'); return; }
        if (typeof window.jspdf === 'undefined') { alert('jsPDF未加载，请检查网络后重试。'); return; }
        const canvas = await html2canvas(div, {
            scale: 1.5, // 降低scale减少内存占用
            backgroundColor: '#ffffff',
            logging: false
        });
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 10;
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);
        while (heightLeft > 0) {
            position = heightLeft - imgHeight + 10;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - 20);
        }
        pdf.save(`刑事控告书_${Date.now()}.pdf`);
    } catch (error) {
        alert('PDF生成失败，请重试或使用导出TXT功能。');
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
}

function saveSettings() {
    systemSettings.autoSave = document.getElementById('autoSaveSwitch').checked;
    systemSettings.defaultDesensitize = document.getElementById('defaultDesensitizeSwitch').checked;
    safeLocalStorageSet('systemSettings', systemSettings);
    alert('设置已保存');
}

function resetSettings() {
    systemSettings = { autoSave: true, defaultDesensitize: true };
    initSettings();
    safeLocalStorageSet('systemSettings', systemSettings);
    alert('已恢复默认');
}

// ===== 导航 =====
function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    let el = document.getElementById(pageId);
    if (el) el.classList.add('active');
    updateNavActive(pageId);
    if (pageId === 'reportPage') updateEvidenceTextBox();
    // 切换到诈骗识别页时预加载Tesseract
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

        // 事件绑定
        document.getElementById('startDetectBtn')?.addEventListener('click', detectFraud);
        document.getElementById('doubaoBtn')?.addEventListener('click', doubaoDeepDetect);
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

        document.querySelectorAll('.corpus-btn').forEach(btn => btn.addEventListener('click', function() {
            document.querySelectorAll('.corpus-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        }));

        document.querySelectorAll('[data-goto]').forEach(btn => btn.addEventListener('click', () => switchPage(btn.getAttribute('data-goto'))));
        document.querySelectorAll('#globalNav .nav-btn').forEach(btn => btn.addEventListener('click', () => switchPage(btn.getAttribute('data-target'))));

        document.getElementById('clearChatBtn')?.addEventListener('click', clearChat);
        document.getElementById('sendChatBtn')?.addEventListener('click', sendUserMessage);
        document.getElementById('chatInput')?.addEventListener('keypress', e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendUserMessage(); }
        });

        window.addEventListener('resize', updateUnderline);
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
window.doubaoDeepDetect = doubaoDeepDetect;
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
