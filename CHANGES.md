# GUI fixes — ML/DL Learning Hub

## 1. Tab order now follows the machine learning pipeline

The ten tabs appeared in a different order on almost every page. They are now
identical everywhere and ordered as a pipeline, with **Tabular Data first and
NLP Data second** as requested:

| # | Tab | Stage |
|---|-----|-------|
| — | Home | — |
| 1 | **Tabular Data** | Data processing |
| 2 | **NLP Data** | Data processing |
| 3 | Encoding | Feature engineering |
| 4 | Feature Selection | Feature engineering |
| 5 | Training | Modelling |
| 6 | **Tuning** *(new)* | Modelling |
| 7 | Ensembles | Modelling |
| 8 | Advanced Topics | Advanced |
| 9 | Deep Learning | Advanced |
| 10 | Demos | Practice |

Previously: `advanced-topics.html` placed Encoding before Ensembles,
`encoding.html` reversed it and dropped the Deep Learning tab entirely,
`index.html` used a third order, and `training-testing.html` a fourth.

The **prev/next buttons** now walk this same chain end to end. The old chain
skipped Encoding, Feature Selection, Ensembles and Deep Learning completely;
those three pages had no prev/next at all. The **footer** is now one shared
component on every page, grouped into the four pipeline stages (it previously
ranged from one section on `tabular-data.html` to four on `index.html`).

## 2. Navbar no longer overflows

Ten links at `gap: 2rem` inside a 1200px container did not fit, so the menu
wrapped to a second line. Because the navbar is `position: fixed`, that changed
its height and pushed the bar over the page content.

- Links compacted (`0.85rem`, tighter padding) and set to `white-space: nowrap`
- Shared rail widened to **1280px**
- Mobile drawer breakpoint raised from **768px → 1200px**, so the drawer takes
  over before the links can ever collide with the brand

Verified: 10 items on 1 row, 0px horizontal overflow, constant 65px navbar
height at 1440 / 1280 / 1201 / 1199 / 1024 / 768 / 390px.

## 3. Panel alignment

`.main-content`, `.overview-section`, `.stats-section`, `.concepts-section`,
`.best-practices`, `.demo-instructions` and `.page-navigation` all used
`margin: 2rem auto` with **no `max-width`**. As block elements they stretched
edge to edge while the navbar and footer stopped at 1200px — this was the main
misalignment.

All rails now share one width and one gutter. Measured left edge of the navbar,
hero, page header, content panels, prev/next bar and footer at 1440px viewport:
**80px on every page** (previously 20px vs 100px).

Also fixed:

- Inner `.container` elements inside panels were padding a second time
- `120px` hard-coded top offsets replaced with a `--nav-height` variable
- Anchor targets got `scroll-margin-top` so the fixed navbar stops hiding them

## 4. Broken JavaScript (this is why the mobile menu never worked)

- **`js/main.js` did not parse.** Copy-pasted duplicate blocks declared
  `const style` and `const hamburger` twice at top level → `SyntaxError`,
  so *none* of the navigation JS ran on any page. Removed the three redundant
  blocks (the surviving `initializeNavigation()` already did the work).
- **`js/nlp.js` did not parse.** Three malformed regex literals
  (`/'/re/g` instead of `/'re/g`) broke the NLP page's scripts.
- **`js/training.js` was missing** but referenced by `training-testing.html`,
  so `selectModel()` and `startTraining()` were undefined and the model cards
  and Start Training button did nothing. Written: model switching, an animated
  loss/validation curve on canvas showing the overfitting divergence, live
  metric read-outs, slider bindings and an ROC curve.
- **`js/tabular.js`** was referenced but did not exist; the function it was
  meant to provide (`selectMethod`) already lives in `main.js`, so the dead
  reference was removed.

## 5. `advanced-topics.html` was a different site

It never loaded `styles/main.css` — it carried its own ~1000-line copy of the
site chrome, so its navbar, header and footer had drifted. It now links the
shared stylesheet and `main.js`; 29 duplicated chrome rules were stripped and
only its page-specific styles remain.

## 6. `dl.html` was a dead end

Linked from the nav but with no route back into the hub, and its in-page tab
bar marked "Home" as the *active* tab while you were on the DL page. Added a
sticky hub bar (styled to match its dark theme) with all ten destinations, plus
prev/next buttons so it sits inside the pipeline chain.

## 7. Other GUI fixes

- Stand-alone breadcrumb strip on Encoding / Feature Selection / Ensembles sat
  underneath the fixed navbar — now offset by `--nav-height`
- Heroes on those pages used a 2-column grid with no second column, leaving
  half the row empty — now single-column when there is no visual
- Headings sitting directly on the purple gradient were `#333` on purple — now
  light with a shadow
- Feature cards were ragged-height with centred text, so tag rows never lined
  up — now equal height with tags pinned to a shared baseline
