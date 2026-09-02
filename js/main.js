// Main JavaScript for ML/DL Teaching Tool

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeInteractiveElements();
    initializeSliders();
    initializeAnimations();
});

// Navigation functionality
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    // Mobile hamburger menu
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animate hamburger
            hamburger.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu) {
                navMenu.classList.remove('active');
            }
            if (hamburger) {
                hamburger.classList.remove('active');
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navMenu && hamburger && 
            !navMenu.contains(e.target) && 
            !hamburger.contains(e.target)) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
}


        // Interactive demonstrations
        function showDetails(method) {
            const details = {
                'onehot': 'One-Hot Encoding creates binary columns for each category. Perfect for nominal data with no inherent order.',
                'label': 'Label Encoding assigns integers (0, 1, 2...) to categories. Best for ordinal data with natural ordering.',
                'ordinal': 'Ordinal Encoding maps categories to ordered integers based on specified order (e.g., low=1, medium=2, high=3).',
                'binary': 'Binary Encoding converts categories to binary representation, reducing dimensionality compared to one-hot.',
                'target': 'Target Encoding replaces categories with target variable statistics (mean, median). Risk of overfitting.',
                'frequency': 'Frequency Encoding replaces categories with their frequency counts in the dataset.',
                'normalize': 'Min-Max Normalization scales features to [0,1] range: (x - min) / (max - min)',
                'standardize': 'Standardization centers data: (x - mean) / std. Results in mean=0, std=1.',
                'robust': 'Robust Scaling uses median and IQR: (x - median) / IQR. Less sensitive to outliers.',
                'quantile': 'Quantile Transformation maps to uniform or normal distribution using cumulative distribution function.',
                'binning': 'Binning converts continuous variables into discrete bins (e.g., age groups).',
                'log': 'Log Transformation: log(x). Reduces right skewness and handles exponential relationships.',
                'embedding': 'Embedding Layers learn dense vector representations for categorical variables in neural networks.',
                'hashing': 'Feature Hashing uses hash function to map categories to fixed-size feature space.',
                'catboost': 'CatBoost handles categorical features natively without preprocessing.',
                'polynomial': 'Polynomial Features create interaction terms and powers of existing features.'
            };
            
            alert(details[method] || 'Method details not available.');
        }

        function showEncoding(type) {
            const info = {
                'categorical': 'Categorical data represents discrete categories or groups (colors, cities, product types).',
                'ordinal': 'Ordinal data has categories with meaningful order (ratings: poor < good < excellent).',
                'nominal': 'Nominal data has categories without order (colors: red, blue, green).'
            };
            
            alert(info[type] || 'Information not available.');
        }

        function launchDemo(type) {
            const demos = {
                'categorical': 'Categorical Encoding Demo: Interactive comparison of one-hot, label, and target encoding',
                'numerical': 'Numerical Scaling Demo: Visualize effects of different scaling methods on distributions',
                'advanced': 'Advanced Techniques Demo: Explore embedding layers and feature hashing',
                'comparison': 'Method Comparison: Side-by-side performance comparison on real datasets'
            };
            
            alert(demos[type] || 'Demo not available.');
        }

        // Animation and interactions
        document.addEventListener('DOMContentLoaded', function() {
            // Scroll animations
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.animation = 'fadeInUp 0.6s ease-out';
                    }
                });
            });

            document.querySelectorAll('.method-card, .technique-card').forEach(card => {
                observer.observe(card);
            });

            // Interactive technique cards
            document.querySelectorAll('.technique-card').forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'scale(1.05) rotateY(5deg)';
                    this.style.borderColor = '#FFD700';
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'scale(1) rotateY(0deg)';
                    this.style.borderColor = 'transparent';
                });
            });

            // Tree node interactions
            document.querySelectorAll('.tree-node').forEach(node => {
                node.addEventListener('click', function() {
                    // Reset all nodes
                    document.querySelectorAll('.tree-node').forEach(n => {
                        n.style.background = 'white';
                        n.style.color = 'black';
                    });
                    
                    // Highlight clicked node
                    this.style.background = '#667eea';
                    this.style.color = 'white';
                });
            });
        });

 

  


