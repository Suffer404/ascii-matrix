const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
const asciiPre = document.getElementById('asciiPre');
const previewOverlay = document.getElementById('previewOverlay');

let width, height, columns;
const fontSize = 16;
let drops = [];

const defaultChars = ' .:-=+*#%@';
let charSet = defaultChars;

let currentImg = null;
let animationId = null;
let isPaused = false;
let speed = 50;
let mode = 'matrix';

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    columns = Math.floor(width / fontSize);
    if (drops.length === 0) {
        drops = new Array(columns).fill(1);
    }
}

window.addEventListener('resize', resize);
resize();

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#0F0';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = charSet.charAt(Math.floor(Math.random() * charSet.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

function animateMatrix() {
    if (isPaused || mode !== 'matrix') return;
    drawMatrix();
    animationId = setTimeout(() => requestAnimationFrame(animateMatrix), 100 - speed);
}

function imageToAscii(img, cols) {
    const tempCanvas = document.createElement('canvas');
    const tCtx = tempCanvas.getContext('2d');
    
    const rows = Math.floor((img.height / img.width) * cols * 0.55);
    tempCanvas.width = cols;
    tempCanvas.height = rows;
    
    tCtx.drawImage(img, 0, 0, cols, rows);
    const imgData = tCtx.getImageData(0, 0, cols, rows).data;
    
    let asciiLines = [];
    const invert = document.getElementById('invertCheck').checked;
    
    for (let y = 0; y < rows; y++) {
        let line = '';
        for (let x = 0; x < cols; x++) {
            const offset = (y * cols + x) * 4;
            const r = imgData[offset];
            const g = imgData[offset + 1];
            const b = imgData[offset + 2];
            const avg = (r + g + b) / 3;
            
            const len = charSet.length;
            let index = Math.floor((avg / 255) * (len - 1));
            if (!invert) index = len - 1 - index;
            
            line += charSet[index] || ' ';
        }
        asciiLines.push(line);
    }
    return asciiLines.join('\n');
}

// Mode Toggle
document.getElementById('matrixModeBtn').addEventListener('click', () => {
    mode = 'matrix';
    document.getElementById('matrixModeBtn').classList.add('active');
    document.getElementById('imageModeBtn').classList.remove('active');
    document.getElementById('imagePanel').classList.add('hidden');
    canvas.classList.remove('hidden');
    if (!isPaused) animateMatrix();
});

document.getElementById('imageModeBtn').addEventListener('click', () => {
    mode = 'image';
    document.getElementById('imageModeBtn').classList.add('active');
    document.getElementById('matrixModeBtn').classList.remove('active');
    document.getElementById('imagePanel').classList.remove('hidden');
    canvas.classList.add('hidden');
});

// Image Upload
const uploadBtn = document.getElementById('uploadBtn');
const imageUpload = document.getElementById('imageUpload');

uploadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    imageUpload.click();
});

imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            currentImg = img;
            const res = parseInt(document.getElementById('resolution').value);
            const asciiText = imageToAscii(img, res);
            
            // Show Preview
            asciiPre.textContent = asciiText;
            previewOverlay.classList.remove('hidden');
            document.getElementById('uiContainer').style.opacity = '0';
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// Preview Actions
document.getElementById('backToEditBtn').addEventListener('click', () => {
    previewOverlay.classList.add('hidden');
    document.getElementById('uiContainer').style.opacity = '1';
});

document.getElementById('previewDownloadBtn').addEventListener('click', () => {
    if (!asciiPre.textContent) return;
    const blob = new Blob([asciiPre.textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-art-by-ALIF.txt';
    a.click();
    URL.revokeObjectURL(url);
});

// Controls
document.getElementById('resolution').addEventListener('input', (e) => {
    document.getElementById('resVal').textContent = e.target.value;
});

// Misc
document.getElementById('startBtn').addEventListener('click', () => {
    isPaused = false;
    if (mode === 'matrix') animateMatrix();
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    isPaused = true;
});

document.getElementById('clearBtn').addEventListener('click', () => {
    if (mode === 'matrix') {
        ctx.clearRect(0, 0, width, height);
        drops.fill(0);
    }
});

// Start
animateMatrix();