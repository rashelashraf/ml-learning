/* ==========================================================================
   training-testing.html
   This file was referenced by the page but missing from the repository, so
   selectModel() and startTraining() were undefined and the model cards and
   "Start Training" button did nothing. Implemented here.
   ========================================================================== */

const MODEL_INFO = {
    linear: {
        title: 'Linear Regression Architecture',
        summary: 'Fits a weighted sum of the input features. Fast to train, easy to interpret, but limited to linear relationships.',
        params: '5 parameters (4 weights + 1 bias)',
        strengths: ['Trains in milliseconds', 'Coefficients are directly interpretable', 'Very hard to overfit'],
        watch: 'Underfits whenever the true relationship is curved or has interactions.',
        curve: { start: 0.85, floor: 0.32, noise: 0.010, acc: 0.78 }
    },
    tree: {
        title: 'Decision Tree Architecture',
        summary: 'Recursively splits the feature space into axis-aligned regions. Captures non-linearity and interactions without any scaling.',
        params: 'Depth 6 · up to 63 decision nodes',
        strengths: ['Handles non-linear boundaries', 'No feature scaling required', 'Rules can be read off directly'],
        watch: 'A deep tree memorises the training set — prune it or limit the depth.',
        curve: { start: 0.80, floor: 0.18, noise: 0.022, acc: 0.86 }
    },
    neural: {
        title: 'Neural Network Architecture',
        summary: 'Stacked dense layers with non-linear activations. A universal approximator, given enough data and training time.',
        params: '4 → 8 → 8 → 1 · 129 trainable parameters',
        strengths: ['Learns complex patterns', 'Scales with more data', 'Shared backbone for transfer learning'],
        watch: 'Needs the most data and the most careful tuning of the four.',
        curve: { start: 0.92, floor: 0.09, noise: 0.016, acc: 0.93 }
    },
    ensemble: {
        title: 'Random Forest Architecture',
        summary: 'Averages many de-correlated decision trees trained on bootstrap samples. Robust with very little tuning.',
        params: '100 trees · max depth 8',
        strengths: ['Resists overfitting by averaging', 'Gives feature importances', 'Strong default performance'],
        watch: 'Larger memory footprint and slower to predict than a single tree.',
        curve: { start: 0.78, floor: 0.12, noise: 0.008, acc: 0.91 }
    }
};

let currentModel = 'neural';
let trainingRun = null;

/* ---------------------------------------------------------------- model -- */
function selectModel(model) {
    if (!MODEL_INFO[model]) return;
    currentModel = model;

    document.querySelectorAll('.model-card').forEach(card => {
        const isTarget = (card.getAttribute('onclick') || '').indexOf(`'${model}'`) !== -1;
        card.classList.toggle('active', isTarget);
        card.setAttribute('aria-pressed', isTarget ? 'true' : 'false');
    });

    const panel = document.getElementById('model-details');
    if (!panel) return;

    const info = MODEL_INFO[model];
    const heading = panel.querySelector('h4');
    if (heading) heading.textContent = info.title;

    // keep the existing diagram, refresh the descriptive block beneath it
    let notes = panel.querySelector('.model-summary');
    if (!notes) {
        notes = document.createElement('div');
        notes.className = 'model-summary';
        panel.appendChild(notes);
    }
    notes.innerHTML = `
        <p>${info.summary}</p>
        <p><strong>Size:</strong> ${info.params}</p>
        <ul>${info.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
        <p class="model-caveat"><strong>Watch out:</strong> ${info.watch}</p>`;

    // the neural diagram only makes sense for the neural option
    const diagram = panel.querySelector('.nn-architecture');
    if (diagram) diagram.style.display = (model === 'neural') ? '' : 'none';
}

