/* ==========================================================================
   hyperparameter-tuning.html
   Two interactive demos:
     1. A 2-D validation-score surface searched by grid / random / Bayesian /
        successive-halving, plus a "best score vs trials" convergence chart.
     2. A validation curve showing under- and overfitting as capacity grows.
   ========================================================================== */

/* ------------------------------------------------------------------ setup */

// Deterministic RNG so a given strategy + budget always tells the same story.
function makeRng(seed) {
    let a = seed >>> 0;
    return function () {
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/* The hidden objective. x is the hyperparameter that matters a lot (think
   learning rate), y is the one that barely matters — which is exactly the
   asymmetry that makes random search beat grid search. */
function objective(x, y) {
    const main = Math.exp(-Math.pow((x - 0.58) / 0.12, 2));      // sharp ridge in x
    const minor = Math.exp(-Math.pow((y - 0.34) / 0.55, 2));     // broad, forgiving in y
    const decoy = 0.45 * Math.exp(-Math.pow((x - 0.22) / 0.10, 2)
                                  - Math.pow((y - 0.75) / 0.30, 2)); // local optimum
    return Math.max(0, Math.min(1, 0.55 + 0.42 * main * minor + decoy * 0.35 - 0.06));
}

const OPTIMUM = (function () {
    let best = 0;
    for (let i = 0; i <= 200; i++) {
        for (let j = 0; j <= 200; j++) {
            best = Math.max(best, objective(i / 200, j / 200));
        }
    }
    return best;
})();

const STRATEGY_TEXT = {
    grid: 'Grid search covers the space evenly — and spends most of its budget re-testing ' +
          'the same few values of the hyperparameter that actually matters.',
    random: 'Random search tries a new value of every hyperparameter on every trial, so it ' +
            'samples the important dimension far more finely for the same budget.',
    bayesian: 'Bayesian optimisation fits a surrogate to the trials so far and samples where it ' +
              'expects improvement — note how the dots cluster around the promising region.',
    halving: 'Successive halving starts many cheap configurations, keeps the top half, and gives ' +
             'the survivors more budget. Faded dots were eliminated early. Its real win is ' +
             'wall-clock time — early trials are cheap — which a trial count does not capture.'
};

const STRATEGY_COLOUR = {
    grid: '#ff6b6b',
    random: '#20c997',
    bayesian: '#667eea',
    halving: '#f59f00'
};

let currentStrategy = 'grid';
let lastRun = null;
const convergence = {};   // strategy -> array of best-so-far scores

/* --------------------------------------------------------------- searches */

function runGrid(budget) {
    const side = Math.max(2, Math.round(Math.sqrt(budget)));
    const pts = [];
    for (let i = 0; i < side; i++) {
        for (let j = 0; j < side; j++) {
            const x = (i + 0.5) / side;
            const y = (j + 0.5) / side;
            pts.push({ x, y, score: objective(x, y), alive: true });
        }
    }
    return pts.slice(0, budget);
}

function runRandom(budget, rng) {
    const pts = [];
    for (let i = 0; i < budget; i++) {
        const x = rng(), y = rng();
        pts.push({ x, y, score: objective(x, y), alive: true });
    }
    return pts;
}

/* A deliberately simple surrogate: inverse-distance-weighted mean of the
   observations plus an exploration bonus for being far from them. Enough to
   show the clustering behaviour without pulling in a GP implementation. */
function runBayesian(budget, rng) {
    const pts = [];
    const seed = Math.min(5, Math.max(3, Math.floor(budget * 0.2)));

    for (let i = 0; i < seed; i++) {
        const x = rng(), y = rng();
        pts.push({ x, y, score: objective(x, y), alive: true });
    }

    while (pts.length < budget) {
        let bestCand = null, bestAcq = -Infinity;
        // exploit more as the budget is used up
        const kappa = 0.45 * (1 - pts.length / budget) + 0.08;
        const h2 = 2 * 0.12 * 0.12;
        const globalMean = pts.reduce((a, p) => a + p.score, 0) / pts.length;

        for (let c = 0; c < 400; c++) {
            const x = rng(), y = rng();
            let wsum = 0, vsum = 0, wmax = 0;
            for (const p of pts) {
                const d2 = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y);
                const w = Math.exp(-d2 / h2);      // Gaussian kernel
                wsum += w;
                vsum += w * p.score;
                if (w > wmax) wmax = w;
            }
            const mean = wsum > 1e-6 ? vsum / wsum : globalMean;
            const uncertainty = 1 - wmax;          // 0 next to a trial, 1 far away
            const acq = mean + kappa * uncertainty;
            if (acq > bestAcq) { bestAcq = acq; bestCand = { x, y }; }
        }
        pts.push({ x: bestCand.x, y: bestCand.y, score: objective(bestCand.x, bestCand.y), alive: true });
    }

    return pts;
}

/* Successive halving: many configs at low budget, repeatedly keep the top half.
   Eliminated configs are drawn faded. Low-budget scores are noisy on purpose —
   that noise is the real risk of the method. */
function runHalving(budget, rng) {
    let n = Math.min(budget, Math.max(8, Math.round(budget * 0.7)));
    let survivors = [];
    for (let i = 0; i < n; i++) {
        const x = rng(), y = rng();
        survivors.push({ x, y, score: 0, alive: true, rungs: 0 });
    }

    let spent = 0, rung = 0;
    const all = survivors.slice();

    while (survivors.length > 1 && spent < budget) {
        const fidelity = Math.min(1, 0.45 + 0.3 * rung);
        for (const p of survivors) {
            const noise = (rng() - 0.5) * 0.05 * (1 - fidelity);
            p.score = Math.max(0, Math.min(1, objective(p.x, p.y) + noise));
            p.rungs = rung + 1;
            spent++;
            if (spent >= budget) break;
        }
        survivors.sort((a, b) => b.score - a.score);
        const keep = Math.max(1, Math.floor(survivors.length / 2));
        survivors.slice(keep).forEach(p => { p.alive = false; });
        survivors = survivors.slice(0, keep);
        rung++;
    }
    // final honest score for whatever survived
    survivors.forEach(p => { p.score = objective(p.x, p.y); });
    return all;
}

function runSearch(strategy, budget, seed) {
    const rng = makeRng(seed >>> 0);
    if (strategy === 'grid') return runGrid(budget);
    if (strategy === 'random') return runRandom(budget, rng);
    if (strategy === 'bayesian') return runBayesian(budget, rng);
    return runHalving(budget, rng);
}

/* Grid search is deterministic; the others are not. Reporting a single draw
   would make the comparison a coin flip, so we also report the median best
   score over many independent repeats. */
function medianBest(strategy, budget, repeats) {
    if (strategy === 'grid') {
        const pts = runSearch('grid', budget, 1);
        return Math.max(...pts.map(p => p.score));
    }
    const out = [];
    for (let r = 0; r < repeats; r++) {
        const pts = runSearch(strategy, budget, 1000 + r * 7919);
        const alive = pts.filter(p => p.alive);
        out.push(Math.max(...(alive.length ? alive : pts).map(p => p.score)));
    }
    out.sort((a, b) => a - b);
    return out[Math.floor(out.length / 2)];
}

/* --------------------------------------------------------------- drawing */

function scoreColour(v, alpha) {
    // low = indigo, high = warm — readable and colour-blind-safe enough
    const t = Math.max(0, Math.min(1, (v - 0.45) / 0.55));
    const r = Math.round(70 + t * 185);
    const g = Math.round(80 + t * 120);
    const b = Math.round(180 - t * 140);
    return `rgba(${r},${g},${b},${alpha})`;
}

function drawSpace(points) {
    const canvas = document.getElementById('space-canvas');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const pad = { l: 44, r: 12, t: 12, b: 38 };
    const w = W - pad.l - pad.r, h = H - pad.t - pad.b;

    ctx.clearRect(0, 0, W, H);

    // heat map of the objective
    const cell = 6;
    for (let px = 0; px < w; px += cell) {
        for (let py = 0; py < h; py += cell) {
            const x = px / w;
            const y = 1 - py / h;
            ctx.fillStyle = scoreColour(objective(x, y), 0.85);
            ctx.fillRect(pad.l + px, pad.t + py, cell, cell);
        }
    }

    // true optimum
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pad.l + 0.58 * w, pad.t + (1 - 0.34) * h, 11, 0, Math.PI * 2);
    ctx.stroke();

    // trials
    let best = null;
    points.forEach(p => {
        const cx = pad.l + p.x * w;
        const cy = pad.t + (1 - p.y) * h;
        ctx.beginPath();
        ctx.arc(cx, cy, p.alive ? 4.5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = p.alive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.28)';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = p.alive ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.15)';
        ctx.stroke();
        if (p.alive && (!best || p.score > best.score)) best = p;
    });

    // mark the winner
    if (best) {
        const cx = pad.l + best.x * w, cy = pad.t + (1 - best.y) * h;
        ctx.strokeStyle = '#212529';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.stroke();
    }

    // axes
    ctx.strokeStyle = '#adb5bd';
    ctx.lineWidth = 1;
    ctx.strokeRect(pad.l, pad.t, w, h);
    ctx.fillStyle = '#495057';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('hyperparameter A  (matters a lot)', pad.l + w / 2, H - 10);
    ctx.save();
    ctx.translate(13, pad.t + h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('hyperparameter B  (barely matters)', 0, 0);
    ctx.restore();
}

function drawProgress() {
    const canvas = document.getElementById('progress-canvas');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const pad = { l: 48, r: 14, t: 16, b: 40 };
    const w = W - pad.l - pad.r, h = H - pad.t - pad.b;

    ctx.clearRect(0, 0, W, H);

    const series = Object.keys(convergence);
    const maxTrials = Math.max(10, ...series.map(k => convergence[k].length));
    const lo = 0.5, hi = 1.0;

    const X = i => pad.l + (i / Math.max(1, maxTrials - 1)) * w;
    const Y = v => pad.t + h - ((v - lo) / (hi - lo)) * h;

    // grid
    ctx.strokeStyle = '#e9ecef';
    ctx.fillStyle = '#868e96';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const v = lo + (hi - lo) * i / 5;
        ctx.beginPath();
        ctx.moveTo(pad.l, Y(v));
        ctx.lineTo(pad.l + w, Y(v));
        ctx.stroke();
        ctx.fillText(v.toFixed(2), pad.l - 8, Y(v) + 4);
    }

    // theoretical best
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = '#adb5bd';
    ctx.beginPath();
    ctx.moveTo(pad.l, Y(OPTIMUM));
    ctx.lineTo(pad.l + w, Y(OPTIMUM));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.textAlign = 'left';
    ctx.fillText('true optimum', pad.l + 6, Y(OPTIMUM) - 6);

    if (!series.length) {
        ctx.fillStyle = '#868e96';
        ctx.textAlign = 'center';
        ctx.fillText('Run a search to plot its convergence', pad.l + w / 2, pad.t + h / 2);
    }

    series.forEach(key => {
        const data = convergence[key];
        ctx.strokeStyle = STRATEGY_COLOUR[key];
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        data.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))));
        ctx.stroke();
    });

    // axis + legend
    ctx.strokeStyle = '#adb5bd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t);
    ctx.lineTo(pad.l, pad.t + h);
    ctx.lineTo(pad.l + w, pad.t + h);
    ctx.stroke();

    ctx.fillStyle = '#495057';
    ctx.textAlign = 'center';
    ctx.fillText('trials spent', pad.l + w / 2, H - 22);

    ctx.textAlign = 'left';
    series.forEach((key, i) => {
        const lx = pad.l + (i % 2) * 150;
        const ly = H - 10 + Math.floor(i / 2) * 0;
        ctx.fillStyle = STRATEGY_COLOUR[key];
        ctx.fillRect(lx, ly - 8, 9, 9);
        ctx.fillStyle = '#495057';
        ctx.fillText(key, lx + 14, ly);
    });
}

