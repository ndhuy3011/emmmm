document.addEventListener('DOMContentLoaded', () => {

    /* ============================================================
       CINEMATIC ENGINE & 3D PARALLAX OVERHAUL
    ============================================================ */
    const introScreen = document.getElementById('intro-screen');
    const appContainer = document.getElementById('app-container');
    const tiltWrapper = document.getElementById('tilt-wrapper');
    const ambientGlow = document.getElementById('ambient-glow');
    
    // UNVEILING ENTRANCE
    document.getElementById('start-btn').addEventListener('click', () => {
        // Fade out wrapper
        introScreen.style.opacity = '0';
        introScreen.style.pointerEvents = 'none';
        
        // Command Canvas to explode particles
        bgEffect.explode();

        // Reveal the main App in 3D space smoothly
        setTimeout(() => {
            appContainer.style.opacity = '1';
            appContainer.style.pointerEvents = 'auto';
        }, 800);
    });

    // PURE CANVAS PARTICLE GRAPHIC RENDERER
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    
    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 0.1; // tiny elegant dots
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.life = Math.random() * 0.5 + 0.5; // opacity
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(244, 162, 152, ${this.life})`;
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#f4a298';
            ctx.fill();
        }
    }

    for (let i = 0; i < 150; i++) particles.push(new Particle()); // 150 floating magical embers

    const bgEffect = {
        speedMult: 1,
        explode: function() {
            this.speedMult = 18; // Hyperspeed explosion
            particles.forEach(p => {
                p.vx = (Math.random() - 0.5) * this.speedMult;
                p.vy = (Math.random() - 0.5) * this.speedMult;
            });
            setTimeout(() => {
                const slowDown = setInterval(() => {
                    this.speedMult *= 0.88;
                    particles.forEach(p => { p.vx *= 0.88; p.vy *= 0.88; });
                    if (this.speedMult < 1) {
                        clearInterval(slowDown);
                        particles.forEach(p => {
                            p.vx = (Math.random() - 0.5) * 0.4;
                            p.vy = (Math.random() - 0.5) * 0.4;
                        });
                    }
                }, 50);
            }, 600);
        }
    }

    function animateBg() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animateBg);
    }
    animateBg();

    // SPOTLIGHT TRACKING & GLOBAL 3D TILT
    window.addEventListener('mousemove', (e) => {
        // Spotlight Glow beneath elements
        ambientGlow.style.left = e.clientX + 'px';
        ambientGlow.style.top = e.clientY + 'px';

        // Map mouse location to internal boundary limits for CSS pseudo elements matching
        document.querySelectorAll('.quiz-options button').forEach(btn => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            btn.style.setProperty('--x', `${x}px`);
            btn.style.setProperty('--y', `${y}px`);
        });

        // Massive 3D Tilt calculation based on cursor delta from center
        const xAxis = (window.innerWidth / 2 - e.pageX) / 45; // Gentle divisor
        const yAxis = (window.innerHeight / 2 - e.pageY) / 45;
        tiltWrapper.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    });

    // Reset rotation if cursor left
    window.addEventListener('mouseout', () => { tiltWrapper.style.transform = `rotateY(0deg) rotateX(0deg)`; });


    /* ============================================================
       QUIZ VANTAGE LOGIC
    ============================================================ */
    const gameCard = document.getElementById('game-card');
    const mainCard = document.getElementById('main-card');
    const successCard = document.getElementById('success-card');
    const questionEl = document.getElementById('quiz-question');
    const optionsEl = document.getElementById('quiz-options');
    const feedbackEl = document.getElementById('quiz-feedback');

    const questionPool = [
        { q: "Nhận được quà với tấm thiệp của em anh cảm thấy sao?", options: ["Cũng bình thường", "Vui sướng nguyên một ngày 🥰", "Chả cảm xúc gì"], correct: 1 },
        { q: "Em đoán xem anh nghĩ gì khi cầm lá thư ấy?", options: ["Viết chữ xấu quá", "Cười tủm tỉm vì quá đáng yêu ❤️", "Đọc xong thì thôi"], correct: 1 },
        { q: "Ai là người dễ thương và tinh tế nhất thế giới?", options: ["Cô gái đang lướt màn hình này 💖", "Một cô Hoa hậu nào đó", "Không ai cả"], correct: 0 }
    ];

    let currentQuestionIndex = -1;

    function loadRandomQuestion() {
        let newIndex;
        do { newIndex = Math.floor(Math.random() * questionPool.length); } while (newIndex === currentQuestionIndex && questionPool.length > 1);
        currentQuestionIndex = newIndex;
        const currentQ = questionPool[currentQuestionIndex];

        questionEl.innerText = currentQ.q;
        optionsEl.innerHTML = '';
        const quizContainer = document.querySelector('.quiz-container');

        currentQ.options.forEach((optText, i) => {
            const btn = document.createElement('button');
            btn.innerText = optText;
            
            btn.addEventListener('click', () => {
                if (i === currentQ.correct) {
                    btn.classList.add('correct');
                    feedbackEl.style.color = '#10b981';
                    feedbackEl.innerText = "Chính xác tuyệt đối! Đang mã hóa... ✨";
                    
                    setTimeout(() => {
                        // Smooth swap 3D depth fade 
                        gameCard.classList.remove('active-card');
                        gameCard.classList.add('hidden');
                        mainCard.classList.remove('hidden');
                        mainCard.classList.add('active-card');
                        
                        bgEffect.explode(); // Boom magic!
                    }, 1400);
                } else {
                    btn.classList.add('wrong');
                    feedbackEl.style.color = '#ef4444';
                    const errors = ["Úi sai rùi! Chọn lại đi bé ơi 😝", "Biết thừa mà cố tình ấn nhầm hả? 🤨", "Khum đúng nha! Trả lời lại nà~"];
                    feedbackEl.innerText = errors[Math.floor(Math.random() * errors.length)];
                    setTimeout(() => {
                        feedbackEl.innerText = "";
                        loadRandomQuestion();
                    }, 1500);
                }
            });
            optionsEl.appendChild(btn);
        });
    }
    loadRandomQuestion();
});
