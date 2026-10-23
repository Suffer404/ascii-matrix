const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

let width, height, columns;
const fontSize = 16;
let drops = [];

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()*&^%';

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    columns = Math.floor(width / fontSize);
    drops = new Array(columns).fill(1);
}

window.addEventListener('resize', resize);
resize();

let animationId;
let isPaused = false;
let speed = 50;

function draw() {
    if (isPaused) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#0F0';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

function animate() {
    setTimeout(() => {
        draw();
        animationId = requestAnimationFrame(animate);
    }, 100 - speed);
}

document.getElementById('startBtn').addEventListener('click', () => {
    if (isPaused) {
        isPaused = false;
    } else if (!animationId) {
        animate();
    }
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    isPaused = true;
});

document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.clearRect(0, 0, width, height);
    drops.fill(0);
});

document.getElementById('speedRange').addEventListener('input', (e) => {
    speed = e.target.value;
});

// Auto-start
animate();