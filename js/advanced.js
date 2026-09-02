// Advanced Topics Page JavaScript

let currentTopic = 'gan';

document.addEventListener('DOMContentLoaded', function() {
    initializeAdvancedPage();
    setTimeout(() => {
        initializeInteractiveElements();
        initializeArchitectureTimeline();
    }, 1000);
});

function initializeAdvancedPage() {
    initializeTopicTabs();
    setTimeout(() => {
        showTopicAnimations(currentTopic);
    }, 500);
}

function initializeTopicTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const topic = this.textContent.toLowerCase().replace(/\s+/g, '');
            showTopic(topic);
        });
    });
}

function showTopic(topicId) {
    // Hide all topic contents
    document.querySelectorAll('.topic-content').forEach(content => {
        content.classList.remove('active');
    });

    // Show target topic
    const targetTopic = document.getElementById(`${topicId}-topic`);
    if (targetTopic) {
        targetTopic.classList.add('active');
        currentTopic = topicId;
    }

    // Update active tab
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Find and activate the correct tab
    document.querySelectorAll('.tab-button').forEach(btn => {
        const btnText = btn.textContent.toLowerCase().replace(/\s+/g, '');
        if (btnText.includes(topicId) || topicId.includes(btnText)) {
            btn.classList.add('active');
        }
    });

    // Show animations for the topic
    setTimeout(() => {
        showTopicAnimations(topicId);
    }, 200);
}

function showTopicAnimations(topicId) {
    switch (topicId) {
        case 'gan':
        case 'gans':
            animateGANTraining();
            break;
        case 'federated':
        case 'federatedlearning':
            animateFederatedLearning();
            break;
        case 'split':
        case 'splitlearning':
            animateSplitLearning();
            break;
        case 'cv':
        case 'computervision':
            animateCVPipeline();
            break;
        case 'transfer':
        case 'transferlearning':
            animateTransferLearning();
            break;
    }
}

// GAN Training Animation
function animateGANTraining() {
    const generator = document.querySelector('.player.generator');
    const discriminator = document.querySelector('.player.discriminator');
    if (!generator || !discriminator) return;

    let phase = 0;

    function ganAnim() {
        if (currentTopic !== 'gan' && currentTopic !== 'gans') return;
        if (phase === 0) {
            generator.style.background = 'linear-gradient(135deg, #28a745, rgba(40, 167, 69, 0.8))';
            generator.style.boxShadow = '0 0 20px rgba(40, 167, 69, 0.5)';
            discriminator.style.background = '#f8f9fa';
            discriminator.style.boxShadow = 'none';
            setTimeout(() => { phase = 1; ganAnim(); }, 2000);
        } else {
            discriminator.style.background = 'linear-gradient(135deg, #dc3545, rgba(220, 53, 69, 0.8))';
            discriminator.style.boxShadow = '0 0 20px rgba(220, 53, 69, 0.5)';
            generator.style.background = '#f8f9fa';
            generator.style.boxShadow = 'none';
            setTimeout(() => { phase = 0; ganAnim(); }, 2000);
        }
    }
    ganAnim();
}

