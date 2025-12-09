

function openModal(id) {
    const modal = document.getElementById('modal-' + id);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
}

function closeModal(id) {
    const modal = document.getElementById('modal-' + id);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Close modal when clicking outside content
document.querySelectorAll('.galaxy-modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

// Optimized Collision Detection (Batch Reads/Writes)
let cachedPlanets = null;

function animateCollisions() {
    if (!cachedPlanets) {
        // Cache DOM elements once (assuming they don't change count)
        cachedPlanets = Array.from(document.querySelectorAll('.planet:not(.sun)'));
    }

    // 1. READ PHASE: Get all positions at once (One Layout Reflow)
    const planetData = cachedPlanets.map(p => {
        const rect = p.getBoundingClientRect();
        return {
            el: p,
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            collision: false
        };
    });

    const threshold = 120;

    // 2. COMPUTE PHASE (Pure JS)
    for (let i = 0; i < planetData.length; i++) {
        for (let j = i + 1; j < planetData.length; j++) {
            const p1 = planetData[i];
            const p2 = planetData[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < threshold) {
                p1.collision = true;
                p2.collision = true;
            }
        }
    }

    // 3. WRITE PHASE (Batch DOM Updates)
    planetData.forEach(p => {
        if (p.collision) {
            // Only touch DOM if necessary check prevents redudant work,
            // but reading classList logic is cheap compared to layout.
            // Using check to avoid resetting timeout if reusing logic?
            // Original logic: "if !contains { add; setTimeout(remove) }"
            if (!p.el.classList.contains('collision')) {
                p.el.classList.add('collision');
                setTimeout(() => p.el.classList.remove('collision'), 800);
            }
        }
    });

    requestAnimationFrame(animateCollisions);
}
requestAnimationFrame(animateCollisions);
// Mobile Menu Toggle
const mobileBtn = document.querySelector('.mobile-menu-btn');
const navMenu = document.querySelector('.nav-menu');

if (mobileBtn && navMenu) {
    mobileBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileBtn.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('ri-menu-line');
            icon.classList.add('ri-close-line');
        } else {
            icon.classList.remove('ri-close-line');
            icon.classList.add('ri-menu-line');
        }
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = mobileBtn.querySelector('i');
            icon.classList.remove('ri-close-line');
            icon.classList.add('ri-menu-line');
        });
    });
}

// Intersection Observer for Fade In and Timeline
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            // Optional: Stop observing once visible
            // observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in, .timeline-item').forEach(el => {
    observer.observe(el);
});

// FAQ Accordion
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const item = question.parentElement;
        const isActive = item.classList.contains('active');

        // Close all others
        document.querySelectorAll('.faq-item').forEach(i => {
            i.classList.remove('active');
        });

        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// Form Handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const btn = this.querySelector('button[type="submit"]');
        const originalText = btn.innerText;

        btn.innerText = 'Enviando...';
        btn.disabled = true;

        // Simulate sending
        setTimeout(() => {
            btn.innerText = 'Solicitação Enviada com Sucesso!';
            btn.style.backgroundColor = '#4CAF50';

            // Reset after 3 seconds
            setTimeout(() => {
                this.reset();
                btn.innerText = originalText;
                btn.disabled = false;
                btn.style.backgroundColor = '';
            }, 3000);
        }, 1500);
    });
}

// Portfolio Filtering
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        portfolioItems.forEach(item => {
            if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, 50);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    });
});

// Pre-select challenge from portfolio
function selectChallenge(type) {
    const select = document.getElementById('challenge');
    // Map portfolio types to select values
    const map = {
        'identity': 'identidade',
        'social': 'engajamento',
        'video': 'alcance',
        'web': 'outros'
    };
    if (map[type]) {
        select.value = map[type];
    }
}

// WhatsApp Mask
const phoneInput = document.getElementById('whatsapp');
if (phoneInput) {
    phoneInput.addEventListener('input', function (e) {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
        e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });
}

// Form Handling with Validation and Success State
// Form Handling with Validation and Success State
const contactFormDetail = document.getElementById('contactForm');
if (contactFormDetail) {
    contactFormDetail.addEventListener('submit', function (e) {
        e.preventDefault();

        const btn = this.querySelector('button[type="submit"]');
        const originalContent = btn.innerHTML;
        const form = this;
        const successMsg = document.getElementById('successMessage');

        // Basic Validation
        const name = document.getElementById('name').value;
        const whatsapp = document.getElementById('whatsapp').value;

        if (whatsapp.length < 14) {
            alert('Por favor, digite um número de WhatsApp válido.');
            return;
        }

        // Loading State
        btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Enviando...';
        btn.disabled = true;

        // Simulate sending
        setTimeout(() => {
            // Hide form, show success
            form.style.display = 'none';
            successMsg.style.display = 'block';

            // Scroll to success message
            successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Reset form for next time (if page reloaded)
            form.reset();
        }, 2000);
    });
}

// Header Scroll Effect - Optimized with rAF throttling
const header = document.querySelector('.header');
let isScrolling = false;

