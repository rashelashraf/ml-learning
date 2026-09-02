// Improved Visualizations for ML/DL Teaching Tool

// Utility functions for safer operations
const safeGetElement = (selector) => {
    try {
        return document.querySelector(selector);
    } catch (e) {
        console.warn(`Element not found: ${selector}`);
        return null;
    }
};

const safeGetElements = (selector) => {
    try {
        return document.querySelectorAll(selector);
    } catch (e) {
        console.warn(`Elements not found: ${selector}`);
        return [];
    }
};

// Enhanced Animation utilities
class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.isPageVisible = true;
        this.setupVisibilityListener();
    }

    setupVisibilityListener() {
        document.addEventListener('visibilitychange', () => {
            this.isPageVisible = !document.hidden;
            if (!this.isPageVisible) {
                this.pauseAll();
            }
        });
    }

    start(id, callback, duration = 1000) {
        if (!this.isPageVisible) return;
        
        if (this.animations.has(id)) {
            cancelAnimationFrame(this.animations.get(id).rafId);
        }

        const startTime = performance.now();
        const animation = { rafId: null, paused: false };

        const animate = (currentTime) => {
            if (animation.paused || !this.isPageVisible) return;
            
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            try {
                callback(progress);
            } catch (e) {
                console.error(`Animation error for ${id}:`, e);
                this.stop(id);
                return;
            }

            if (progress < 1) {
                animation.rafId = requestAnimationFrame(animate);
                this.animations.set(id, animation);
            } else {
                this.animations.delete(id);
            }
        };

        animation.rafId = requestAnimationFrame(animate);
        this.animations.set(id, animation);
    }

    stop(id) {
        const animation = this.animations.get(id);
        if (animation) {
            cancelAnimationFrame(animation.rafId);
            this.animations.delete(id);
        }
    }

    pauseAll() {
        this.animations.forEach(animation => {
            animation.paused = true;
        });
    }

    stopAll() {
        this.animations.forEach(animation => {
            cancelAnimationFrame(animation.rafId);
        });
        this.animations.clear();
    }
}

const animationManager = new AnimationManager();

// Enhanced Pipeline flow animations with error handling
function animatePipelineFlow() {
    const arrows = safeGetElements('.pipeline-arrow i');
    if (arrows.length === 0) return;

    arrows.forEach((arrow, index) => {
        animationManager.start(`arrow-${index}`, (progress) => {
            const scale = 1 + 0.2 * Math.sin(progress * Math.PI * 4);
            const opacity = 0.5 + 0.5 * Math.sin(progress * Math.PI * 2);
            arrow.style.transform = `scale(${scale})`;
            arrow.style.opacity = opacity;
        }, 2000);
    });
}

// Enhanced Attention mechanism visualization
function animateAttentionWeights() {
    const weights = safeGetElements('.weight');
    if (weights.length === 0) return;

    weights.forEach((weight, index) => {
        animationManager.start(`weight-${index}`, (progress) => {
            const intensity = 0.5 + 0.5 * Math.sin(progress * Math.PI * 2 + index * 0.5);
            weight.style.opacity = intensity;
        }, 3000);
    });
}

// Enhanced Neural network neuron pulsing
function animateNeurons() {
    const neurons = safeGetElements('.neuron');
    if (neurons.length === 0) return;

    neurons.forEach((neuron, index) => {
        animationManager.start(`neuron-${index}`, (progress) => {
            const scale = 1 + 0.1 * Math.sin(progress * Math.PI * 3 + index * 0.3);
            const brightness = 1 + 0.2 * Math.sin(progress * Math.PI * 2 + index * 0.2);
            neuron.style.transform = `scale(${scale})`;
            neuron.style.filter = `brightness(${brightness})`;
        }, 4000);
    });
}

// Enhanced GAN training visualization
function animateGANTraining() {
    const generator = safeGetElement('.player.generator');
    const discriminator = safeGetElement('.player.discriminator');
    if (!generator || !discriminator) return;

    let phase = 0;
    let animationCount = 0;
    const maxAnimations = 10; // Prevent infinite animation

    const animate = () => {
        if (animationCount >= maxAnimations) return;
        animationCount++;

        animationManager.start('gan-training', (progress) => {
            try {
                if (phase === 0) {
                    generator.style.background = `linear-gradient(135deg, #28a745, rgba(40, 167, 69, ${0.5 + 0.5 * progress}))`;
                    discriminator.style.background = '#f8f9fa';
                    if (progress === 1) {
                        phase = 1;
                        setTimeout(animate, 500);
                    }
                } else {
                    discriminator.style.background = `linear-gradient(135deg, #dc3545, rgba(220, 53, 69, ${0.5 + 0.5 * progress}))`;
                    generator.style.background = '#f8f9fa';
                    if (progress === 1) {
                        phase = 0;
                        setTimeout(animate, 500);
                    }
                }
            } catch (e) {
                console.error('GAN animation error:', e);
            }
        }, 1500);
    };
    animate();
}

