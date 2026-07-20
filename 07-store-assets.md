# 07 — Generated Store Assets

Every store asset (video, screenshots, feature graphic) is *generated from
the real game*, deterministic and re-runnable. Nothing hand-made, so a visual
overhaul means re-running scripts, not re-hiring yourself.

## Demo video (`npm run record:demo`)

- **`/demo` route**: mounts the real scene set; a driver module takes over on
  load. Ships in prod harmlessly (it's just an autoplayer page).
- **Scripted cast, not random play**: a pure `demoCast.ts` builds N beats
  ({passenger, action, thinkMs}) from the real generator with FIXED SEEDS,
  normalized into directed story beats (quick successes → the dramatic catch
  → variety), asserted by unit tests (outcomes exactly as choreographed,
  determinism, visual distinctness). Every take is identical.
- **Driver**: marks tutorial done, clicks the real start button, swaps the
  scripted cast in *synchronously before the scene mounts*, then paces
  decisions with human-like waits. Signals completion via
  `document.body.dataset.demoDone`; hard 60s safety timeout so the recorder
  always exits. Match beats by stable IDs, never object identity.
- **Recorder** (`scripts/record-demo.mjs`, Playwright): viewport at the
  game's native CSS size, `recordVideo` same size, wait for the done flag,
  then **ffmpeg upscale** to store resolution (lanczos; flat art doubles
  cleanly) + H.264 mp4. Playwright will NOT upscale video and page-zoom
  tricks break viewport math — record native, upscale after.
- `DEMO_QUERY` env passes scene params for art direction
  (`'?tod=dusk&wx=clear'`) — pick the take's mood deliberately.
- No audio is captured; store videos get music in post or a device screen
  recording if real sfx matter. Re-record after any title-screen change.

## Screenshots

Drive real states (guide 04), screenshot at native size, ffmpeg-upscale 2×:

- Phone 540×960 → 1080×1920; tablet 600×1024 → 1200×2048 (7"); 800×1280 →
  1600×2560 (10"). Folders per class for upload sanity.
- Shot list = one per pillar: hero/title (best mood via params), core
  gameplay *with the interesting thing visible* (plant it in the state —
  remember snapshot-at-mount scenes need pre-mount patching), the
  reward/payoff moment, plus each personality scene.
- Screenshots ARE QA: the tablet set exposed a real rendering bug
  (fixed-coordinate content in a scaled container). Budget for a fix →
  reshoot → re-ship loop.

## Feature graphic (1024×500) & similar composites

Author as a throwaway HTML file served from `static/` on the dev server;
element-screenshot the exact-size container; delete the HTML (never ship it).

- **Reuse real art geometry verbatim** — copy the actual SVG paths from the
  game component. Redrawing "something like it" reads off-model instantly
  and the human WILL notice.
- Composition: brand block over a dark anchoring gradient on one side,
  subject on the other; check for text-vs-art collisions and gradient
  swallowing; verify the famous-name gag/variant chosen is the most
  instantly-recognizable one, not the funniest-to-you one.
- Small iterations: screenshot → look → nudge sizes/positions → repeat.
  2–3 rounds is normal.

## Icons

Same HTML→screenshot trick works for small icons (e.g. an IAP product icon:
512×512, no text per store rules). App icon set was generated once during an
app-identity pass and reused everywhere from `static/icons/`.

## Housekeeping

`store-assets/` holds only current deliverables (video, feature-graphic,
icon-512, screenshots/…): clean old takes deliberately — and NEVER with lazy
globs (`rm f*.png` once ate `feature-graphic.png`). List before you delete.
Document the asset inventory + console answer keys in `docs/store-listing.md`
so release morning is copy-paste.