- Cards were `onclick` divs — now real `<a>` links (keyboard and middle-click work)
- Hamburger: `aria-expanded`, `aria-controls`, Enter/Space and Escape support,
  and it no longer sticks open when resizing back to desktop
- Added focus-visible outlines, a back-to-top control, a navbar scroll shadow,
  and a `prefers-reduced-motion` block

## 8. Home page

Rebuilt around the four pipeline stages, with all nine modules as numbered
cards (Tabular #1, NLP #2). Previously it showed five of the nine modules and
led with NLP. Stats updated (`8+ Pipeline Types` → `9 Pipeline Modules`).


---

# Added: Hyperparameter Tuning module

A new `hyperparameter-tuning.html` slots in at **stage 6**, between Training &
Testing and Ensembles — you tune before you ensemble, and both belong to the
modelling stage.

## Page contents

1. **Parameters vs hyperparameters** — what the model learns vs what you choose
2. **What to tune, by model family** — linear, trees, boosting, neural nets,
   with the two or three settings that actually move the needle in each
3. **Search strategies** — interactive; grid / random / Bayesian / successive
   halving on a shared objective, with a convergence chart
4. **Reading a validation curve** — interactive under/good/overfit zones
5. **Tuning without fooling yourself** — nested CV, leakage, a `Pipeline` example
6. **A practical playbook** — six steps from baseline to final report

Plus a pitfalls section: tuning on the test set, chasing noise, wrong metric,
ignoring the budget.

## The interactive demos, and two things the testing caught

The search demo plots a hidden 2-D validation surface where hyperparameter A
matters a lot (a sharp ridge) and B barely matters — the asymmetry that drives
the classic grid-vs-random result. Each strategy spends the same trial budget
and you can see where the dots land.

Testing the demo against the text caught two problems worth recording:

- **The demo initially contradicted the lesson.** The optimum sat at A=0.68,
  which is almost exactly a grid line on a 5x5 lattice, so grid search got a
  lucky hit and beat random — the opposite of what the page was claiming.
  Moved the optimum off-lattice.
- **The random number generator was not random enough.** The LCG in the first
  draft puts consecutive `(x, y)` pairs on a coarse lattice, so "random" search
  was sampling a grid of its own and scoring badly. Replaced with mulberry32.

Even after fixing those, a *single* run is luck: random search's advantage is a
statement about expected performance. So the demo now reports a **"typical
result"** — the median best score over 200 repeats (40 for Bayesian, which is
costlier) — alongside the single visible run, and re-seeds on every click so you
can watch the variability directly.

That changed the honest conclusion, and the page text was rewritten to match it:
in **two** dimensions grid and random are roughly even on average, but grid
*lurches* — it does well at budgets 16, 36, 64 where the lattice happens to land
near the optimum, and poorly in between, and you cannot know in advance which
you will get. Random improves smoothly. The Bergstra & Bengio result (random
pulls decisively ahead) is stated as what happens once you add dimensions,
rather than being over-claimed for the 2-D demo on screen. Bayesian wins at
every budget tested (0.87-0.91 vs a true optimum of ~0.92), with the caveat that
it is sequential and harder to parallelise. Successive halving's caption notes
its real win is wall-clock time, which a trial count does not capture.

The validation curve demo also had a bug: validation score sat *above* training
score in the underfitting region, and the "generalisation gap" read negative.
Rewritten so validation is derived as `training - gap`, which keeps the ordering
correct at every capacity and makes the gap grow monotonically.

## Wiring

- Nav is now 11 items. `Training & Testing` shortened to `Training` in the tab
  bar, which freed exactly enough room — 11 items need 1210px against the
  1280px rail, so it still sits on one row with no overflow at any width.
- Home page: new card at position 6, later badges renumbered 7-10, counts
  updated to 10 modules
- Prev/next chain, footer groups and the `dl.html` hub bar all updated
- New files: `hyperparameter-tuning.html`, `js/tuning.js`, plus section 13 of
  `styles/main.css`

---

### Files changed

```
hyperparameter-tuning.html  NEW — tuning module (stage 6)
js/tuning.js                NEW — search strategy + validation curve demos
index.html                rebuilt hero + stage-grouped module cards
tabular-data.html         nav, footer, prev/next, dead script ref removed
nlp-pipeline.html         nav, footer, prev/next
encoding.html             nav, footer, prev/next added, breadcrumb fix
feature-selection.html    nav, footer, prev/next added, breadcrumb fix
ensemble-techniques.html  nav, footer, prev/next added, breadcrumb fix
training-testing.html     nav, footer, prev/next
advanced-topics.html      now uses shared CSS/JS; 29 duplicate rules removed
interactive-demos.html    nav, footer, prev/next
dl.html                   hub bar + prev/next added
styles/main.css           original rules untouched; fixes appended as §1–§12
js/main.js                syntax error fixed; accessibility/UX block appended
js/nlp.js                 3 regex literals fixed
js/training.js            new file
```

