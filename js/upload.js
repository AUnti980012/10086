/**
 * 文件上传处理模块
 * 包含：handleFiles（Promise.all等待FileReader）、initUpload、OCR相关
 */

let identifyImages = [];
let reportImages = [];
let billData = null;

// ===== 文件处理（Promise.all等待所有FileReader完成） =====
function handleFiles(files, container, cb) {
    let valid = Array.from(files).filter(f => f.type.includes('image/'));
    if (!valid.length) return;
    let imageFiles = [];
    container.innerHTML = '';

    // 用Promise.all等待所有FileReader完成
    Promise.all(valid.map((file, idx) => {
        return new Promise((resolve) => {
            let reader = new FileReader();
            reader.onload = e => resolve({ id: Date.now() + idx, file, url: e.target.result });
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        });
    })).then(results => {
        results.filter(Boolean).forEach(r => {
            imageFiles.push(r);
            let div = document.createElement('div');
            div.className = 'preview-item';
            let img = document.createElement('img');
            img.src = r.url;
            let del = document.createElement('div');
            del.className = 'preview-del';
            del.textContent = '×';
            let rid = r.id;
            del.onclick = () => {
                imageFiles = imageFiles.filter(i => i.id !== rid);
                div.remove();
            };
            div.appendChild(img);
            div.appendChild(del);
            container.appendChild(div);
        });
        cb(imageFiles);
    });
}

// ===== 通用上传初始化 =====
function initUpload(areaId, fileId, previewId, cb) {
    const area = document.getElementById(areaId),
        input = document.getElementById(fileId),
        container = document.getElementById(previewId);
    if (!area || !input) return;
    area.addEventListener('click', () => input.click());
    input.addEventListener('change', e => handleFiles(e.target.files, container, cb));
    area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('dragover'); });
    area.addEventListener('dragleave', () => area.classList.remove('dragover'));
    area.addEventListener('drop', e => {
        e.preventDefault();
        area.classList.remove('dragover');
        handleFiles(e.dataTransfer.files, container, cb);
    });
}

// ===== OCR进度显示 =====
function showOcrProgress(totalImages) {
    const container = document.getElementById('ocrProgressContainer');
    const fill = document.getElementById('ocrProgressFill');
    const status = document.getElementById('ocrProgressStatus');
    const percent = document.getElementById('ocrProgressPercent');
    if (!container) return;
    container.classList.add('active');
    fill.style.width = '0%';
    percent.textContent = '0%';
    status.textContent = `准备识别 0/${totalImages}`;
}

function updateOcrProgress(currentIndex, total, progressFraction, statusText = '') {
    const fill = document.getElementById('ocrProgressFill');
    const status = document.getElementById('ocrProgressStatus');
    const percent = document.getElementById('ocrProgressPercent');
    if (!fill || !status) return;
    const perImageWeight = 1 / total;
    const done = currentIndex * perImageWeight;
    const currentPart = progressFraction * perImageWeight;
    const overall = Math.min((done + currentPart) * 100, 100).toFixed(0);
    fill.style.width = overall + '%';
    percent.textContent = overall + '%';
    status.textContent = statusText || `识别中 ${currentIndex+1}/${total}`;
}

function hideOcrProgress() {
    const container = document.getElementById('ocrProgressContainer');
    if (container) container.classList.remove('active');
}

// ===== OCR识别 =====
async function ocrWithTesseract(file, index, total) {
    return new Promise((resolve, reject) => {
        Tesseract.recognize(file, 'chi_sim+eng', {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    updateOcrProgress(index, total, m.progress || 0,
                        `识别图片 ${index+1}/${total} (${Math.round((m.progress||0)*100)}%)`);
                }
            }
        }).then(result => {
            resolve(result.data.text.trim());
        }).catch(reject);
    });
}

async function ocrImagesWithTesseract(images) {
    if (!images.length) return;
    // 确保Tesseract已加载
    await loadTesseract();
    if (typeof Tesseract === 'undefined') {
        alert('Tesseract.js 尚未加载完成，请稍后再试。');
        return;
    }
    let ocrDiv = document.getElementById('ocrResult');
    let fraudTextarea = document.getElementById('fraudText');
    let allText = [];
    showOcrProgress(images.length);
    for (let i = 0; i < images.length; i++) {
        updateOcrProgress(i, images.length, 0, `正在识别图片 ${i+1}/${images.length}`);
        try {
            const recognized = await ocrWithTesseract(images[i].file, i, images.length);
            if (recognized) allText.push(`【图片${i+1}】\n${recognized}`);
        } catch (err) {
            allText.push(`【图片${i+1}】识别失败`);
        }
        updateOcrProgress(i, images.length, 1, `图片 ${i+1}/${images.length} 完成`);
    }
    hideOcrProgress();
    let combined = allText.join('\n\n');
    if (document.getElementById('desensitizeSwitch').checked) combined = desensitizeText(combined);
    fraudTextarea.value = fraudTextarea.value ? fraudTextarea.value + "\n\n" + combined : combined;
    globalOcrText = combined;
    ocrDiv.innerHTML = `✅ Tesseract OCR 完成，已填入文本框。证据文本已暂存，可在报案填报中引用。`;
}

// ===== 初始化上传组件 =====
function initImageUpload() {
    initUpload('identifyUpload', 'identifyFile', 'identifyPreview', (files) => {
        identifyImages = files;
        // 不再自动触发OCR，改为手动点击"开始识别"
    });
    initUpload('reportUpload', 'reportFile', 'reportPreview', (files) => {
        reportImages = files;
    });
}

// ===== 账单上传 =====
function initBillUpload() {
    let area = document.getElementById('billUpload'),
        input = document.getElementById('billFile');
    if (!area || !input) return;
    area.addEventListener('click', () => input.click());
    input.addEventListener('change', e => {
        let file = e.target.files[0];
        if (!file) return;
        let reader = new FileReader();
        reader.onload = ev => {
            let ext = file.name.split('.').pop().toLowerCase();
            if (ext === 'csv') {
                billData = { raw: ev.target.result, type: 'csv' };
            } else {
                try {
                    let wb = XLSX.read(new Uint8Array(ev.target.result), { type: 'array' });
                    billData = { raw: wb, type: 'xlsx' };
                } catch (e) {
                    alert('文件格式错误，无法解析Excel文件。');
                    return;
                }
            }
            alert('账单已上传');
        };
        ext === 'csv' ? reader.readAsText(file) : reader.readAsArrayBuffer(file);
    });
}

// 暴露给全局
window.identifyImages = identifyImages;
window.reportImages = reportImages;
window.billData = billData;
window.handleFiles = handleFiles;
window.initUpload = initUpload;
window.ocrImagesWithTesseract = ocrImagesWithTesseract;
window.initImageUpload = initImageUpload;
window.initBillUpload = initBillUpload;
window.showOcrProgress = showOcrProgress;
window.updateOcrProgress = updateOcrProgress;
window.hideOcrProgress = hideOcrProgress;