window.addEventListener('scroll', () => {
    if (!isScrolling) {
        window.requestAnimationFrame(() => {
            if (header) {
                if (window.scrollY > 50) {
                    header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                    header.style.background = 'rgba(255, 255, 255, 0.98)';
                } else {
                    header.style.boxShadow = 'var(--shadow-sm)';
                    header.style.background = 'rgba(255, 255, 255, 0.95)';
                }
            }
            isScrolling = false;
        });
        isScrolling = true;
    }
});
// --- NUMBER ANIMATION ---
document.addEventListener('DOMContentLoaded', () => {
    const counters = document.querySelectorAll('.counter');

    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.getAttribute('data-target');
                const prefix = counter.getAttribute('data-prefix') || '';
                const suffix = counter.getAttribute('data-suffix') || '';
                const duration = 4000; // 4 seconds for slower, more dramatic effect
                const start = 0;
                const startTime = performance.now();

                const updateCount = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    // Ease Out Quint (smoother deceleration)
                    const ease = 1 - Math.pow(1 - progress, 5);

                    const current = Math.floor(ease * (target - start) + start);

                    counter.innerText = `${prefix}${current}${suffix}`;

                    if (progress < 1) {
                        requestAnimationFrame(updateCount);
                    } else {
                        counter.innerText = `${prefix}${target}${suffix}`;
                    }
                };

                requestAnimationFrame(updateCount);
                observer.unobserve(counter);
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        observer.observe(counter);
    });
});

if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll(".tilt-card"), {
        max: 15,
        speed: 400,
        glare: true,
        "max-glare": 0.2,
        scale: 1.02
    });

    // Also apply subtle tilt to other cards
    VanillaTilt.init(document.querySelectorAll(".bento-card:not(.tilt-card)"), {
        max: 5,
        speed: 400,
        glare: true,
        "max-glare": 0.1,
        scale: 1.01
    });
}

// --- 3D CUBE INTERACTION ---
(function () {
    const cube = document.getElementById('interactive-cube');
    const scene = document.querySelector('.cube-scene');
    const hero = document.querySelector('.hero');
    if (!cube || !scene) return;

    let isDragging = false;
    let startX, startY;
    let currentX = -15; // Base rotation X
    let currentY = -15; // Base rotation Y
    let autoRotate = true;
    let autoRotateSpeed = 0.5;
    let lastTime = 0;



    // Remove CSS animation to let JS control it completely for smooth interaction
    cube.style.animation = 'none';
    cube.style.cursor = 'grab';

    // Visibility Check for Performance
    let isVisible = true;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isVisible = entry.isIntersecting;
            if (isVisible) {
                lastTime = 0; // Reset time to avoid huge delta
                requestAnimationFrame(animate);
            }
        });
    }, { threshold: 0 });

    observer.observe(scene);

    function animate(time) {
        if (!isVisible) return; // Stop loop if not visible

        if (!lastTime) lastTime = time;
        const delta = time - lastTime;
        lastTime = time;

        if (autoRotate && !isDragging) {
            currentY += autoRotateSpeed * (delta / 16); // Normalize to ~60fps
        }

        const finalX = currentX;
        const finalY = currentY;

        cube.style.transform = `translateZ(-150px) rotateX(${finalX}deg) rotateY(${finalY}deg)`;
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);


    // Mouse Events for Dragging
    scene.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        cube.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        currentY += deltaX * 0.5;
        currentX -= deltaY * 0.5;

        startX = e.clientX;
        startY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        cube.style.cursor = 'grab';
    });

    // Touch Events
    scene.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const deltaX = e.touches[0].clientX - startX;
        const deltaY = e.touches[0].clientY - startY;

        currentY += deltaX * 0.5;
        currentX -= deltaY * 0.5;

        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        e.preventDefault(); // Prevent scroll while rotating
    });

    window.addEventListener('touchend', () => {
        isDragging = false;
    });
})();

// ML3 Planet Click Handler
document.addEventListener('DOMContentLoaded', () => {
    const ml3Planet = document.getElementById('ml3-planet');
    if (ml3Planet) {
        ml3Planet.addEventListener('click', function () {
            // Visual feedback
            this.style.transform = 'scale(1.05)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);

            // Scroll to plans
            const plansSection = document.getElementById('planos');
            if (plansSection) {
                plansSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
});

// --- HOLOGRAPHIC CARDS (Problem Section) ---
const initHolographicCards = () => {
    const problemCards = document.querySelectorAll('.problem-card');

    problemCards.forEach(card => {
        let bounds;
        let currentX, currentY;
        let rafId = null;

        const updateCard = () => {
            if (!bounds) return;
            const x = currentX - bounds.left;
            const y = currentY - bounds.top;

            const centerX = bounds.width / 2;
            const centerY = bounds.height / 2;

            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
            card.style.setProperty('--bg-x', `${(x / bounds.width) * 100}%`);
            card.style.setProperty('--bg-y', `${(y / bounds.height) * 100}%`);
            card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

            rafId = null;
        };

        card.addEventListener('mouseenter', () => {
            bounds = card.getBoundingClientRect();
        });

        card.addEventListener('mousemove', (e) => {
            currentX = e.clientX;
            currentY = e.clientY;
            if (!bounds) bounds = card.getBoundingClientRect(); // Fallback

            if (!rafId) {
                rafId = requestAnimationFrame(updateCard);
            }
        });

        card.addEventListener('mouseleave', () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg)';
            card.style.setProperty('--x', `50%`);
            card.style.setProperty('--y', `50%`);
            card.style.setProperty('--bg-x', '50%');
            card.style.setProperty('--bg-y', '50%');
        });
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHolographicCards);
} else {
    initHolographicCards();
}