// Initialize interactive elements
function initializeInteractiveElements() {
    // Feature cards navigation
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('click', function() {
            const href = this.getAttribute('onclick');
            if (href && href.includes('window.location.href')) {
                const url = href.match(/'([^']+)'/)[1];
                window.location.href = url;
            }
        });
    });

    // Add hover effects
    addHoverEffects();
}

// Add hover effects to interactive elements
function addHoverEffects() {
    const interactiveElements = document.querySelectorAll(
        '.feature-card, .model-card, .task-card, .concept-card, .practice-card'
    );
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
            this.style.transition = 'all 0.3s ease';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}


// Ensemble approach

        // Add some interactive elements
        document.addEventListener('DOMContentLoaded', function() {
            // Animate ensemble visualization on scroll
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.animation = 'fadeIn 1s ease-in';
                    }
                });
            });

            document.querySelectorAll('.technique-card').forEach(card => {
                observer.observe(card);
            });

            // Add hover effects to algorithm cards
            document.querySelectorAll('.algorithm-card').forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'scale(1.05) rotateY(5deg)';
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'scale(1) rotateY(0deg)';
                });
            });
        });


        // Interactive feature selection demo
        function showDetails(method) {
            const details = {
                'correlation': 'Pearson correlation measures linear relationships between continuous variables and target.',
                'chi-square': 'Chi-square test evaluates independence between categorical features and categorical targets.',
                'mutual-info': 'Mutual information captures both linear and non-linear dependencies between variables.',
                'variance': 'Variance threshold removes features with low variance (near-constant values).',
                'forward': 'Forward selection starts with empty set and iteratively adds best performing features.',
                'backward': 'Backward elimination starts with all features and removes worst performing ones.',
                'rfe': 'RFE recursively eliminates features based on model importance scores.',
                'genetic': 'Genetic algorithm evolves feature subsets using crossover and mutation.',
                'lasso': 'LASSO uses L1 regularization to drive irrelevant feature coefficients to zero.',
                'ridge': 'Ridge regression uses L2 regularization to shrink coefficients of correlated features.',
                'tree-importance': 'Tree models calculate feature importance based on how much each feature decreases impurity.',
                'elastic-net': 'Elastic Net combines L1 and L2 penalties to handle grouped features effectively.'
            };
            
            alert(details[method] || 'Method details not available.');
        }

        function launchDemo(type) {
            const demos = {
                'filter': 'Filter Methods Demo: Interactive correlation and statistical testing visualization',
                'wrapper': 'Wrapper Methods Demo: Step-by-step forward/backward selection simulation',
                'embedded': 'Embedded Methods Demo: Real-time LASSO coefficient shrinkage visualization',
                'comparison': 'Method Comparison: Side-by-side performance comparison on sample datasets'
            };
            
            alert(demos[type] || 'Demo not available.');
        }

        // Animate feature boxes on load
        document.addEventListener('DOMContentLoaded', function() {
            // Animate importance bars
            setTimeout(() => {
                document.querySelectorAll('.bar').forEach((bar, index) => {
                    setTimeout(() => {
                        bar.style.transform = 'scaleX(1)';
                        bar.style.transformOrigin = 'left';
                    }, index * 200);
                });
            }, 500);

            // Interactive feature grid
            document.querySelectorAll('.feature-box').forEach(box => {
                box.addEventListener('click', function() {
                    if (this.classList.contains('removed')) {
                        this.classList.remove('removed');
                        this.classList.add('selected');
                    } else if (this.classList.contains('selected')) {
                        this.classList.remove('selected');
                    } else {
                        this.classList.add('selected');
                    }
                });
            });

            // Scroll animations
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.animation = 'fadeInUp 0.6s ease-out';
                    }
                });
            });

            document.querySelectorAll('.method-card, .technique-item').forEach(card => {
                observer.observe(card);
            });
        });

    


   