/* ------------------------------------------------------------- interaction */

let runCounter = 0;

function executeSearch() {
    const budgetEl = document.getElementById('budget-slider');
    const budget = budgetEl ? parseInt(budgetEl.value, 10) : 25;

    // a new draw each time, so repeated clicks show the run-to-run variability
    runCounter++;
    const points = runSearch(currentStrategy, budget, 20260726 + runCounter * 104729);
    lastRun = points;

    const evaluated = points.filter(p => p.score > 0);
    const curve = [];
    let best = 0;
    evaluated.forEach(p => { best = Math.max(best, p.score); curve.push(best); });
    convergence[currentStrategy] = curve;

    const winner = points.filter(p => p.alive)
        .reduce((a, b) => (b.score > a.score ? b : a), { score: -1 });

    const repeats = currentStrategy === 'bayesian' ? 40 : 200;
    const median = medianBest(currentStrategy, budget, repeats);

    const set = (id, txt) => {
        const el = document.getElementById(id);
        if (el) el.textContent = txt;
    };
    set('trials-used', String(evaluated.length));
    set('best-score', winner.score >= 0 ? winner.score.toFixed(4) : '\u2014');
    set('best-params', winner.score >= 0
        ? `A=${winner.x.toFixed(2)}, B=${winner.y.toFixed(2)}` : '\u2014');
    set('median-score', currentStrategy === 'grid'
        ? median.toFixed(4) + ' (deterministic)'
        : median.toFixed(4) + ` (${repeats} runs)`);
    set('score-gap', winner.score >= 0
        ? '\u2212' + (OPTIMUM - winner.score).toFixed(4) : '\u2014');

    drawSpace(points);
    drawProgress();
}