// Enhanced Federated learning data flow
function animateFederatedLearning() {
    const centralServer = safeGetElement('.central-server');
    const clientDevices = safeGetElements('.client-device');
    if (!centralServer || clientDevices.length === 0) return;

    let step = 0;
    let animationCount = 0;
    const maxAnimations = 15;
    const steps = ['distribute', 'train', 'aggregate'];

    const animate = () => {
        if (animationCount >= maxAnimations) return;
        animationCount++;

        const currentStep = steps[step % steps.length];
        
        try {
            switch (currentStep) {
                case 'distribute':
                    centralServer.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                    centralServer.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.5)';
                    clientDevices.forEach((device, idx) => {
                        setTimeout(() => {
                            if (device) {
                                device.style.background = 'white';
                                device.style.borderColor = '#667eea';
                                device.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.3)';
                            }
                        }, idx * 200);
                    });
                    break;
                case 'train':
                    centralServer.style.background = 'linear-gradient(135deg, #6c757d, #495057)';
                    centralServer.style.boxShadow = 'none';
                    clientDevices.forEach((device, idx) => {
                        animationManager.start(`client-train-${idx}`, (progress) => {
                            const intensity = 0.7 + 0.3 * Math.sin(progress * Math.PI * 4);
                            device.style.background = `rgba(40, 167, 69, ${intensity})`;
                        }, 2000);
                    });
                    break;
                case 'aggregate':
                    clientDevices.forEach((device, idx) => {
                        setTimeout(() => {
                            if (device) {
                                device.style.background = '#f8f9fa';
                                device.style.borderColor = '#e9ecef';
                                device.style.boxShadow = 'none';
                            }
                        }, idx * 100);
                    });
                    setTimeout(() => {
                        centralServer.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
                        centralServer.style.boxShadow = '0 0 30px rgba(40, 167, 69, 0.6)';
                    }, 500);
                    break;
            }
        } catch (e) {
            console.error('Federated learning animation error:', e);
        }

        step++;
        setTimeout(animate, 3000);
    };
    animate();
}

// Enhanced Split learning data flow
function animateSplitLearning() {
    const clientSide = safeGetElement('.client-side');
    const serverSide = safeGetElement('.server-side');
    const arrow = safeGetElement('.communication-arrow .arrow');
    if (!clientSide || !serverSide || !arrow) return;

    animationManager.start('split-learning', (progress) => {
        try {
            const phase = Math.floor(progress * 4) % 4;
            
            // Reset styles first
            [clientSide, serverSide].forEach(el => {
                el.style.background = '#f8f9fa';
                el.style.borderColor = '#e9ecef';
            });

            switch (phase) {
                case 0:
                    clientSide.style.background = '#e8f5e8';
                    clientSide.style.borderColor = '#28a745';
                    arrow.style.color = '#28a745';
                    arrow.style.transform = 'scale(1.2)';
                    break;
                case 1:
                    serverSide.style.background = '#e3f2fd';
                    serverSide.style.borderColor = '#2196f3';
                    arrow.style.color = '#2196f3';
                    break;
                case 2:
                    serverSide.style.background = '#fff3e0';
                    serverSide.style.borderColor = '#ff9800';
                    arrow.style.color = '#ff9800';
                    arrow.style.transform = 'scale(1.2) rotate(180deg)';
                    break;
                case 3:
                    clientSide.style.background = '#fce4ec';
                    clientSide.style.borderColor = '#e91e63';
                    arrow.style.color = '#e91e63';
                    arrow.style.transform = 'scale(1) rotate(180deg)';
                    break;
            }
        } catch (e) {
            console.error('Split learning animation error:', e);
        }
    }, 8000);
}

// Enhanced Computer vision pipeline animation
function animateCVPipeline() {
    const transforms = safeGetElements('.image-placeholder');
    if (transforms.length === 0) return;

    transforms.forEach((transform, index) => {
        animationManager.start(`cv-transform-${index}`, (progress) => {
            try {
                const delay = index * 0.2;
                const adjustedProgress = Math.max(0, (progress - delay) / (1 - delay));
                if (adjustedProgress > 0) {
                    transform.style.transform = `scale(${1 + 0.1 * Math.sin(adjustedProgress * Math.PI * 2)})`;
                    transform.style.background = `hsl(${200 + index * 20}, 70%, ${70 + 20 * adjustedProgress}%)`;
                }
            } catch (e) {
                console.error('CV pipeline animation error:', e);
            }
        }, 4000);
    });
}

