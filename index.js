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

    document.querySelectorAll('.gameDBox[data-project]').forEach(card => {
        card.addEventListener('click', () => openOverlay(card.dataset.project));
    });

    document.getElementById('overlayClose').addEventListener('click', closeOverlay);

    document.getElementById('projectOverlay').addEventListener('click', function(e) {
        if (e.target === this) closeOverlay();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeOverlay();
    });
};

const projectDevLogs = {
    'gallos-kernow': {
        title: 'Gallos Kernow',
        img: 'img/GallosKernow.png',
        link: 'https://gourav-ranganath.itch.io/gallos-kernow',
        overview: "A Master's group project developed in partnership with Cornwall Council, designed to teach local primary school students resilience in dangerous situations. The game focuses on the types of hazards children might encounter around Cornwall, turning safety education into an engaging, interactive experience.",
        devLog: "I was responsible for the project's backend systems. I implemented a singleton GameManager to coordinate game state across scenes, and developed the RTS map alongside the UI and gameplay logic for the firefighting scene. I also built the score system used to track and reward player progress.",
        challenges: "The module placed a strong emphasis on agile practice, and delivering to a real client brief as part of a team taught me a great deal about agile workflows, iterative development, and collaborating effectively towards a shared goal."
    },
    'galactic-awakening': {
        title: 'Galactic Awakening',
        img: 'img/GalacticAwakening.png',
        link: 'https://dredddev.itch.io/galactic-awakening',
        overview: "My final year solo advanced game project for my Bachelor's degree, and my most technically ambitious solo undertaking at the time, spanning both programming and 3D art.",
        devLog: "I developed the core systems, including an inventory and crafting system, ranged combat, and state-driven AI enemies. The standout feature was a physics-based third person player controller with layered animations, splitting the upper and lower body so the character could aim and act independently of their movement.\n\nOn the art side, I 3D modelled the low poly characters (rigged using Mixamo), along with the props, weapons and items. Some of the weapons were modelled by one of my course mates, and the vegetation was sourced from a free asset pack.",
        challenges: "This project taught me the importance of writing clean, maintainable code. I initially managed all player behaviour from a single script, which made it increasingly difficult to add the features I wanted. Working through this problem led me to discover state machines, an approach that has shaped how I structure my code ever since."
    },
    'untitled-racing-game': {
        title: 'Untitled Racing Game',
        img: 'img/UnRacingGame.png',
        link: 'https://dredddev.itch.io/untitledracinggame',
        overview: "A solo project developed for my second year 3D level design module. The brief was to design and build a racing game across three track levels, each featuring its own obstacles.",
        devLog: "I used Unity Standard Assets for the vehicle assets, logic and AI, Cinemachine for camera behaviour, and EasyRoads3D to sculpt and paint roads directly into the terrain. To add an element of unpredictability, I integrated an animated deer model from the asset store as a free-roaming AI obstacle that turns into a ragdoll on collision with a car.\n\nI designed the UI using assets I created in Photoshop, including a procedurally generated speedometer. The core race systems — lap counting, racer ranking, and reset/respawn — were built on a waypoint-based system to keep everything in sync as vehicles moved around the track.",
        challenges: "I encountered issues with render textures while implementing a rear view mirror on the GUI, where some trees failed to render correctly through the mirror. It's a problem I'd return to and resolve given the opportunity, and it gave me a useful early insight into the quirks of working with render textures in Unity."
    },
    'roost-runner': {
        title: 'Roost Runner',
        img: 'img/RoostRunner.png',
        link: 'https://dredddev.itch.io/roost-runner',
        overview: "My first ever solo Unity project, created in the first year of my Bachelor's for a 2D level design module. The brief was open-ended — to build a 2D mobile game of our choice — so I developed an endless runner that blends several different endless runner styles together.",
        devLog: "The character, enemy, tunnel, obstacle and power-up sprites were sourced from itch.io, with a number created by myself. I implemented enemy AI navigation using A* pathfinding, and developed the 2D physics-based player controller from scratch using Unity's legacy input system, complete with custom touch interaction detection for mobile."
    },
    'trammered': {
        title: 'Trammered',
        img: 'img/Trammered.png',
        link: 'https://leo-funari.itch.io/jam-trammered',
        overview: "A university game jam project developed during the first year of my Bachelor's.",
        devLog: "I modelled the hand seen holding the beer bottle in front of the player camera, and designed and set up the menu scene, which used thrown bottles to select the menu buttons. I also developed the map puzzle that formed the core of the experience."
    },
    'dish-dasher': {
        title: 'Dish Dasher',
        img: 'img/DishDasher.png',
        link: 'https://oliver-smith.itch.io/dish-dasher',
        overview: "A university game jam project centred on fast, satisfying arcade gameplay.",
        devLog: "I developed the core gameplay mechanics, including a player controller with horizontal movement driven by pointer position and a click input to swing the bat. I also built the score system, rewarding players for stacking and smashing plates."
    },
    'cyber-elite': {
        title: 'Cyber Elite',
        img: 'img/CyberElite.png',
        link: 'https://nyanzak.itch.io/cyber-elite',
        overview: "The first game I ever developed, created for a group university project during the first year of my Bachelor's — the project that began my journey into game development.",
        devLog: "I developed the level components from the ground up, including teleporters with a custom glitchy shader, falling platforms, level endpoints, and shock areas with an arcing shader. Alongside this I built a physics-based player controller, enemy AI, a lives system, and a score system.",
        challenges: "Being introduced to shaders, AI and physics on my very first project was a steep learning curve, but tackling such a broad range of systems early on gave me a strong, hands-on grounding across the full stack that I've continued to build on."
    }
};

function openOverlay(projectId) {
    const project = projectDevLogs[projectId];
    if (!project) return;

    document.getElementById('overlayImg').src = project.img;
    document.getElementById('overlayTitle').textContent = project.title;
    document.getElementById('overlayLink').href = project.link;

    let html = `<h4 class="overlay-section-title">Overview</h4><p>${project.overview}</p>`;

    html += `<h4 class="overlay-section-title">Dev Log</h4>`;
    project.devLog.split('\n\n').forEach(para => {
        html += `<p>${para}</p>`;
    });

    if (project.challenges) {
        html += `<h4 class="overlay-section-title">Challenges &amp; Learnings</h4><p>${project.challenges}</p>`;
    }

    document.getElementById('overlayContent').innerHTML = html;
    document.getElementById('projectOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeOverlay() {
    document.getElementById('projectOverlay').classList.remove('active');
    document.body.style.overflow = '';
}