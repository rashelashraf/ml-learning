// Interactive Demos JavaScript - FIXED VERSION

// Global state for demos
let demoState = {
    trainingData: null,
    regressionData: null,
    clusterData: null,
    currentDemo: 'classification',
    isTraining: false,
    regressionBounds: null
};

// Demo utilities object
window.DemoUtils = {
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

// Initialize demos when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeDemos();
});

function initializeDemos() {
    // Initialize all sliders
    initializeSliders();
    
    // Initialize canvas for classification demo (default)
    setTimeout(() => {
        initializeCanvas('classification');
    }, 100);
}

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

// Demo tab management
function showDemo(demoId) {
    // Hide all demo contents
    document.querySelectorAll('.demo-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show target demo
    const targetDemo = document.getElementById(`${demoId}-demo`);
    if (targetDemo) {
        targetDemo.classList.add('active');
        demoState.currentDemo = demoId;
    }
    
    // Update active tab
    document.querySelectorAll('.demo-tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find and activate the clicked button
    const buttons = document.querySelectorAll('.demo-tab-button');
    buttons.forEach(btn => {
        if (btn.textContent.toLowerCase().includes(demoId.replace('-', ' '))) {
            btn.classList.add('active');
        }
    });
    
    // Initialize canvas for the demo
    setTimeout(() => {
        initializeCanvas(demoId);
    }, 100);
}

// Initialize canvas with grid
function initializeCanvas(demoType) {
    let canvasId;
    switch (demoType) {
        case 'classification':
            canvasId = 'classification-canvas';
            break;
        case 'regression':
            canvasId = 'regression-canvas';
            break;
        case 'clustering':
            canvasId = 'clustering-canvas';
            break;
    }
    
    if (canvasId) {
        window.DemoUtils.clearCanvas(canvasId);
    }
}

// CLASSIFICATION DEMO FUNCTIONS
function generateData() {
    const datasetType = document.getElementById('dataset-type')?.value || 'blobs';
    const numPoints = parseInt(document.getElementById('num-points')?.value || '200');
    const noiseLevel = parseFloat(document.getElementById('noise-level')?.value || '0.1');
    
    const data = window.DemoUtils.generateRandomData(datasetType, numPoints, noiseLevel);
    demoState.trainingData = data;
    
    // Clear canvas and draw new data
    window.DemoUtils.clearCanvas('classification-canvas');
    window.DemoUtils.drawDataPoints('classification-canvas', data);
    
    // Reset results
    resetClassificationResults();
}

function trainModel() {
    const data = demoState.trainingData;
    if (!data) {
        alert('Please generate data first!');
        return;
    }
    
    const algorithm = document.getElementById('algorithm-type')?.value || 'logistic';
    
    // Simulate training with delay
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Training...';
    button.disabled = true;
    
    setTimeout(() => {
        const results = simulateTraining(data, algorithm);
        displayClassificationResults(results);
        drawDecisionBoundary('classification-canvas', data, algorithm);
        
        button.textContent = originalText;
        button.disabled = false;
    }, 1000);
}

function simulateTraining(data, algorithm) {
    // Simulate different algorithm performance
    let accuracy, precision, recall, f1;
    
    switch (algorithm) {
        case 'logistic':
            accuracy = 0.85 + Math.random() * 0.1;
            precision = 0.82 + Math.random() * 0.1;
            recall = 0.88 + Math.random() * 0.1;
            break;
        case 'svm':
            accuracy = 0.88 + Math.random() * 0.08;
            precision = 0.86 + Math.random() * 0.08;
            recall = 0.84 + Math.random() * 0.1;
            break;
        case 'knn':
            accuracy = 0.82 + Math.random() * 0.12;
            precision = 0.80 + Math.random() * 0.12;
            recall = 0.85 + Math.random() * 0.1;
            break;
        case 'tree':
            accuracy = 0.80 + Math.random() * 0.15;
            precision = 0.78 + Math.random() * 0.15;
            recall = 0.82 + Math.random() * 0.12;
            break;
        default:
            accuracy = 0.85;
            precision = 0.82;
            recall = 0.88;
    }
    
    f1 = 2 * (precision * recall) / (precision + recall);
    
    // Generate confusion matrix
    const total = data.length;
    const tp = Math.round(total * 0.4 * recall);
    const fp = Math.round(total * 0.6 * (1 - precision));
    const fn = Math.round(total * 0.4 * (1 - recall));
    const tn = total - tp - fp - fn;
    
    return { accuracy, precision, recall, f1, tp, fp, fn, tn };
}

function displayClassificationResults(results) {
    const elements = {
        'demo-accuracy': `${(results.accuracy * 100).toFixed(1)}%`,
        'demo-precision': `${(results.precision * 100).toFixed(1)}%`,
        'demo-recall': `${(results.recall * 100).toFixed(1)}%`,
        'demo-f1': `${(results.f1 * 100).toFixed(1)}%`,
        'demo-tp': results.tp,
        'demo-fp': results.fp,
        'demo-fn': results.fn,
        'demo-tn': results.tn
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

function resetClassificationResults() {
    ['demo-accuracy', 'demo-precision', 'demo-recall', 'demo-f1', 'demo-tp', 'demo-fp', 'demo-fn', 'demo-tn'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = '--';
    });
}

function drawDecisionBoundary(canvasId, data, algorithm) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Draw decision boundary
    ctx.strokeStyle = '#45b7d1';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    
    ctx.beginPath();
    
    switch (algorithm) {
        case 'logistic':
        case 'svm':
            // Linear boundary
            ctx.moveTo(canvas.width * 0.2, canvas.height * 0.8);
            ctx.lineTo(canvas.width * 0.8, canvas.height * 0.2);
            break;
        case 'knn':
            // More complex boundary
            ctx.moveTo(canvas.width * 0.1, canvas.height * 0.7);
            ctx.quadraticCurveTo(canvas.width * 0.5, canvas.height * 0.3, canvas.width * 0.9, canvas.height * 0.6);
            break;
        case 'tree':
            // Step-like boundary
            ctx.moveTo(canvas.width * 0.3, 0);
            ctx.lineTo(canvas.width * 0.3, canvas.height * 0.4);
            ctx.lineTo(canvas.width * 0.7, canvas.height * 0.4);
            ctx.lineTo(canvas.width * 0.7, canvas.height);
            break;
    }
    
    ctx.stroke();
    ctx.setLineDash([]);
}

function clearAll() {
    window.DemoUtils.clearCanvas('classification-canvas');
    demoState.trainingData = null;
    resetClassificationResults();
}

// REGRESSION DEMO FUNCTIONS
function generateRegressionData() {
    const functionType = document.getElementById('function-type')?.value || 'linear';
    const numPoints = parseInt(document.getElementById('reg-num-points')?.value || '100');
    const noiseLevel = parseFloat(document.getElementById('reg-noise-level')?.value || '0.3');
    
    const data = [];
    
    for (let i = 0; i < numPoints; i++) {
        const x = (i / numPoints) * 10;
        let y;
        
        switch (functionType) {
            case 'linear':
                y = 2 * x + 1;
                break;
            case 'polynomial':
                y = 0.1 * x * x - x + 5;
                break;
            case 'sine':
                y = 3 * Math.sin(x) + 5;
                break;
            case 'exponential':
                y = Math.exp(x * 0.5);
                break;
            default:
                y = 2 * x + 1;
        }
        
        // Add noise
        y += (Math.random() - 0.5) * noiseLevel * 5;
        
        data.push({ x, y });
    }
    
    demoState.regressionData = data;
    demoState.regressionBounds = {
        xMin: Math.min(...data.map(d => d.x)),
        xMax: Math.max(...data.map(d => d.x)),
        yMin: Math.min(...data.map(d => d.y)),
        yMax: Math.max(...data.map(d => d.y))
    };
    
    // Clear canvas and draw new data
    window.DemoUtils.clearCanvas('regression-canvas');
    drawRegressionPoints('regression-canvas', data);
    
    // Reset results
    resetRegressionResults();
}

function drawRegressionPoints(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !data) return;
    
    const ctx = canvas.getContext('2d');
    const bounds = demoState.regressionBounds;
    
    if (!bounds) return;
    
    // Draw points
    data.forEach(point => {
        const x = ((point.x - bounds.xMin) / (bounds.xMax - bounds.xMin)) * (canvas.width - 40) + 20;
        const y = canvas.height - 20 - ((point.y - bounds.yMin) / (bounds.yMax - bounds.yMin)) * (canvas.height - 40);
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#96ceb4';
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
    });
}

function trainRegressionModel() {
    const data = demoState.regressionData;
    if (!data) {
        alert('Please generate data first!');
        return;
    }
    
    const algorithm = document.getElementById('regression-algorithm')?.value || 'linear';
    const polyDegree = parseInt(document.getElementById('poly-degree')?.value || '3');
    
    // Simulate training
    setTimeout(() => {
        const results = simulateRegressionTraining(data, algorithm, polyDegree);
        displayRegressionResults(results);
        drawRegressionLine('regression-canvas', data, algorithm, polyDegree);
    }, 500);
}

function simulateRegressionTraining(data, algorithm, polyDegree) {
    // Simulate different algorithm performance
    let r2, mse, mae;
    
    switch (algorithm) {
        case 'linear':
            r2 = 0.75 + Math.random() * 0.2;
            mse = 1.5 + Math.random() * 1.0;
            mae = 1.0 + Math.random() * 0.8;
            break;
        case 'polynomial':
            r2 = Math.min(0.95, 0.8 + polyDegree * 0.05 + Math.random() * 0.1);
            mse = Math.max(0.1, 2.0 - polyDegree * 0.2 + Math.random() * 0.5);
            mae = Math.max(0.1, 1.5 - polyDegree * 0.15 + Math.random() * 0.4);
            break;
        case 'ridge':
            r2 = 0.78 + Math.random() * 0.15;
            mse = 1.3 + Math.random() * 0.8;
            mae = 0.9 + Math.random() * 0.6;
            break;
        default:
            r2 = 0.75;
            mse = 1.5;
            mae = 1.0;
    }
    
    return { r2, mse, mae };
}

function displayRegressionResults(results) {
    const elements = {
        'r2-score': results.r2.toFixed(3),
        'mse-score': results.mse.toFixed(3),
        'mae-score': results.mae.toFixed(3)
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

function resetRegressionResults() {
    ['r2-score', 'mse-score', 'mae-score'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = '--';
    });
}

function drawRegressionLine(canvasId, data, algorithm, polyDegree) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const bounds = demoState.regressionBounds;
    
    if (!bounds) return;
    
    // Draw fitted line
    ctx.strokeStyle = '#feca57';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = bounds.xMin + t * (bounds.xMax - bounds.xMin);
        let y;
        
        // Simulate fitted function
        switch (algorithm) {
            case 'linear':
                y = 2 * x + 1;
                break;
            case 'polynomial':
                if (polyDegree === 2) {
                    y = 0.1 * x * x - x + 5;
                } else if (polyDegree === 3) {
                    y = 0.05 * x * x * x - 0.3 * x * x + x + 3;
                } else {
                    y = 2 * x + 1;
                }
                break;
            case 'ridge':
                y = 1.8 * x + 1.2;
                break;
            default:
                y = 2 * x + 1;
        }
        
        const canvasX = ((x - bounds.xMin) / (bounds.xMax - bounds.xMin)) * (canvas.width - 40) + 20;
        const canvasY = canvas.height - 20 - ((y - bounds.yMin) / (bounds.yMax - bounds.yMin)) * (canvas.height - 40);
        
        if (i === 0) {
            ctx.moveTo(canvasX, canvasY);
        } else {
            ctx.lineTo(canvasX, canvasY);
        }
    }
    
    ctx.stroke();
}