// Enhanced Feature map animation for CNN
function animateFeatureMaps() {
    const featureMaps = safeGetElements('.feature-map');
    if (featureMaps.length === 0) return;

    featureMaps.forEach((map, index) => {
        animationManager.start(`feature-map-${index}`, (progress) => {
            try {
                const hue = (progress * 360 + index * 60) % 360;
                map.style.background = `hsl(${hue}, 70%, 60%)`;
                map.style.transform = `scale(${1 + 0.05 * Math.sin(progress * Math.PI * 6)})`;
            } catch (e) {
                console.error('Feature map animation error:', e);
            }
        }, 3000);
    });
}

// Enhanced Transfer learning knowledge flow
function animateTransferLearning() {
    const sourceTask = safeGetElement('.source-task');
    const targetTask = safeGetElement('.target-task');
    const transferArrow = safeGetElement('.transfer-arrow .arrow-icon');
    if (!sourceTask || !targetTask || !transferArrow) return;

    animationManager.start('transfer-learning', (progress) => {
        try {
            // Reset styles
            [sourceTask, targetTask].forEach(el => {
                el.style.background = '#f8f9fa';
                el.style.borderColor = '#e9ecef';
            });

            if (progress < 0.3) {
                sourceTask.style.background = '#e8f5e8';
                sourceTask.style.borderColor = '#28a745';
                transferArrow.style.transform = 'scale(1)';
                transferArrow.style.color = '#28a745';
            } else if (progress < 0.7) {
                const arrowProgress = (progress - 0.3) / 0.4;
                transferArrow.style.transform = `scale(${1 + arrowProgress}) rotate(${arrowProgress * 360}deg)`;
                transferArrow.style.color = `hsl(${120 + arrowProgress * 240}, 70%, 50%)`;
            } else {
                transferArrow.style.transform = 'scale(1)';
                transferArrow.style.color = '#667eea';
                targetTask.style.background = '#e3f2fd';
                targetTask.style.borderColor = '#2196f3';
            }
        } catch (e) {
            console.error('Transfer learning animation error:', e);
        }
    }, 4000);
}

// Enhanced Data preprocessing visualization
function animateDataPreprocessing() {
    const originalData = safeGetElement('.scale-before');
    const processedData = safeGetElement('.scale-after');
    if (!originalData || !processedData) return;

    animationManager.start('data-preprocessing', (progress) => {
        try {
            if (progress < 0.5) {
                originalData.style.background = '#fff3cd';
                originalData.style.borderLeft = '4px solid #ffc107';
                processedData.style.background = '#f8f9fa';
                processedData.style.borderLeft = 'none';
            } else {
                originalData.style.background = '#f8f9fa';
                originalData.style.borderLeft = 'none';
                processedData.style.background = '#d1ecf1';
                processedData.style.borderLeft = '4px solid #17a2b8';
            }
        } catch (e) {
            console.error('Data preprocessing animation error:', e);
        }
    }, 3000);
}

// Enhanced Training progress animation
function animateTrainingProgress() {
    const dataBars = safeGetElements('.data-bar');
    if (dataBars.length === 0) return;

    dataBars.forEach((bar, index) => {
        animationManager.start(`data-bar-${index}`, (progress) => {
            try {
                const targetWidth = parseFloat(bar.dataset.target || bar.style.width || '100');
                const cleanWidth = isNaN(targetWidth) ? 100 : targetWidth;
                bar.style.width = `${cleanWidth * progress}%`;
            } catch (e) {
                console.error('Training progress animation error:', e);
            }
        }, 2000 + index * 500);
    });
}

// Enhanced Model architecture highlighting
function animateModelArchitecture() {
    const components = safeGetElements('.component');
    if (components.length === 0) return;

    components.forEach((component, index) => {
        animationManager.start(`component-${index}`, (progress) => {
            try {
                const intensity = 0.8 + 0.2 * Math.sin(progress * Math.PI * 2 + index * Math.PI / 2);
                component.style.opacity = intensity;
                component.style.transform = `scale(${1 + 0.05 * Math.sin(progress * Math.PI * 2 + index * Math.PI / 4)})`;
            } catch (e) {
                console.error('Model architecture animation error:', e);
            }
        }, 3000);
    });
}