// Initialize slider value displays
function initializeSliders() {
    const sliders = [
        { id: 'num-points', display: 'points-value' },
        { id: 'noise-level', display: 'noise-value' },
        { id: 'reg-num-points', display: 'reg-points-value' },
        { id: 'reg-noise-level', display: 'reg-noise-value' },
        { id: 'poly-degree', display: 'degree-value' },
        { id: 'cluster-num-points', display: 'cluster-points-value' },
        { id: 'num-clusters', display: 'clusters-value' },
        { id: 'num-layers', display: 'layers-value' },
        { id: 'neurons-per-layer', display: 'neurons-value' },
        { id: 'nn-learning-rate', display: 'lr-value' }
    ];

    sliders.forEach(slider => {
        const element = document.getElementById(slider.id);
        const display = document.getElementById(slider.display);
        
        if (element && display) {
            // Set initial value
            display.textContent = element.value;
            
            element.addEventListener('input', function() {
                display.textContent = this.value;
            });
        }
    });
}

// Initialize animations
function initializeAnimations() {
    // Animate elements when they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll(
        '.feature-card, .pipeline-stage, .flow-step, .concept-card'
    );
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // Pipeline arrows animation
    animatePipelineArrows();
    
    // Hero section animation
    animateHeroElements();
}

// Animate pipeline arrows
function animatePipelineArrows() {
    const arrows = document.querySelectorAll('.pipeline-arrow i, .flow-arrow');
    
    arrows.forEach((arrow, index) => {
        setInterval(() => {
            arrow.style.transform = 'scale(1.2)';
            arrow.style.opacity = '0.7';
            
            setTimeout(() => {
                arrow.style.transform = 'scale(1)';
                arrow.style.opacity = '1';
            }, 300);
        }, 2000 + index * 200);
    });
}

// Animate hero elements
function animateHeroElements() {
    const heroNodes = document.querySelectorAll('.pipeline-node');
    
    heroNodes.forEach((node, index) => {
        setInterval(() => {
            node.style.transform = 'scale(1.1)';
            node.style.boxShadow = '0 5px 20px rgba(255, 107, 107, 0.4)';
            
            setTimeout(() => {
                node.style.transform = 'scale(1)';
                node.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
            }, 500);
        }, 3000 + index * 500);
    });
}

