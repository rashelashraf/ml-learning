// Home Page Specific JavaScript

document.addEventListener('DOMContentLoaded', function () {
    initializeHomePage();
});

function initializeHomePage() {
    animateHeroElements();
    initializeFeatureCards();
    animateStatNumbers();
    initializeParticleBackground();
    initializeScrollAnimations();
}

// -------- HERO PIPELINE ANIMATIONS --------
function animateHeroElements() {
    const pipelineNodes = document.querySelectorAll('.pipeline-node');
    const pipelineArrows = document.querySelectorAll('.pipeline-arrow');

    pipelineNodes.forEach((node, index) => {
        function nodePulse() {
            node.style.transform = 'scale(1.1)';
            node.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.5)';
            setTimeout(() => {
                node.style.transform = 'scale(1)';
                node.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
                setTimeout(nodePulse, 4000 + index * 800);
            }, 600);
        }
        setTimeout(nodePulse, index * 800);
    });

    pipelineArrows.forEach((arrow, index) => {
        function arrowPulse() {
            arrow.style.transform = 'scale(1.2)';
            arrow.style.color = '#ff6b6b';
            setTimeout(() => {
                arrow.style.transform = 'scale(1)';
                arrow.style.color = 'white';
                setTimeout(arrowPulse, 4000 + index * 800 + 400);
            }, 300);
        }
        setTimeout(arrowPulse, index * 800 + 400);
    });
}

// -------- FEATURE CARD ANIMATIONS --------
function initializeFeatureCards() {
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        // Stagger initial animation
        setTimeout(() => card.classList.add('animate-in'), index * 200);

        card.addEventListener('mouseenter', function () {
            const icon = this.querySelector('.feature-icon');
            const highlights = this.querySelectorAll('.highlight');
            if (icon) {
                icon.style.transform = 'scale(1.2) rotate(10deg)';
                icon.style.transition = 'all 0.3s ease';
            }
            highlights.forEach((highlight, i) => {
                setTimeout(() => {
                    highlight.style.transform = 'scale(1.1)';
                    highlight.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.3)';
                }, i * 100);
            });
        });

        card.addEventListener('mouseleave', function () {
            const icon = this.querySelector('.feature-icon');
            const highlights = this.querySelectorAll('.highlight');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
            highlights.forEach(highlight => {
                highlight.style.transform = 'scale(1)';
                highlight.style.boxShadow = 'none';
            });
        });

        card.addEventListener('click', function () {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    this.style.transform = 'translateY(-10px) scale(1)';
                }, 100);
            }, 100);
        });
    });
}

// -------- STATISTICS COUNTER ANIMATION --------
function animateStatNumbers() {
    const statCards = document.querySelectorAll('.stat-card');

    if (statCards.length === 0) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target.querySelector('.stat-number');
                if (statNumber && !statNumber.classList.contains('animated')) {
                    statNumber.classList.add('animated');
                    animateNumber(statNumber, parseInt(statNumber.getAttribute('data-target')) || 0, 1000);
                }
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statCards.forEach(card => observer.observe(card));
}

function animateNumber(element, target, duration) {
    let start = 0;
    const stepTime = Math.abs(Math.floor(duration / target));
    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        let progress = timestamp - startTime;
        let value = Math.min(Math.round((progress / duration) * target), target);
        element.textContent = value.toLocaleString();
        if (value < target) {
            requestAnimationFrame(step);
        } else {
            element.textContent = target.toLocaleString();
        }
    }
    requestAnimationFrame(step);
}

// -------- PARTICLE BACKGROUND & SCROLL ANIMATIONS --------
function initializeParticleBackground() {
    // Only initialize if a target container exists
    const particleContainer = document.getElementById('particle-background');
    if (!particleContainer) return;
    // Example placeholder: Use your own or a library like particles.js
    // This is a stub
    // particlesJS.load('particle-background', 'path/to/particles-config.json');
}

function initializeScrollAnimations() {
    // Example: Add 'scrolled' class to sections when in view
    const animSections = document.querySelectorAll('.scroll-animate');
    if (!animSections.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scrolled');
            }
        });
    }, { threshold: 0.2 });

    animSections.forEach(section => observer.observe(section));
}