// Enhanced Confusion matrix animation
function animateConfusionMatrix() {
    const cells = safeGetElements('.confusion-matrix td');
    if (cells.length === 0) return;

    cells.forEach((cell, index) => {
        if (cell.textContent && !isNaN(cell.textContent)) {
            animationManager.start(`confusion-cell-${index}`, (progress) => {
                try {
                    const targetValue = parseInt(cell.dataset.target || cell.textContent);
                    const currentValue = Math.floor(targetValue * progress);
                    cell.textContent = currentValue;
                    const intensity = Math.min(1, currentValue / 100);
                    
                    if (cell.classList.contains('tp') || cell.classList.contains('tn')) {
                        cell.style.background = `rgba(40, 167, 69, ${intensity * 0.3})`;
                    } else {
                        cell.style.background = `rgba(220, 53, 69, ${intensity * 0.3})`;
                    }
                } catch (e) {
                    console.error('Confusion matrix animation error:', e);
                }
            }, 1500);
        }
    });
}

// Enhanced Clustering animation with proper canvas handling
function animateClusterFormation(canvas, data, centroids) {
    if (!canvas || !data || !centroids) return;
    
    let ctx;
    try {
        ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Could not get canvas context');
            return;
        }
    } catch (e) {
        console.error('Canvas error:', e);
        return;
    }

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    
    animationManager.start('cluster-formation', (progress) => {
        try {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw data points
            data.forEach((point, idx) => {
                const x = (point.x / 10) * canvas.width;
                const y = canvas.height - (point.y / 10) * canvas.height;
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                
                if (point.cluster >= 0) {
                    const alpha = Math.floor((0.3 + 0.7 * progress) * 255).toString(16).padStart(2, '0');
                    ctx.fillStyle = colors[point.cluster % colors.length] + alpha;
                } else {
                    ctx.fillStyle = '#95a5a6';
                }
                ctx.fill();
            });
            
            // Draw centroids
            centroids.forEach((centroid, idx) => {
                const x = (centroid.x / 10) * canvas.width;
                const y = canvas.height - (centroid.y / 10) * canvas.height;
                const size = 6 + 4 * Math.sin(progress * Math.PI * 4 + idx);
                
                ctx.beginPath();
                ctx.arc(x, y, size, 0, 2 * Math.PI);
                ctx.fillStyle = '#2c2c54';
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
            });
        } catch (e) {
            console.error('Cluster formation animation error:', e);
        }
    }, 3000);
}

// Enhanced Particle system with proper cleanup
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = null;
        this.particles = [];
        this.isRunning = false;
        this.rafId = null;
        
        try {
            this.ctx = canvas.getContext('2d');
            if (!this.ctx) {
                throw new Error('Could not get canvas context');
            }
        } catch (e) {
            console.error('Particle system initialization error:', e);
            return;
        }

        this.resize();
        this.resizeHandler = () => this.resize();
        window.addEventListener('resize', this.resizeHandler);
    }

    resize() {
        if (!this.canvas) return;
        
        try {
            const rect = this.canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';
            
            if (this.ctx) {
                this.ctx.scale(dpr, dpr);
            }
        } catch (e) {
            console.error('Particle system resize error:', e);
        }
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 3 + 1,
            opacity: Math.random() * 0.5 + 0.2,
            color: `hsl(${Math.random() * 60 + 200}, 70%, 70%)`
        };
    }

    start(particleCount = 50) {
        if (!this.ctx) return;
        
        this.particles = [];
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(this.createParticle());
        }
        this.isRunning = true;
        this.animate();
    }

    stop() {
        this.isRunning = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    destroy() {
        this.stop();
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }

    animate() {
        if (!this.isRunning || !this.ctx) return;
        
        try {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.particles.forEach(particle => {
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Wrap around edges
                if (particle.x > this.canvas.width) particle.x = 0;
                if (particle.x < 0) particle.x = this.canvas.width;
                if (particle.y > this.canvas.height) particle.y = 0;
                if (particle.y < 0) particle.y = this.canvas.height;
                
                // Draw particle
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
                this.ctx.fillStyle = particle.color;
                this.ctx.globalAlpha = particle.opacity;
                this.ctx.fill();
            });
            
            this.ctx.globalAlpha = 1;
        } catch (e) {
            console.error('Particle animation error:', e);
            this.stop();
            return;
        }
        
        this.rafId = requestAnimationFrame(() => this.animate());
    }
}