/* ------------------------------------------------------- validation curve */

function validationScores(capacity) {
    // training score climbs and saturates
    const train = 0.58 + 0.40 * (1 - Math.exp(-capacity / 3.2));
    // the generalisation gap opens up once capacity passes the sweet spot,
    // so validation = training - gap and never exceeds training
    const gap = 0.025 + 0.013 * Math.pow(Math.max(0, capacity - 6), 1.15);
    return {
        train: Math.min(0.999, train),
        val: Math.max(0.5, train - gap)
    };
}

function drawValidationCurve(selected) {
    const canvas = document.getElementById('validation-canvas');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const pad = { l: 50, r: 16, t: 20, b: 44 };
    const w = W - pad.l - pad.r, h = H - pad.t - pad.b;
    const MAXC = 20, lo = 0.5, hi = 1.0;

    const X = c => pad.l + ((c - 1) / (MAXC - 1)) * w;
    const Y = v => pad.t + h - ((v - lo) / (hi - lo)) * h;

    ctx.clearRect(0, 0, W, H);

    // under / good / over regions
    const zones = [
        { from: 1, to: 3.5, fill: 'rgba(255,193,7,0.12)', label: 'underfit' },
        { from: 3.5, to: 9.5, fill: 'rgba(32,201,151,0.14)', label: 'good' },
        { from: 9.5, to: MAXC, fill: 'rgba(255,107,107,0.12)', label: 'overfit' }
    ];
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    zones.forEach(z => {
        ctx.fillStyle = z.fill;
        ctx.fillRect(X(z.from), pad.t, X(z.to) - X(z.from), h);
        ctx.fillStyle = '#868e96';
        ctx.fillText(z.label, (X(z.from) + X(z.to)) / 2, pad.t + 14);
    });

    ctx.strokeStyle = '#e9ecef';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#868e96';
    for (let i = 0; i <= 5; i++) {
        const v = lo + (hi - lo) * i / 5;
        ctx.beginPath();
        ctx.moveTo(pad.l, Y(v));
        ctx.lineTo(pad.l + w, Y(v));
        ctx.stroke();
        ctx.fillText(v.toFixed(2), pad.l - 8, Y(v) + 4);
    }

    const line = (key, colour) => {
        ctx.strokeStyle = colour;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        for (let c = 1; c <= MAXC; c += 0.25) {
            const v = validationScores(c)[key];
            (c === 1) ? ctx.moveTo(X(c), Y(v)) : ctx.lineTo(X(c), Y(v));
        }
        ctx.stroke();
    };
    line('train', '#667eea');
    line('val', '#ff6b6b');

    // the currently selected capacity
    const s = validationScores(selected);
    ctx.strokeStyle = '#212529';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(X(selected), pad.t);
    ctx.lineTo(X(selected), pad.t + h);
    ctx.stroke();
    ctx.setLineDash([]);

    [['train', '#667eea'], ['val', '#ff6b6b']].forEach(([k, colour]) => {
        ctx.beginPath();
        ctx.arc(X(selected), Y(s[k]), 5, 0, Math.PI * 2);
        ctx.fillStyle = colour;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    ctx.strokeStyle = '#adb5bd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.l, pad.t);
    ctx.lineTo(pad.l, pad.t + h);
    ctx.lineTo(pad.l + w, pad.t + h);
    ctx.stroke();

    ctx.fillStyle = '#495057';
    ctx.textAlign = 'center';
    ctx.fillText('model capacity', pad.l + w / 2, H - 24);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#667eea';
    ctx.fillText('■ training score', pad.l + 6, H - 8);
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText('■ validation score', pad.l + 120, H - 8);
}

function updateValidationCurve() {
    const slider = document.getElementById('capacity-slider');
    if (!slider) return;
    const c = parseInt(slider.value, 10);
    const s = validationScores(c);
    const gap = s.train - s.val;

    const set = (id, txt) => {
        const el = document.getElementById(id);
        if (el) el.textContent = txt;
    };
    set('capacity-display', String(c));
    set('vc-train', s.train.toFixed(3));
    set('vc-val', s.val.toFixed(3));
    set('vc-gap', gap.toFixed(3));

    const badge = document.querySelector('#fit-verdict .verdict-badge');
    const text = document.getElementById('verdict-text');
    if (badge && text) {
        if (c <= 3) {
            badge.textContent = 'Underfitting';
            badge.className = 'verdict-badge under';
            text.textContent = 'Both scores are low and close together. The model lacks the capacity ' +
                'to represent the pattern — increase capacity before touching regularisation.';
        } else if (c <= 9) {
            badge.textContent = 'Good fit';
            badge.className = 'verdict-badge good';
            text.textContent = 'Training and validation scores are close and both high. This is the ' +
                'region you want, and where the validation curve peaks.';
        } else {
            badge.textContent = 'Overfitting';
            badge.className = 'verdict-badge over';
            text.textContent = 'Training score keeps climbing while validation falls away. The model ' +
                'is memorising noise — reduce capacity or add regularisation.';
        }
    }
    drawValidationCurve(c);
}

/* ---------------------------------------------------------------- wiring */

document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('space-canvas')) return;   // not this page

    document.querySelectorAll('.strategy-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.strategy-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-pressed', 'true');
            currentStrategy = this.dataset.strategy;

            const caption = document.getElementById('strategy-caption');
            if (caption) caption.textContent = STRATEGY_TEXT[currentStrategy];
            executeSearch();
        });
    });

    const budget = document.getElementById('budget-slider');
    if (budget) {
        budget.addEventListener('input', function () {
            const d = document.getElementById('budget-display');
            if (d) d.textContent = this.value;
        });
        budget.addEventListener('change', executeSearch);
    }

    const run = document.getElementById('run-search');
    if (run) run.addEventListener('click', executeSearch);

    const capacity = document.getElementById('capacity-slider');
    if (capacity) capacity.addEventListener('input', updateValidationCurve);

    executeSearch();
    updateValidationCurve();
});