// Federated Learning Animation
function animateFederatedLearning() {
    const centralServer = document.querySelector('.central-server');
    const clientDevices = document.querySelectorAll('.client-device');
    if (!centralServer || !clientDevices.length) return;

    let step = 0;
    const steps = ['distribute', 'train', 'aggregate'];

    function federatedAnim() {
        if (currentTopic !== 'federated' && currentTopic !== 'federatedlearning') return;
        const currentStep = steps[step % steps.length];

        // Reset all styles
        centralServer.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        centralServer.style.boxShadow = 'none';
        clientDevices.forEach(device => {
            device.style.background = '#f8f9fa';
            device.style.borderColor = '#e9ecef';
            device.style.boxShadow = 'none';
        });

        switch (currentStep) {
            case 'distribute':
                centralServer.style.boxShadow = '0 0 25px rgba(102, 126, 234, 0.6)';
                clientDevices.forEach((device, idx) => {
                    setTimeout(() => {
                        device.style.background = 'white';
                        device.style.borderColor = '#667eea';
                        device.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.3)';
                    }, idx * 200);
                });
                break;
            case 'train':
                centralServer.style.background = 'linear-gradient(135deg, #6c757d, #495057)';
                clientDevices.forEach((device, idx) => {
                    setTimeout(() => {
                        device.style.background = 'linear-gradient(135deg, #28a745, rgba(40, 167, 69, 0.8))';
                        device.style.borderColor = '#28a745';
                        device.style.boxShadow = '0 5px 15px rgba(40, 167, 69, 0.4)';
                    }, idx * 150);
                });
                break;
            case 'aggregate':
                clientDevices.forEach((device, idx) => {
                    setTimeout(() => {
                        device.style.background = '#f8f9fa';
                        device.style.borderColor = '#e9ecef';
                        device.style.boxShadow = 'none';
                    }, idx * 100);
                });
                setTimeout(() => {
                    centralServer.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
                    centralServer.style.boxShadow = '0 0 30px rgba(40, 167, 69, 0.6)';
                }, 500);
                break;
        }
        step++;
        setTimeout(federatedAnim, 4000);
    }
    federatedAnim();
}

// Split Learning Animation
function animateSplitLearning() {
    const clientSide = document.querySelector('.client-side');
    const serverSide = document.querySelector('.server-side');
    const arrow = document.querySelector('.communication-arrow .arrow');
    if (!clientSide || !serverSide || !arrow) return;

    let phase = 0;
    const phases = ['forward_client', 'forward_server', 'backward_server', 'backward_client'];

    function splitAnim() {
        if (currentTopic !== 'split' && currentTopic !== 'splitlearning') return;
        clientSide.style.background = '#f8f9fa';
        clientSide.style.borderColor = '#e9ecef';
        serverSide.style.background = '#f8f9fa';
        serverSide.style.borderColor = '#e9ecef';
        arrow.style.color = '#667eea';
        arrow.style.transform = 'scale(1)';

        const currentPhase = phases[phase % phases.length];

        switch (currentPhase) {
            case 'forward_client':
                clientSide.style.background = '#e8f5e8';
                clientSide.style.borderColor = '#28a745';
                arrow.style.color = '#28a745';
                arrow.style.transform = 'scale(1.2)';
                break;
            case 'forward_server':
                serverSide.style.background = '#e3f2fd';
                serverSide.style.borderColor = '#2196f3';
                arrow.style.color = '#2196f3';
                break;
            case 'backward_server':
                serverSide.style.background = '#fff3e0';
                serverSide.style.borderColor = '#ff9800';
                arrow.style.color = '#ff9800';
                arrow.style.transform = 'scale(1.2) rotate(180deg)';
                break;
            case 'backward_client':
                clientSide.style.background = '#fce4ec';
                clientSide.style.borderColor = '#e91e63';
                arrow.style.color = '#e91e63';
                arrow.style.transform = 'scale(1) rotate(180deg)';
                break;
        }
        phase++;
        setTimeout(splitAnim, 2500);
    }
    splitAnim();
}

// Computer Vision Pipeline Animation
function animateCVPipeline() {
    const transforms = document.querySelectorAll('.image-placeholder');
    const featureMaps = document.querySelectorAll('.feature-map');

    // Animate image transformations
    transforms.forEach((transform, index) => {
        setInterval(() => {
            if (currentTopic !== 'cv' && currentTopic !== 'computervision') return;
            transform.style.transform = 'scale(1.1)';
            transform.style.background = `hsl(${200 + index * 20}, 70%, 70%)`;
            setTimeout(() => {
                transform.style.transform = 'scale(1)';
                transform.style.background = '';
            }, 800);
        }, 3000 + index * 400);
    });

    // Animate feature maps
    featureMaps.forEach((map, index) => {
        setInterval(() => {
            if (currentTopic !== 'cv' && currentTopic !== 'computervision') return;
            const hue = (Date.now() / 50 + index * 60) % 360;
            map.style.background = `hsl(${hue}, 70%, 60%)`;
            map.style.transform = 'scale(1.05)';
            setTimeout(() => {
                map.style.transform = 'scale(1)';
            }, 300);
        }, 2000 + index * 100);
    });
}

