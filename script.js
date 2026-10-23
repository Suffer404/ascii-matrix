const canvas = document.getElementById('matrix');
const asciiCanvas = document.getElementById('asciiCanvas');
const ctx = canvas.getContext('2d');
const asciiCtx = asciiCanvas.getContext('2d');

let width, height, columns;
const fontSize = 16;
let drops = [];

const defaultChars = ' .:-=+*#%@';
let charSet = defaultChars;

let currentImg = null;
let animationId;
let isPaused = false;
let speed = 50;
let mode = 'matrix';

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    columns = Math.floor(width / fontSize);
    drops = new Array(columns).fill(1);
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
    if (isPaused) return;
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
    return asciiLines.join('
');
}

function renderAsciiArt(asciiText) {
    asciiCanvas.width = window.innerWidth;
    asciiCanvas.height = window.innerHeight;
    asciiCtx.clearRect(0, 0, asciiCanvas.width, asciiCanvas.height);
    
    asciiCtx.fillStyle = 'black';
    asciiCtx.fillRect(0, 0, asciiCanvas.width, asciiCanvas.height);
    
    asciiCtx.fillStyle = '#0F0';
    asciiCtx.font = '12px monospace';
    
    const lines = asciiText.split('
');
    const lineHeight = 14;
    const startX = 20;
    const startY = 40;
    
    lines.forEach((line, index) => {
        asciiCtx.fillText(line, startX, startY + (index * lineHeight));
    });
}

// Mode Toggle
document.getElementById('matrixModeBtn').addEventListener('click', () => {
    mode = 'matrix';
    document.getElementById('matrixModeBtn').classList.add('active');
    document.getElementById('imageModeBtn').classList.remove('active');
    document.getElementById('imagePanel').classList.add('hidden');
    asciiCanvas.classList.add('hidden');
    canvas.classList.remove('hidden');
});

document.getElementById('imageModeBtn').addEventListener('click', () => {
    mode = 'image';
    document.getElementById('imageModeBtn').classList.add('active');
    document.getElementById('matrixModeBtn').classList.remove('active');
    document.getElementById('imagePanel').classList.remove('hidden');
    canvas.classList.add('hidden');
    asciiCanvas.classList.remove('hidden');
    if (currentImg) {
        const res = parseInt(document.getElementById('resolution').value);
        renderAsciiArt(imageToAscii(currentImg, res));
    }
});

// Image Upload
document.getElementById('uploadBtn').addEventListener('click', () => {
    document.getElementById('imageUpload').click();
});

document.getElementById('imageUpload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            currentImg = img;
            const res = parseInt(document.getElementById('resolution').value);
            renderAsciiArt(imageToAscii(img, res));
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// Controls
document.getElementById('resolution').addEventListener('input', (e) => {
    const val = e.target.value;
    document.getElementById('resVal').textContent = val;
    if (currentImg) {
        renderAsciiArt(imageToAscii(currentImg, parseInt(val)));
    }
});

document.getElementById('charSet').addEventListener('input', (e) => {
    charSet = e.target.value || defaultChars;
    if (currentImg) {
        const res = parseInt(document.getElementById('resolution').value);
        renderAsciiArt(imageToAscii(currentImg, res));
    }
});

document.getElementById('invertCheck').addEventListener('change', () => {
    if (currentImg) {
        const res = parseInt(document.getElementById('resolution').value);
        renderAsciiArt(imageToAscii(currentImg, res));
    }
});

document.getElementById('downloadBtn').addEventListener('click', () => {
    if (!currentImg) return;
    const res = parseInt(document.getElementById('resolution').value);
    const text = imageToAscii(currentImg, res);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-art.txt';
    a.click();
    URL.revokeObjectURL(url);
});

document.getElementById('speedRange').addEventListener('input', (e) => {
    speed = e.target.value;
});

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
    } else {
        asciiCtx.clearRect(0, 0, asciiCanvas.width, asciiCanvas.height);
        currentImg = null;
    }
});

animateMatrix();