// CLUSTERING DEMO FUNCTIONS
function generateClusterData() {
    const dataType = document.getElementById('cluster-data-type')?.value || 'blobs';
    const numPoints = parseInt(document.getElementById('cluster-num-points')?.value || '150');
    
    const data = [];
    
    for (let i = 0; i < numPoints; i++) {
        let x, y;
        
        switch (dataType) {
            case 'blobs':
                const cluster = Math.floor(Math.random() * 3);
                const centers = [[2, 2], [6, 6], [2, 8]];
                x = centers[cluster][0] + (Math.random() - 0.5) * 2;
                y = centers[cluster][1] + (Math.random() - 0.5) * 2;
                break;
            case 'circles':
                const angle = Math.random() * 2 * Math.PI;
                if (Math.random() > 0.5) {
                    const radius = Math.random() * 2 + 1;
                    x = 5 + radius * Math.cos(angle);
                    y = 5 + radius * Math.sin(angle);
                } else {
                    const radius = Math.random() * 1.5 + 3.5;
                    x = 5 + radius * Math.cos(angle);
                    y = 5 + radius * Math.sin(angle);
                }
                break;
            case 'moons':
                const t = Math.random() * Math.PI;
                if (Math.random() > 0.5) {
                    x = Math.cos(t) * 3 + 5;
                    y = Math.sin(t) * 1.5 + 2.5;
                } else {
                    x = 1 - Math.cos(t) * 3 + 5;
                    y = 1 - Math.sin(t) * 1.5 + 5;
                }
                break;
            case 'random':
            default:
                x = Math.random() * 10;
                y = Math.random() * 10;
                break;
        }
        
        data.push({ x, y, cluster: -1 });
    }
    
    demoState.clusterData = data;
    
    // Clear canvas and draw new data
    window.DemoUtils.clearCanvas('clustering-canvas');
    drawClusterPoints('clustering-canvas', data);
    
    // Reset results
    resetClusteringResults();
}