`styles/main.css` was **appended to, not rewritten** — the original rules are
intact above the `UI / ALIGNMENT FIXES` banner, so any change can be reverted
by deleting that section.

### Not changed

`mlpipeline.html`, `deeplearnhub.html` and `dl-questions.html` are not linked
from anywhere in the site and appear to be earlier drafts. Left untouched — say
the word if you want them wired in or removed.

Note: Font Awesome loads from a CDN, so icons will be blank if you open these
files with no internet connection. Layout is unaffected.

---

# Round 2 — code sample rendering + Image Data module

## 4. Code samples rendered on a single line

Most samples were written straight into `<div class="code-block">` (also
`.code-example` and `.code-snippet`). A `<div>` inherits
`white-space: normal`, so the browser collapses every newline and every run of
leading spaces into one space — a 30-line listing rendered as one paragraph of
run-on text. The samples that happened to use `<pre>` were the only ones that
looked right, which is why the bug appeared inconsistent.

Fixed in two layers so it cannot come back:

1. **Markup** — 56 raw-code containers rewritten as
   `<pre class="..."><code>…</code></pre>`, with `&`, `<` and `>` escaped and
   leading/trailing blank lines trimmed:

   | File | Blocks |
   |---|---|
   | `dl.html` | 44 |
   | `deeplearnhub.html` | 6 |
   | `feature-selection.html` | 3 |
   | `encoding.html` | 2 |
   | `ensemble-techniques.html` | 1 |

   Containers that already held real markup (`nlp-pipeline.html`,
   `hyperparameter-tuning.html`) were left alone.

2. **CSS** — `white-space: pre` and `tab-size: 4` added to the code classes in
   each page's `<style>` block plus a shared rule set in `main.css`, with child
   rules so a nested `<code>`/`<pre>` cannot restyle or re-wrap the sample.
   This also covers the samples `showCode()` injects at runtime in `dl.html`.

Also fixed: a stray `</b>` in `dl.html` (the RNN card), which was the only HTML
nesting error in the site.

## 5. New module — Image Data Processing

`image-processing.html` joins the pipeline as **module 3**, in Stage 1 with the
other data-processing modules, between NLP Data and Encoding.

Eleven sections: the image as a grid of numbers; intensity, bit depth and the
`uint8` overflow trap; channels and colour spaces; HWC vs CHW and batching;
loading with PIL / OpenCV / torchvision including the BGR pitfall; resize, crop
and rotate with interpolation; convolution and kernels; histograms and
thresholding; file formats and lossy compression; the full preprocessing
pipeline; and augmentation.

Three interactive demos in `js/image-processing.js`, all drawn from code so the
page needs no image assets and no canvas is ever tainted:

- **Pixel inspector** — a 12×12 grayscale grid, hover or keyboard-focus any
  cell to read the stored value, with invert and show/hide toggles
- **Channel splitter** — one synthetic scene shown as separate R/G/B planes,
  tinted planes, or three different grayscale conversions
- **Kernel playground** — eight 3×3 kernels (blur, sharpen, Sobel X/Y,
  Laplacian, emboss) applied live, with the matrix and an explanation alongside

Wired into the site: nav link on all 11 pages that carry the navbar, footer
Stage 1 list, home page feature card, and the prev/next chain
(NLP Data → **Image Data** → Encoding). Home page badges renumbered 3–10 → 4–11
and the module count updated from 10 to 11.

## 6. Navbar: 12 links on the shared rail

The 12th link needed ~1320px beside the brand at the old `0.6rem` link padding,
but the shared rail stops at 1280px, so the row overflowed at every desktop
width. Rather than widen the rail — which every other panel aligns to — the
links were tightened (`0.82rem`, `0.42rem` horizontal padding), bringing the
menu to ~1172px. The active-underline offsets were matched to the new padding.

That fits from about 1220px up, so the drawer breakpoint moved from **1200px →
1260px** in both `main.css` and `js/main.js` (the resize guard), keeping the
hamburger in charge through the narrow band.

Verified at 1600 / 1440 / 1300 / 1261 / 1260 / 1024 / 390px on every page:
one row, no horizontal overflow, constant 65px navbar height.

### Known issue, not introduced here

Three pages still overflow horizontally on narrow screens. All three behave
identically in the original files, so this is unrelated to these changes —
happy to fix them separately:

| Page | Viewport | Overflow |
|---|---|---|
| `tabular-data.html` | 390px | 435px |
| `tabular-data.html` | 768px | 57px |
| `training-testing.html` | 390px | 258px |
| `mlpipeline.html` (unlinked draft) | 390px | 162px |

The new `image-processing.html` is clean at every width tested; its reference
tables scroll inside a wrapper rather than widening the page.
