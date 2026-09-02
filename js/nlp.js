// NLP Page Specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeNLPPage();
});

function initializeNLPPage() {
    // Initialize NLP-specific animations
    animateAttentionWeights();
    animatePipelineFlow();
    
    // Set up NLP input handler
    const nlpInput = document.getElementById('nlp-input');
    if (nlpInput) {
        nlpInput.addEventListener('input', function() {
            window.NLPUtils.tokenizeText();
        });
    }
    
    // Initialize preprocessing checkboxes
    const checkboxes = document.querySelectorAll('.preprocessing-options input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            window.NLPUtils.tokenizeText();
        });
    });
    
    // Animate transformer components
    animateTransformerComponents();
}

function animateAttentionWeights() {
    const weights = document.querySelectorAll('.weight');
    
    weights.forEach((weight, index) => {
        setInterval(() => {
            const currentOpacity = weight.style.opacity || 1;
            const targetOpacity = weight.classList.contains('high') ? 0.7 : 
                                 weight.classList.contains('med') ? 0.8 : 0.9;
            
            weight.style.opacity = targetOpacity;
            
            setTimeout(() => {
                weight.style.opacity = 1;
            }, 500);
        }, 3000 + index * 100);
    });
}

function animatePipelineFlow() {
    const arrows = document.querySelectorAll('.pipeline-arrow i');
    
    arrows.forEach((arrow, index) => {
        setInterval(() => {
            arrow.style.transform = 'scale(1.3)';
            arrow.style.color = '#ff6b6b';
            
            setTimeout(() => {
                arrow.style.transform = 'scale(1)';
                arrow.style.color = '#667eea';
            }, 400);
        }, 4000 + index * 500);
    });
}

function animateTransformerComponents() {
    const components = document.querySelectorAll('.component');
    
    components.forEach((component, index) => {
        setInterval(() => {
            component.style.borderColor = '#667eea';
            component.style.backgroundColor = '#f0f4ff';
            
            setTimeout(() => {
                component.style.borderColor = '#dee2e6';
                component.style.backgroundColor = 'white';
            }, 800);
        }, 5000 + index * 300);
    });
}

// Enhanced tokenization with preprocessing options
window.NLPUtils = window.NLPUtils || {};
window.NLPUtils.tokenizeText = function() {
    const input = document.getElementById('nlp-input');
    const output = document.getElementById('nlp-tokens');
    
    if (!input || !output) return;
    
    const text = input.value.trim();
    if (!text) {
        output.innerHTML = '[]';
        return;
    }
    
    // Get preprocessing options
    const lowercase = document.getElementById('lowercase')?.checked ?? true;
    const removePunct = document.getElementById('remove-punct')?.checked ?? false;
    const removeStop = document.getElementById('remove-stop')?.checked ?? false;
    
    let processedText = text;
    
    // Apply preprocessing
    if (lowercase) {
        processedText = processedText.toLowerCase();
    }
    
    // Advanced tokenization
    let tokens = [];
    
    // Handle contractions and special cases
    processedText = processedText.replace(/n't/g, " not");
    processedText = processedText.replace(/'re/g, " are");
    processedText = processedText.replace(/'ve/g, " have");
    processedText = processedText.replace(/'ll/g, " will");
    
    // Tokenize
    tokens = processedText.match(/\w+|[^\w\s]/g) || [];
    
    if (removePunct) {
        tokens = tokens.filter(token => /\w/.test(token));
    }
    
    if (removeStop) {
        const stopWords = [
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 
            'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 
            'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 
            'will', 'would', 'could', 'should', 'may', 'might', 'must'
        ];
        tokens = tokens.filter(token => !stopWords.includes(token.toLowerCase()));
    }
    
    // Create colored output
    const tokenList = tokens.map((token, index) => {
        const colorClass = index % 3 === 0 ? 'token-primary' : 
                          index % 3 === 1 ? 'token-secondary' : 'token-tertiary';
        return `<span class="${colorClass}">"${token}"</span>`;
    }).join(', ');
    
    output.innerHTML = `[${tokenList}]`;
    
    // Add CSS for token colors if not already present
    if (!document.getElementById('token-styles')) {
        const style = document.createElement('style');
        style.id = 'token-styles';
        style.textContent = `
            .token-primary { color: #667eea; font-weight: bold; }
            .token-secondary { color: #ff6b6b; font-weight: bold; }
            .token-tertiary { color: #4ecdc4; font-weight: bold; }
        `;
        document.head.appendChild(style);
    }
};

// Task card interactions
function initializeTaskCards() {
    const taskCards = document.querySelectorAll('.task-card');
    
    taskCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.task-icon');
            if (icon) {
                icon.style.transform = 'scale(1.2) rotate(5deg)';
                icon.style.transition = 'all 0.3s ease';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.task-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
}

// Word embedding similarity demo
function demonstrateWordSimilarity() {
    const embeddings = document.querySelectorAll('.word-embedding');
    
    embeddings.forEach(embedding => {
        embedding.addEventListener('click', function() {
            const word = this.querySelector('.word').textContent.replace(/"/g, '');
            showSimilarWords(word);
        });
    });
}

function showSimilarWords(word) {
    const similarWords = {
        'cat': ['dog', 'pet', 'animal', 'kitten', 'feline'],
        'king': ['queen', 'ruler', 'monarch', 'crown', 'royal'],
        'happy': ['joyful', 'glad', 'pleased', 'cheerful', 'content']
    };
    
    const words = similarWords[word] || ['No similar words found'];
    
    // Create popup or update display
    const popup = document.createElement('div');
    popup.className = 'similarity-popup';
    popup.innerHTML = `
        <h4>Words similar to "${word}":</h4>
        <div class="similar-words">
            ${words.map(w => `<span class="similar-word">${w}</span>`).join('')}
        </div>
    `;
    
    // Add styles
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 1000;
        border: 2px solid #667eea;
    `;
    
    document.body.appendChild(popup);
    
    // Remove after 3 seconds
    setTimeout(() => {
        popup.remove();
    }, 3000);
    
    // Add click to close
    popup.addEventListener('click', () => popup.remove());
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeTaskCards();
    demonstrateWordSimilarity();
});

// Export functions
window.NLPPage = {
    animateAttentionWeights,
    animatePipelineFlow,
    animateTransformerComponents,
    initializeTaskCards,
    demonstrateWordSimilarity
};