// Transfer Learning Animation
function animateTransferLearning() {
    const sourceTask = document.querySelector('.source-task');
    const targetTask = document.querySelector('.target-task');
    const transferArrow = document.querySelector('.transfer-arrow .arrow-icon');
    if (!sourceTask || !targetTask || !transferArrow) return;

    let phase = 0;
    const phases = ['source', 'transfer', 'target'];

    function transferAnim() {
        if (currentTopic !== 'transfer' && currentTopic !== 'transferlearning') return;
        sourceTask.style.background = '#f8f9fa';
        sourceTask.style.borderColor = '#e9ecef';
        targetTask.style.background = '#f8f9fa';
        targetTask.style.borderColor = '#e9ecef';
        transferArrow.style.transform = 'scale(1)';
        transferArrow.style.color = '#667eea';

        const currentPhase = phases[phase % phases.length];

        switch (currentPhase) {
            case 'source':
                sourceTask.style.background = '#e8f5e8';
                sourceTask.style.borderColor = '#28a745';
                break;
            case 'transfer':
                transferArrow.style.transform = 'scale(1.3) rotate(360deg)';
                transferArrow.style.color = '#ff6b6b';
                break;
            case 'target':
                targetTask.style.background = '#e3f2fd';
                targetTask.style.borderColor = '#2196f3';
                break;
        }
        phase++;
        setTimeout(transferAnim, 2000);
    }
    transferAnim();
}

// --- INTERACTIVE ELEMENTS ---
function initializeInteractiveElements() {
    const appCards = document.querySelectorAll('.app-card');
    appCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.app-icon');
            if (icon) {
                icon.style.transform = 'scale(1.2) rotate(10deg)';
                icon.style.transition = 'all 0.3s ease';
            }
        });
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.app-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });

    const strategyCards = document.querySelectorAll('.strategy-card');
    strategyCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.borderColor = '#667eea';
            this.style.background = '#f0f4ff';
        });
        card.addEventListener('mouseleave', function() {
            this.style.borderColor = '#e9ecef';
            this.style.background = 'white';
        });
    });
}

// --- ARCHITECTURE TIMELINE ---
function initializeArchitectureTimeline() {
    const archItems = document.querySelectorAll('.arch-item');
    archItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            archItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            showArchitectureInfo(index);
        });
    });
}

function showArchitectureInfo(index) {
    const architectures = [
        {
            name: 'AlexNet',
            details: 'First deep CNN to achieve breakthrough performance on ImageNet. Used ReLU activations and dropout for regularization.'
        },
        {
            name: 'VGGNet',
            details: 'Demonstrated that increasing depth with small 3x3 filters significantly improves performance.'
        },
        {
            name: 'ResNet',
            details: 'Introduced residual connections allowing training of very deep networks (152+ layers) without vanishing gradients.'
        },
        {
            name: 'EfficientNet',
            details: 'Systematically scaled network dimensions (depth, width, resolution) for optimal efficiency.'
        }
    ];

    const info = architectures[index];
    let popup = document.getElementById('arch-info-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'arch-info-popup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            z-index: 1000;
            max-width: 400px;
            border: 3px solid #667eea;
        `;
        document.body.appendChild(popup);
    }

    popup.innerHTML = `
        <h4>${info.name}</h4>
        <p>${info.details}</p>
        <button onclick="this.parentElement.remove()" style="
            background: #667eea;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 1rem;
        ">Close</button>
    `;

    setTimeout(() => {
        if (popup.parentElement) {
            popup.remove();
        }
    }, 8000);
}

// Export for global access
window.showTopic = showTopic;
window.AdvancedPage = {
    showTopic,
    animateGANTraining,
    animateFederatedLearning,
    animateSplitLearning,
    animateCVPipeline,
    animateTransferLearning
};
