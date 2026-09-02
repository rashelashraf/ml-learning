/* ==========================================================================
   Image Data Processing — interactive demos
   1. Pixel inspector    : an image really is a grid of numbers
   2. Channel splitter   : colour is stacked grayscale planes
   3. Kernel playground  : convolution with hand-written 3x3 kernels

   Everything is drawn from code, so the page needs no image assets and
   the canvases are never tainted by cross-origin data.
   ========================================================================== */
(function () {
    'use strict';

    /* ----------------------------------------------------------------------
       1. PIXEL INSPECTOR
       ---------------------------------------------------------------------- */
    const GRID = 12;

    // A hand-drawn "A" so the shape is obviously made of numbers.
    const GLYPH = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0],
        [0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];

    function buildBaseImage() {
        // Ink where the glyph is, a soft background gradient elsewhere, plus a
        // little noise — real images are never perfectly flat.
        const px = [];
        for (let r = 0; r < GRID; r++) {
            const row = [];
            for (let c = 0; c < GRID; c++) {
                const gradient = 28 + Math.round((r + c) * 2.4);
                const noise = ((r * 7 + c * 13) % 11) - 5;
                const value = GLYPH[r][c] ? 232 + noise : gradient + noise;
                row.push(Math.max(0, Math.min(255, value)));
            }
            px.push(row);
        }
        return px;
    }

    function initPixelInspector() {
        const grid = document.getElementById('pixelGrid');
        const readout = document.getElementById('pixelReadout');
        const swatch = document.getElementById('pixelSwatch');
        const toggleBtn = document.getElementById('pxToggleNumbers');
        const invertBtn = document.getElementById('pxInvert');
        const resetBtn = document.getElementById('pxReset');
        if (!grid || !readout) return;

        let pixels = buildBaseImage();
        let showValues = true;
        let inverted = false;
        let activeCell = null;

        function paint() {
            grid.textContent = '';
            for (let r = 0; r < GRID; r++) {
                for (let c = 0; c < GRID; c++) {
                    const v = pixels[r][c];
                    const cell = document.createElement('div');
                    cell.className = 'pixel';
                    cell.style.background = 'rgb(' + v + ',' + v + ',' + v + ')';
                    cell.style.color = v > 130 ? '#1a202c' : '#e2e8f0';
                    cell.textContent = showValues ? v : '';
                    cell.tabIndex = 0;
                    cell.dataset.row = r;
                    cell.dataset.col = c;
                    cell.setAttribute('aria-label',
                        'Row ' + r + ', column ' + c + ', value ' + v);
                    grid.appendChild(cell);
                }
            }
            if (activeCell) describe(activeCell.r, activeCell.c);
        }

        function describe(r, c) {
            activeCell = { r: r, c: c };
            const v = pixels[r][c];
            swatch.style.background = 'rgb(' + v + ',' + v + ',' + v + ')';
            const labels = ['row, col', 'value', 'scaled', 'as RGB'];
            const values = [
                '(' + r + ', ' + c + ')',
                v + ' (uint8)',
                (v / 255).toFixed(3) + ' in [0, 1]',
                'rgb(' + v + ',' + v + ',' + v + ')'
            ];
            readout.querySelectorAll('.rline').forEach(function (line, i) {
                line.children[0].textContent = labels[i];
                line.children[1].textContent = values[i];
            });

            grid.querySelectorAll('.pixel').forEach(function (p) {
                p.classList.toggle('is-active',
                    Number(p.dataset.row) === r && Number(p.dataset.col) === c);
            });
        }

        function handle(e) {
            const cell = e.target.closest('.pixel');
            if (!cell) return;
            describe(Number(cell.dataset.row), Number(cell.dataset.col));
        }

        grid.addEventListener('mouseover', handle);
        grid.addEventListener('focusin', handle);
        grid.addEventListener('click', handle);

        toggleBtn.addEventListener('click', function () {
            showValues = !showValues;
            toggleBtn.textContent = showValues ? 'Hide values' : 'Show values';
            toggleBtn.classList.toggle('active', showValues);
            paint();
        });

        invertBtn.addEventListener('click', function () {
            pixels = pixels.map(function (row) {
                return row.map(function (v) { return 255 - v; });
            });
            inverted = !inverted;
            invertBtn.classList.toggle('active', inverted);
            paint();
        });

        resetBtn.addEventListener('click', function () {
            pixels = buildBaseImage();
            inverted = false;
            invertBtn.classList.remove('active');
            paint();
        });

        paint();
        describe(6, 5);
    }

    /* ----------------------------------------------------------------------
       Shared synthetic image
       ---------------------------------------------------------------------- */
    function drawScene(ctx, w, h) {
        // sky gradient
        const sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, '#4a6fd4');
        sky.addColorStop(1, '#9fd0ef');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);

        // sun
        ctx.fillStyle = '#ffd24a';
        ctx.beginPath();
        ctx.arc(w * 0.76, h * 0.22, w * 0.11, 0, Math.PI * 2);
        ctx.fill();

        // ground
        ctx.fillStyle = '#3f8f4a';
        ctx.fillRect(0, h * 0.62, w, h * 0.38);

        // a red block, for an unambiguous red channel
        ctx.fillStyle = '#d33b32';
        ctx.fillRect(w * 0.10, h * 0.38, w * 0.26, h * 0.30);

        // roof
        ctx.fillStyle = '#8e3b2f';
        ctx.beginPath();
        ctx.moveTo(w * 0.06, h * 0.38);
        ctx.lineTo(w * 0.23, h * 0.22);
        ctx.lineTo(w * 0.40, h * 0.38);
        ctx.closePath();
        ctx.fill();

        // window: high contrast square, useful for the edge kernels
        ctx.fillStyle = '#f2f2f0';
        ctx.fillRect(w * 0.17, h * 0.46, w * 0.11, h * 0.11);

        // stripes, so directional kernels have something to bite on
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(w * (0.50 + i * 0.07), h * 0.70, w * 0.03, h * 0.22);
        }
    }

    /* ----------------------------------------------------------------------
       2. CHANNEL SPLITTER
       ---------------------------------------------------------------------- */
    const CH_SIZE = 140;

    function makeTile(caption) {
        const fig = document.createElement('figure');
        fig.className = 'canvas-tile';
        const cv = document.createElement('canvas');
        cv.width = CH_SIZE;
        cv.height = CH_SIZE;
        const cap = document.createElement('figcaption');
        cap.textContent = caption;
        fig.appendChild(cv);
        fig.appendChild(cap);
        return { fig: fig, canvas: cv };
    }

    function initChannelSplitter() {
        const row = document.getElementById('channelRow');
        const select = document.getElementById('channelView');
        const caption = document.getElementById('channelCaption');
        if (!row || !select) return;

        // render the source once, then reuse its pixel data
        const src = document.createElement('canvas');
        src.width = CH_SIZE;
        src.height = CH_SIZE;
        const sctx = src.getContext('2d');
        drawScene(sctx, CH_SIZE, CH_SIZE);
        const source = sctx.getImageData(0, 0, CH_SIZE, CH_SIZE);

        function put(canvas, data) {
            canvas.getContext('2d').putImageData(data, 0, 0);
        }

        function channelImage(offset, tinted) {
            const out = new ImageData(CH_SIZE, CH_SIZE);
            for (let i = 0; i < source.data.length; i += 4) {
                const v = source.data[i + offset];
                out.data[i] = tinted && offset !== 0 ? 0 : v;
                out.data[i + 1] = tinted && offset !== 1 ? 0 : v;
                out.data[i + 2] = tinted && offset !== 2 ? 0 : v;
                out.data[i + 3] = 255;
            }
            return out;
        }

        function grayImage(weights) {
            const out = new ImageData(CH_SIZE, CH_SIZE);
            for (let i = 0; i < source.data.length; i += 4) {
                const v = Math.round(
                    weights[0] * source.data[i] +
                    weights[1] * source.data[i + 1] +
                    weights[2] * source.data[i + 2]
                );
                out.data[i] = out.data[i + 1] = out.data[i + 2] = v;
                out.data[i + 3] = 255;
            }
            return out;
        }

        function render() {
            row.textContent = '';
            const mode = select.value;
            const tiles = [];

            const original = makeTile('Original (RGB)');
            tiles.push(original);
            row.appendChild(original.fig);
            put(original.canvas, source);

            if (mode === 'gray') {
                const specs = [
                    ['Luminance (BT.601)', [0.299, 0.587, 0.114], grayImage],
                    ['Naive average', [1 / 3, 1 / 3, 1 / 3], grayImage],
                    ['Green channel only', [0, 1, 0], grayImage]
                ];
                specs.forEach(function (s) {
                    const t = makeTile(s[0]);
                    row.appendChild(t.fig);
                    put(t.canvas, s[2](s[1]));
                });
                caption.textContent = 'All three are single-channel images of shape (H, W). '
                    + 'Luminance weights green most heavily because the eye is most sensitive to it, '
                    + 'so it preserves apparent brightness better than a flat average.';
                return;
            }

            const tinted = mode === 'tinted';
            [['Red channel', 0], ['Green channel', 1], ['Blue channel', 2]].forEach(function (s) {
                const t = makeTile(s[0]);
                row.appendChild(t.fig);
                put(t.canvas, channelImage(s[1], tinted));
            });

            caption.textContent = tinted
                ? 'The same three planes, each drawn in its own colour. Add them back together pixel by pixel and you get the original.'
                : 'Each channel on its own is a grayscale image. Bright means a high value in that channel — the red block is near-white in red and near-black in blue.';
        }

        select.addEventListener('change', render);
        render();
    }

    /* ----------------------------------------------------------------------
       3. KERNEL PLAYGROUND
       ---------------------------------------------------------------------- */
    const KERNELS = {
        identity: {
            k: [0, 0, 0, 0, 1, 0, 0, 0, 0],
            divisor: 1, offset: 0,
            note: 'One weight of 1 in the centre: every output pixel equals its input. The baseline everything else is measured against.'
        },
        boxblur: {
            k: [1, 1, 1, 1, 1, 1, 1, 1, 1],
            divisor: 9, offset: 0,
            note: 'Every neighbour counts equally, so each output pixel is the average of its 3x3 patch. Averaging removes fine detail, which is why it smooths.'
        },
        gaussian: {
            k: [1, 2, 1, 2, 4, 2, 1, 2, 1],
            divisor: 16, offset: 0,
            note: 'A weighted average that trusts the centre pixel most. Smoother and more natural-looking than a box blur at the same size.'
        },
        sharpen: {
            k: [0, -1, 0, -1, 5, -1, 0, -1, 0],
            divisor: 1, offset: 0,
            note: 'Boosts the centre and subtracts its neighbours, so differences between adjacent pixels grow. Edges gain contrast; noise does too.'
        },
        sobelx: {
            k: [-1, 0, 1, -2, 0, 2, -1, 0, 1],
            divisor: 1, offset: 128,
            note: 'Left column subtracted from right. Flat areas cancel to zero (mid grey here), so only vertical edges light up.'
        },
        sobely: {
            k: [-1, -2, -1, 0, 0, 0, 1, 2, 1],
            divisor: 1, offset: 128,
            note: 'The same idea rotated: top row minus bottom row, so it responds to horizontal edges instead.'
        },
        laplacian: {
            k: [0, 1, 0, 1, -4, 1, 0, 1, 0],
            divisor: 1, offset: 128,
            note: 'Weights sum to zero, so anything uniform vanishes. Responds to edges in every direction at once.'
        },
        emboss: {
            k: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
            divisor: 1, offset: 128,
            note: 'An asymmetric kernel that lights one side of each edge and darkens the other, giving a raised, lit-from-a-corner look.'
        }
    };

    const CONV_SIZE = 140;

    function convolve(src, spec, w, h) {
        const out = new ImageData(w, h);
        const k = spec.k;
        const div = spec.divisor || 1;
        const off = spec.offset || 0;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let r = 0, g = 0, b = 0;
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        // clamp at the border: reuse the edge pixel rather than
                        // reading outside the image
                        const sy = Math.min(h - 1, Math.max(0, y + ky));
                        const sx = Math.min(w - 1, Math.max(0, x + kx));
                        const si = (sy * w + sx) * 4;
                        const weight = k[(ky + 1) * 3 + (kx + 1)];
                        r += src.data[si] * weight;
                        g += src.data[si + 1] * weight;
                        b += src.data[si + 2] * weight;
                    }
                }
                const di = (y * w + x) * 4;
                out.data[di] = Math.min(255, Math.max(0, r / div + off));
                out.data[di + 1] = Math.min(255, Math.max(0, g / div + off));
                out.data[di + 2] = Math.min(255, Math.max(0, b / div + off));
                out.data[di + 3] = 255;
            }
        }
        return out;
    }

    function formatKernel(spec) {
        const cells = spec.k.map(function (v) {
            return String(v).padStart(3, ' ');
        });
        let text = '';
        for (let i = 0; i < 3; i++) {
            text += '[ ' + cells.slice(i * 3, i * 3 + 3).join('  ') + ' ]\n';
        }
        if (spec.divisor !== 1) text += '\n\u00f7 ' + spec.divisor + '  (weights sum to ' + spec.divisor + ')';
        if (spec.offset) text += (spec.divisor !== 1 ? '   ' : '\n') + '+ ' + spec.offset + ' offset, so negatives stay visible';
        return text;
    }

    function initKernelPlayground() {
        const srcCanvas = document.getElementById('convSource');
        const outCanvas = document.getElementById('convResult');
        const select = document.getElementById('kernelPick');
        const readout = document.getElementById('kernelReadout');
        const caption = document.getElementById('kernelCaption');
        if (!srcCanvas || !outCanvas || !select) return;

        const sctx = srcCanvas.getContext('2d');
        drawScene(sctx, CONV_SIZE, CONV_SIZE);
        const source = sctx.getImageData(0, 0, CONV_SIZE, CONV_SIZE);

        function apply() {
            const spec = KERNELS[select.value];
            const result = convolve(source, spec, CONV_SIZE, CONV_SIZE);
            outCanvas.getContext('2d').putImageData(result, 0, 0);
            readout.textContent = formatKernel(spec);
            caption.textContent = spec.note;
        }

        select.addEventListener('change', apply);
        apply();
    }

    /* ---------------------------------------------------------------------- */
    document.addEventListener('DOMContentLoaded', function () {
        initPixelInspector();
        initChannelSplitter();
        initKernelPlayground();
    });
})();