// Utility functions for demos
const DemoUtils = {
    // Generate random data for different types
    generateRandomData: function(type, numPoints, noiseLevel) {
        const data = [];
        
        for (let i = 0; i < numPoints; i++) {
            let x, y, label;
            
            switch (type) {
                case 'linear':
                    x = Math.random() * 10;
                    y = Math.random() * 10;
                    label = (x + y > 10) ? 1 : 0;
                    break;
                case 'circular':
                    const angle = Math.random() * 2 * Math.PI;
                    const radius = Math.random() * 5;
                    x = 5 + radius * Math.cos(angle);
                    y = 5 + radius * Math.sin(angle);
                    label = (radius > 2.5) ? 1 : 0;
                    break;
                case 'moons':
                    const t = Math.random() * Math.PI;
                    if (Math.random() > 0.5) {
                        x = Math.cos(t) * 3 + 5;
                        y = Math.sin(t) * 1.5 + 2.5;
                        label = 0;
                    } else {
                        x = 1 - Math.cos(t) * 3 + 5;
                        y = 1 - Math.sin(t) * 1.5 + 5;
                        label = 1;
                    }
                    break;
                case 'blobs':
                default:
                    if (Math.random() > 0.5) {
                        x = Math.random() * 4 + 1;
                        y = Math.random() * 4 + 1;
                        label = 0;
                    } else {
                        x = Math.random() * 4 + 6;
                        y = Math.random() * 4 + 6;
                        label = 1;
                    }
                    break;
            }
            
            // Add noise
            x += (Math.random() - 0.5) * noiseLevel * 2;
            y += (Math.random() - 0.5) * noiseLevel * 2;
            
            data.push({ x, y, label });
        }
        
        return data;
    },

    // Clear canvas and draw grid
    clearCanvas: function(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= canvas.width; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= canvas.height; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    },

    // Draw data points on canvas
    drawDataPoints: function(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas || !data) return;
        
        const ctx = canvas.getContext('2d');
        
        data.forEach(point => {
            ctx.beginPath();
            ctx.arc(
                (point.x / 10) * canvas.width,
                canvas.height - (point.y / 10) * canvas.height,
                4,
                0,
                2 * Math.PI
            );
            
            ctx.fillStyle = point.label === 0 ? '#ff6b6b' : '#4ecdc4';
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    }
};

// NLP specific functions
const NLPUtils = {
    tokenizeText: function() {
        const input = document.getElementById('nlp-input');
        const output = document.getElementById('nlp-tokens');
        
        if (!input || !output) return;
        
        const text = input.value.trim();
        if (!text) {
            output.innerHTML = '[]';
            return;
        }
        
        // Get preprocessing options
        const lowercase = document.getElementById('lowercase')?.checked;
        const removePunct = document.getElementById('remove-punct')?.checked;
        const removeStop = document.getElementById('remove-stop')?.checked;
        
        let processedText = text;
        
        // Apply preprocessing
        if (lowercase) {
            processedText = processedText.toLowerCase();
        }
        
        // Simple tokenization
        let tokens = processedText.match(/\w+|[^\w\s]/g) || [];
        
        if (removePunct) {
            tokens = tokens.filter(token => /\w/.test(token));
        }
        
        if (removeStop) {
            const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
            tokens = tokens.filter(token => !stopWords.includes(token.toLowerCase()));
        }
        
        const tokenList = tokens.map(token => `"${token}"`).join(', ');
        output.innerHTML = `[${tokenList}]`;
    }
};

// Method selection for preprocessing
function selectMethod(button, method) {
    // Update active button
    const parent = button.parentElement;
    parent.querySelectorAll('.method-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');
    
    // Update result display
    updateMethodResult(method);
}

function updateMethodResult(method) {
    const resultDiv = document.getElementById('missing-result');
    if (!resultDiv) return;
    
    let result = '';
    switch (method) {
        case 'mean':
            result = 'Age: ? → 35 (mean), Experience: ? → 8.3 (mean)';
            break;
        case 'median':
            result = 'Age: ? → 34 (median), Experience: ? → 8.0 (median)';
            break;
        case 'drop':
            result = 'Rows with missing values removed (3 rows dropped)';
            break;
        case 'forward':
            result = 'Age: ? → 35 (forward fill), Experience: ? → 8 (forward fill)';
            break;
        default:
            result = 'Select a method to see results';
    }
    resultDiv.textContent = result;
}

// Make functions globally available
window.DemoUtils = DemoUtils;
window.NLPUtils = NLPUtils;
window.selectMethod = selectMethod;
window.tokenizeText = NLPUtils.tokenizeText;

/* ==========================================================================
   UI enhancements: accessible menu toggle, active-link fallback,
   navbar scroll state and back-to-top control.
   ========================================================================== */
document.addEventListener('DOMContentLoaded', function () {
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    // --- accessible hamburger -------------------------------------------
    if (hamburger && navMenu) {
        const setExpanded = () =>
            hamburger.setAttribute('aria-expanded', navMenu.classList.contains('active') ? 'true' : 'false');

        hamburger.addEventListener('click', setExpanded);

        hamburger.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navMenu.classList.toggle('active');
                hamburger.classList.toggle('active');
                setExpanded();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                setExpanded();
                hamburger.focus();
            }
        });

        // the drawer is desktop-irrelevant; make sure it never sticks open
        window.addEventListener('resize', function () {
            if (window.innerWidth > 1260) {   // keep in step with the CSS drawer breakpoint
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                setExpanded();
            }
        });

        setExpanded();
    }

    // --- active link fallback (in case a page is copied without the flag) --
    if (navMenu) {
        const current = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
        if (!navMenu.querySelector('.nav-link.active')) {
            navMenu.querySelectorAll('.nav-link').forEach(link => {
                if (link.getAttribute('href') && link.getAttribute('href').toLowerCase() === current) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                }
            });
        }
    }

    // --- navbar shadow once scrolled ------------------------------------
    if (navbar) {
        const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 8);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // --- back to top ------------------------------------------------------
    const toTop = document.createElement('button');
    toTop.className = 'back-to-top';
    toTop.type = 'button';
    toTop.setAttribute('aria-label', 'Back to top');
    toTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    toTop.addEventListener('click', () =>
        window.scrollTo({ top: 0, behavior: 'smooth' }));
    document.body.appendChild(toTop);

    const toggleToTop = () => toTop.classList.toggle('visible', window.scrollY > 400);
    window.addEventListener('scroll', toggleToTop, { passive: true });
    toggleToTop();
});
