/**
 * Tesseract.js 延迟加载模块
 * 仅在用户切换到"诈骗识别"页面时才加载，避免首屏阻塞
 */

let tesseractLoaded = false;
let tesseractReady = false;
let tesseractResolve = null;

function loadTesseract() {
    if (tesseractReady) return Promise.resolve();
    if (tesseractLoaded) {
        return new Promise((resolve) => {
            tesseractResolve = resolve;
        });
    }
    tesseractLoaded = true;
    return new Promise((resolve) => {
        tesseractResolve = resolve;
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/tesseract.js@5.0.5/dist/tesseract.min.js';
        script.onload = () => {
            tesseractReady = true;
            if (tesseractResolve) tesseractResolve();
        };
        script.onerror = () => {
            alert('Tesseract.js 加载失败，请检查网络连接后刷新页面。');
            if (tesseractResolve) tesseractResolve();
        };
        document.head.appendChild(script);
    });
}

// 暴露给全局供其他模块调用
window.loadTesseract = loadTesseract;