function drawClusterPoints(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    
    data.forEach(point => {
        const x = (point.x / 10) * canvas.width;
        const y = canvas.height - (point.y / 10) * canvas.height;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        
        if (point.cluster >= 0) {
            ctx.fillStyle = colors[point.cluster % colors.length];
        } else {
            ctx.fillStyle = '#95a5a6';
        }
        
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
    });
}

function runClustering() {
    const data = demoState.clusterData;
    if (!data) {
        alert('Please generate data first!');
        return;
    }
    
    const algorithm = document.getElementById('clustering-algorithm')?.value || 'kmeans';
    const numClusters = parseInt(document.getElementById('num-clusters')?.value || '3');
    
    // Simulate clustering
    setTimeout(() => {
        const results = simulateClustering(data, algorithm, numClusters);
        displayClusteringResults(results);
        drawClusterPoints('clustering-canvas', data);
        drawCentroids('clustering-canvas', results.centroids);
    }, 500);
}

function simulateClustering(data, algorithm, numClusters) {
    // Simple clustering simulation
    const centroids = [];
    
    // Initialize centroids randomly
    for (let i = 0; i < numClusters; i++) {
        centroids.push({
            x: Math.random() * 10,
            y: Math.random() * 10
        });
    }
    
    // Assign points to clusters (simplified)
    data.forEach(point => {
        let minDist = Infinity;
        let closestCluster = 0;
        
        centroids.forEach((centroid, index) => {
            const dist = Math.sqrt(
                Math.pow(point.x - centroid.x, 2) + 
                Math.pow(point.y - centroid.y, 2)
            );
            if (dist < minDist) {
                minDist = dist;
                closestCluster = index;
            }
        });
        
        point.cluster = closestCluster;
    });
    
    // Calculate metrics
    const silhouette = 0.3 + Math.random() * 0.5;
    const inertia = 10 + Math.random() * 20;
    
    return {
        centroids,
        silhouette,
        inertia,
        numClusters
    };
}