/* -------------------------------------------------------------- training -- */
function startTraining() {
    const button = document.getElementById('start-training');
    if (trainingRun) {                       // second click stops the run
        clearInterval(trainingRun);
        trainingRun = null;
        if (button) button.innerHTML = '<i class="fas fa-play"></i> Start Training';
        return;
    }

    const val = (id, fallback) => {
        const el = document.getElementById(id);
        return el ? parseFloat(el.value) : fallback;
    };
    const lr = val('lr-slider', 0.01);
    const epochs = val('epoch-slider', 100);
    const batch = val('batch-slider', 32);
    const cfg = MODEL_INFO[currentModel].curve;

    // learning rate shapes how fast (and how stably) the loss falls
    const speed = Math.min(1, Math.max(0.15, lr / 0.02));
    const instability = lr > 0.05 ? (lr - 0.05) * 6 : 0;
    const batchSmoothing = Math.min(1, 32 / batch);

    let epoch = 0;
    const started = Date.now();
    const history = [];

    if (button) button.innerHTML = '<i class="fas fa-stop"></i> Stop Training';

    const set = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    trainingRun = setInterval(() => {
        epoch++;
        const progress = epoch / epochs;
        const decay = Math.exp(-3.2 * progress * speed);

        const jitter = () => (Math.random() - 0.5) * cfg.noise * batchSmoothing * 2
            + (Math.random() - 0.5) * instability * 0.15;

        const trainLoss = Math.max(0.001, cfg.floor + (cfg.start - cfg.floor) * decay + jitter());
        // validation loss turns back up late on — the overfitting signal
        const overfit = Math.max(0, progress - 0.65) * 0.35 * (currentModel === 'tree' ? 1.6 : 1);
        const valLoss = Math.max(0.001, trainLoss + 0.03 + overfit + Math.abs(jitter()));
        const acc = cfg.acc * (1 - decay * 0.55);

        history.push({ trainLoss, valLoss });

        set('current-epoch', `${epoch}/${epochs}`);
        set('train-loss', trainLoss.toFixed(3));
        set('val-loss', valLoss.toFixed(3));
        set('accuracy', `${(acc * 100).toFixed(1)}%`);
        set('training-time', `${((Date.now() - started) / 1000).toFixed(1)}s`);

        drawLossCurve(history, epochs);

        if (epoch >= epochs) {
            clearInterval(trainingRun);
            trainingRun = null;
            if (button) button.innerHTML = '<i class="fas fa-redo"></i> Train Again';
        }
    }, 40);
}

/* ---------------------------------------------------------------- charts -- */
function drawLossCurve(history, totalEpochs) {
    const canvas = document.getElementById('loss-canvas');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const pad = { l: 46, r: 14, t: 16, b: 30 };

    ctx.clearRect(0, 0, w, h);

    const maxLoss = Math.max(...history.map(p => p.valLoss), 0.4) * 1.08;
    const x = i => pad.l + (i / Math.max(1, totalEpochs - 1)) * (w - pad.l - pad.r);
    const y = v => h - pad.b - (v / maxLoss) * (h - pad.t - pad.b);

    // grid + axes
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#868e96';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
        const v = (maxLoss / 4) * i;
        ctx.beginPath();
        ctx.moveTo(pad.l, y(v));
        ctx.lineTo(w - pad.r, y(v));
        ctx.stroke();
        ctx.fillText(v.toFixed(2), pad.l - 8, y(v) + 4);
    }
    ctx.strokeStyle = '#adb5bd';
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t);
    ctx.lineTo(pad.l, h - pad.b);
    ctx.lineTo(w - pad.r, h - pad.b);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillText('Epoch', pad.l + (w - pad.l - pad.r) / 2, h - 8);

    const series = (key, colour) => {
        ctx.strokeStyle = colour;
        ctx.lineWidth = 2;
        ctx.beginPath();
        history.forEach((p, i) => (i ? ctx.lineTo(x(i), y(p[key])) : ctx.moveTo(x(i), y(p[key]))));
        ctx.stroke();
    };
    series('trainLoss', '#667eea');
    series('valLoss', '#ff6b6b');

    // legend
    ctx.textAlign = 'left';
    ctx.fillStyle = '#667eea';
    ctx.fillText('■ training loss', pad.l + 8, pad.t + 6);
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText('■ validation loss', pad.l + 108, pad.t + 6);
}

function drawRocCurve() {
    const canvas = document.getElementById('roc-canvas');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const s = canvas.width, pad = 26;

    ctx.clearRect(0, 0, s, s);

    ctx.strokeStyle = '#adb5bd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, s - pad);
    ctx.lineTo(s - pad, s - pad);
    ctx.stroke();

    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#ced4da';
    ctx.beginPath();
    ctx.moveTo(pad, s - pad);
    ctx.lineTo(s - pad, pad);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
        const fpr = i / 100;
        const tpr = Math.pow(fpr, 0.22);           // AUC ≈ 0.95
        const px = pad + fpr * (s - pad * 2);
        const py = (s - pad) - tpr * (s - pad * 2);
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();

    ctx.fillStyle = '#868e96';
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('False positive rate', s / 2, s - 6);
}

/* --------------------------------------------------------------- wiring -- */
document.addEventListener('DOMContentLoaded', function () {
    // live slider read-outs
    [['lr-slider', 'lr-display'], ['batch-slider', 'batch-display'], ['epoch-slider', 'epoch-display']]
        .forEach(([sliderId, displayId]) => {
            const slider = document.getElementById(sliderId);
            const display = document.getElementById(displayId);
            if (!slider || !display) return;
            const sync = () => {
                display.textContent = slider.value;
                if (sliderId === 'epoch-slider') {
                    const e = document.getElementById('current-epoch');
                    if (e && !trainingRun) e.textContent = `0/${slider.value}`;
                }
            };
            slider.addEventListener('input', sync);
            sync();
        });

    // model cards are clickable — make them keyboard reachable too
    document.querySelectorAll('.model-card').forEach(card => {
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });

    selectModel(currentModel);
    drawLossCurve([], 100);
    drawRocCurve();
});
