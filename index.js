window.onload = function () {

    function adjustLayout() {
        if (window.innerHeight > window.innerWidth) {
            document.body.classList.add("portrait-mode");
            document.body.classList.remove("landscape-mode");
        } else {
            document.body.classList.add("landscape-mode");
            document.body.classList.remove("portrait-mode");
        }
    }
    adjustLayout();
    let bounceEnabled = false;
    const textElement = document.querySelector(".introTitle");
    const text = "Hey, I'm Drew!";
    let index = 0;

    textElement.innerHTML = `<span id="typedText"></span><span id="cursor">_</span>`;
    const typedText = document.getElementById("typedText");
    const cursor = document.getElementById("cursor");
    const contentElements = document.querySelectorAll(".introFade");

    function typeEffect() {
        if (index < text.length) {
            typedText.innerHTML = text.substring(0, index + 1);
            index++;
            setTimeout(typeEffect, 100);
        } else {
            blinkCursor();
            setTimeout(revealContent, 500);
        }
    }

    function blinkCursor() {
        setInterval(() => {
            cursor.style.visibility = cursor.style.visibility === "hidden" ? "visible" : "hidden";
        }, 500);
    }

    function revealContent() {
        bounceEnabled = true;
        contentElements.forEach((element, i) => {
            setTimeout(() => {
                element.classList.add("showContent");
            }, i * 300);
        });
    }

    typedText.innerHTML = "";
    typeEffect();
    //BG Effect
    const canvas = document.getElementById("backgroundCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = document.documentElement.scrollHeight;
    }
    resizeCanvas();
    function onResize() {
        adjustLayout();
        resizeCanvas();
    }
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", resizeCanvas);


    let raindrops = [];
    let obstacles = [];
    let splashParticles = [];

    const gravity = 0.025;
    const bounciness = 0.6;
    const fadeSpeed = 0.02;
    const obstacleDodgeChance = 0.3;

    const customFont = "'DotGothic16', sans-serif";
    const japaneseChars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

    function getRandomChar() {
        return japaneseChars[Math.floor(Math.random() * japaneseChars.length)];
    }

    function getObstacles() {
        obstacles = [];
        document.querySelectorAll(".obst").forEach(element => {
            const rect = element.getBoundingClientRect();
            obstacles.push({
                left: rect.left + window.scrollX,
                right: rect.right + window.scrollX,
                top: rect.top + window.scrollY,
                bottom: rect.bottom + window.scrollY
            });
        });
    }
    class SplashParticle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
            this.size = Math.random() * 4 + 2;
            this.opacity = 1;
            this.color = color;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.opacity -= 0.05;
            return this.opacity > 0;
        }

        draw(ctx) {
            ctx.fillStyle = this.color.replace(/, 1\)/, `, ${this.opacity})`);
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
    }
    class Raindrop {
        constructor(x, y, speed) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = speed;
            this.char = getRandomChar();
            this.size = Math.random() * 20 + 10;
            this.greenValue = Math.floor(Math.random() * 255);
            this.color = `rgba(0, ${this.greenValue}, 0, 1)`;
            this.opacity = 1;
            this.bouncing = false;
            this.dodgesObstacles = Math.random() < obstacleDodgeChance;
        }

        fall() {
            this.vy += gravity;
            this.y += this.vy;
            this.x += this.vx;

            if (this.y > canvas.height) {
                this.reset();
            }

            if (!this.dodgesObstacles) {
                obstacles.forEach(obstacle => {
                    if (bounceEnabled && !this.bouncing &&
                        this.greenValue >= 100 &&
                        this.y + this.size >= obstacle.top &&
                        this.y <= obstacle.bottom &&
                        this.x >= obstacle.left &&
                        this.x <= obstacle.right) {
                        this.bounce();
                    }
                });
            }

            if (this.bouncing) {
                this.opacity -= fadeSpeed;
                if (this.opacity <= 0) this.remove();
            }
        }

        bounce() {
            this.bouncing = true;
            this.vy *= -bounciness;
            this.vx = (Math.random() - 0.5) * 4;

            for (let i = 0; i < 25; i++) {
                splashParticles.push(new SplashParticle(this.x, this.y, this.color));
            }
        }

        reset() {
            this.size = Math.random() * 20 + 10;
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * -50;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = Math.random() * 2 + 1;
            this.opacity = 1;
            this.greenValue = Math.floor(Math.random() * 255);
            this.color = `rgba(0, ${this.greenValue}, 0, 1)`;
            this.bouncing = false;
            this.dodgesObstacles = Math.random() < obstacleDodgeChance;
        }

        remove() {
            let index = raindrops.indexOf(this);
            if (index > -1) {
                raindrops.splice(index, 1);
            }
        }
        
        draw(ctx) {
            this.color = `rgba(0, ${this.greenValue}, 0, ${this.opacity})`;
            
            ctx.font = `${this.size}px ${customFont}`;
            ctx.fillStyle = this.color;
            ctx.fillText(this.char, this.x, this.y);
        }
    }

    function spawnRaindrops() {
        raindrops.push(new Raindrop(
            Math.random() * canvas.width, 
            Math.random() * -50, 
            Math.random() * 2 + 1
        ));
        if (raindrops.length > 200) raindrops.splice(0, 25);
    }

    function animateRain() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        raindrops.forEach(drop => {
            drop.fall();
            drop.draw(ctx);
        });

        splashParticles = splashParticles.filter(p => p.update());
        splashParticles.forEach(p => p.draw(ctx));

        requestAnimationFrame(animateRain);
    }

    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        getObstacles();
    });

    getObstacles();
    setInterval(spawnRaindrops, 50);
    animateRain();
};