function drawCentroids(canvasId, centroids) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    centroids.forEach(centroid => {
        const x = (centroid.x / 10) * canvas.width;
        const y = canvas.height - (centroid.y / 10) * canvas.height;
        
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#2c2c54';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
    });
}

function displayClusteringResults(results) {
    const elements = {
        'silhouette-score': results.silhouette.toFixed(3),
        'inertia-score': results.inertia.toFixed(1),
        'final-clusters': results.numClusters
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

function resetClusteringResults() {
    ['silhouette-score', 'inertia-score', 'final-clusters'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = '--';
    });
}

// NEURAL NETWORK PLAYGROUND FUNCTIONS
function buildNetwork() {
    const numLayers = parseInt(document.getElementById('num-layers')?.value || '2');
    const neuronsPerLayer = parseInt(document.getElementById('neurons-per-layer')?.value || '4');
    
    // Calculate total parameters
    let totalParams = 0;
    totalParams += 4 * neuronsPerLayer; // Input to first hidden
    
    for (let i = 1; i < numLayers; i++) {
        totalParams += neuronsPerLayer * neuronsPerLayer; // Hidden to hidden
    }
    
    totalParams += neuronsPerLayer * 1; // Last hidden to output
    
    // Update display
    const totalParamsEl = document.getElementById('total-params');
    const forwardTimeEl = document.getElementById('forward-time');
    
    if (totalParamsEl) totalParamsEl.textContent = totalParams.toLocaleString();
    if (forwardTimeEl) forwardTimeEl.textContent = `${(Math.random() * 5 + 1).toFixed(1)}ms`;
    
    // Draw network visualization
    drawNetworkArchitecture(numLayers, neuronsPerLayer);
}

function drawNetworkArchitecture(numLayers, neuronsPerLayer) {
    const container = document.getElementById('network-diagram');
    if (!container) return;
    
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; height: 150px; padding: 20px; overflow-x: auto;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; min-width: 80px;">
                <div style="font-size: 12px; font-weight: bold; color: #333;">Input (4)</div>
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    ${Array(4).fill(0).map(() => '<div style="width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>').join('')}
                </div>
            </div>
            ${Array(numLayers).fill(0).map((_, i) => `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; min-width: 80px;">
                    <div style="font-size: 12px; font-weight: bold; color: #333;">Hidden ${i + 1}</div>
                    <div style="display: flex; flex-direction: column; gap: 5px;">
                        ${Array(Math.min(neuronsPerLayer, 6)).fill(0).map(() => '<div style="width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>').join('')}
                        ${neuronsPerLayer > 6 ? '<div style="color: #666; font-size: 12px;">...</div>' : ''}
                    </div>
                </div>
            `).join('')}
            <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; min-width: 80px;">
                <div style="font-size: 12px; font-weight: bold; color: #333;">Output (1)</div>
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <div style="width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
                </div>
            </div>
        </div>
    `;
}

function trainNetwork() {
    if (demoState.isTraining) return;
    
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Training...';
    button.disabled = true;
    demoState.isTraining = true;
    
    let epoch = 0;
    const maxEpochs = 50;
    let loss = 2.5;
    let accuracy = 0.1;
    
    const trainingInterval = setInterval(() => {
        epoch++;
        loss = Math.max(0.01, loss - (Math.random() * 0.1 + 0.02));
        accuracy = Math.min(0.95, accuracy + (Math.random() * 0.03 + 0.01));
        
        const epochEl = document.getElementById('current-nn-epoch');
        const lossEl = document.getElementById('current-nn-loss');
        const accuracyEl = document.getElementById('current-nn-accuracy');
        
        if (epochEl) epochEl.textContent = epoch;
        if (lossEl) lossEl.textContent = loss.toFixed(3);
        if (accuracyEl) accuracyEl.textContent = `${(accuracy * 100).toFixed(1)}%`;
        
        if (epoch >= maxEpochs) {
            clearInterval(trainingInterval);
            button.textContent = originalText;
            button.disabled = false;
            demoState.isTraining = false;
            
            const trainingTime = (Math.random() * 10 + 5).toFixed(1);
            const trainingTimeEl = document.getElementById('training-time');
            if (trainingTimeEl) trainingTimeEl.textContent = `${trainingTime}s`;
        }
    }, 100);
}

function resetNetwork() {
    demoState.isTraining = false;
    
    ['current-nn-epoch', 'current-nn-loss', 'current-nn-accuracy'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = '0';
    });
    
    ['total-params', 'forward-time', 'training-time'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = '--';
    });
    
    const container = document.getElementById('network-diagram');
    if (container) container.innerHTML = '';
}

// Make functions globally available
window.showDemo = showDemo;
window.generateData = generateData;
window.trainModel = trainModel;
window.clearAll = clearAll;
window.generateRegressionData = generateRegressionData;
window.trainRegressionModel = trainRegressionModel;
window.generateClusterData = generateClusterData;
window.runClustering = runClustering;
window.buildNetwork = buildNetwork;
window.trainNetwork = trainNetwork;
window.resetNetwork = resetNetwork;