// Enhanced Section observer with better error handling
function initializeSectionAnimations() {
    if (!window.IntersectionObserver) {
        console.warn('IntersectionObserver not supported, skipping section animations');
        return;
    }

    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                
                setTimeout(() => {
                    try {
                        switch (sectionId) {
                            case 'nlp':
                                animatePipelineFlow();
                                animateAttentionWeights();
                                break;
                            case 'tabular':
                                animateDataPreprocessing();
                                animateTrainingProgress();
                                break;
                            case 'training':
                                animateModelArchitecture();
                                animateNeurons();
                                break;
                            case 'advanced':
                                // Safely check for current topic
                                const currentTopic = window.MLApp?.AppState?.currentTopic || '';
                                switch (currentTopic) {
                                    case 'gan':
                                        animateGANTraining();
                                        break;
                                    case 'federated':
                                        animateFederatedLearning();
                                        break;
                                    case 'split':
                                        animateSplitLearning();
                                        break;
                                    case 'cv':
                                        animateCVPipeline();
                                        animateFeatureMaps();
                                        break;
                                    case 'transfer':
                                        animateTransferLearning();
                                        break;
                                }
                                break;
                        }
                    } catch (e) {
                        console.error(`Animation error for section ${sectionId}:`, e);
                    }
                }, 500);
            }
        });
    }, observerOptions);

    // Observe all sections
    const sections = safeGetElements('.section');
    sections.forEach(section => {
        observer.observe(section);
    });

    // Store observer for cleanup
    window.sectionObserver = observer;
}

// Enhanced particle system initialization with cleanup
let globalParticleSystem = null;

function initializeParticleSystem() {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        opacity: 0.3;
    `;
    
    document.body.appendChild(canvas);
    globalParticleSystem = new ParticleSystem(canvas);

    // Start particles when home section is visible
    const homeSection = safeGetElement('#home');
    if (homeSection && window.IntersectionObserver) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    globalParticleSystem?.start();
                } else {
                    globalParticleSystem?.stop();
                }
            });
        });
        observer.observe(homeSection);
        
        // Store observer for cleanup
        window.particleObserver = observer;
    }
}

// Enhanced initialization with proper cleanup
function initializeVisualizations() {
    try {
        initializeSectionAnimations();
        initializeParticleSystem();
        
        // Add enhanced hover effects with error handling
        const interactiveElements = safeGetElements('.feature-card, .model-card, .task-card');
        interactiveElements.forEach(card => {
            const handleMouseEnter = function() {
                try {
                    this.style.transform = 'translateY(-5px) scale(1.02)';
                    this.style.transition = 'all 0.3s ease';
                } catch (e) {
                    console.error('Hover effect error:', e);
                }
            };
            
            const handleMouseLeave = function() {
                try {
                    this.style.transform = 'translateY(0) scale(1)';
                } catch (e) {
                    console.error('Hover effect error:', e);
                }
            };
            
            card.addEventListener('mouseenter', handleMouseEnter);
            card.addEventListener('mouseleave', handleMouseLeave);
            
            // Store handlers for cleanup
            card._hoverHandlers = { handleMouseEnter, handleMouseLeave };
        });
    } catch (e) {
        console.error('Visualization initialization error:', e);
    }
}

// Cleanup function for proper resource management
function cleanupVisualizations() {
    try {
        // Stop all animations
        animationManager.stopAll();
        
        // Cleanup particle system
        if (globalParticleSystem) {
            globalParticleSystem.destroy();
            globalParticleSystem = null;
        }
        
        // Cleanup observers
        if (window.sectionObserver) {
            window.sectionObserver.disconnect();
            window.sectionObserver = null;
        }
        
        if (window.particleObserver) {
            window.particleObserver.disconnect();
            window.particleObserver = null;
        }
        
        // Remove hover event listeners
        const interactiveElements = safeGetElements('.feature-card, .model-card, .task-card');
        interactiveElements.forEach(card => {
            if (card._hoverHandlers) {
                card.removeEventListener('mouseenter', card._hoverHandlers.handleMouseEnter);
                card.removeEventListener('mouseleave', card._hoverHandlers.handleMouseLeave);
                delete card._hoverHandlers;
            }
        });
    } catch (e) {
        console.error('Cleanup error:', e);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeVisualizations);

// Cleanup when page is unloaded
window.addEventListener('beforeunload', cleanupVisualizations);

// Export for use in other files
window.Visualizations = {
    animationManager,
    animatePipelineFlow,
    animateAttentionWeights,
    animateNeurons,
    animateGANTraining,
    animateFederatedLearning,
    animateSplitLearning,
    animateCVPipeline,
    animateFeatureMaps,
    animateTransferLearning,
    animateDataPreprocessing,
    animateTrainingProgress,
    animateModelArchitecture,
    animateConfusionMatrix,
    animateClusterFormation,
    ParticleSystem,
    cleanup: cleanupVisualizations
};