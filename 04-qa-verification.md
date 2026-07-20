# 04 — QA & Verification Methods

"Done" means driven in a real browser (or on a real phone for money paths)
and the screenshot *looked at*. This guide is the toolbox for doing that fast.

## Dev QA URL params

Every randomized scene reads `location.search` overrides at mount:

```
?tod=night&wx=rain          # force scene state
&airline=KT                 # force flavor variant
&phase=docked|empty         # freeze choreography at a pose
&fast=1                     # 10x all timers (divide setTimeout ms)
```

Harmless in production, transformative for QA: any state is one URL away, for
you, for screenshots, and for the human reviewing on their own machine.
**Build these in from day one on any scene with randomness.** Same idea for
content QA: a dev route that renders the full asset catalog in a grid.

## Driving the real app from Playwright

The game's stores are ES modules, so the page can be puppeted through the
module graph:

```js
// Vite dev serves HMR-stamped URLs; the plain path is a DIFFERENT instance.
const url = performance.getEntriesByType('resource')
  .map(e => e.name).find(n => n.includes('/game/store.ts?'));
const store = await import(url ?? '/src/lib/game/store.ts');
store.session.patch({ … }); store.decideCurrent('clear');
```

Hard-won rules:

- **HMR-stamp gotcha:** `import('/src/lib/game/store.ts')` after any HMR is a
  fresh second instance that reads as empty/idle. Always find the `?t=`
  URL from performance entries. If results look impossible, you're on the
  wrong instance.
- **Patch before mount** when a scene snapshots state at entry (e.g. a
  monitor that captures the bag at deal-in): click the button and patch
  *synchronously in the same evaluate* so the scene mounts with your data.
- **Don't race the choreography.** Wait for the phase AND a settle delay
  before acting; deciding mid-deal-in wedged the overlay flow. And never call
  a store advance the UI will also call — double-advance desyncs scene vs
  store. When wedged: full page reload, fresh drive (cheap and reliable).
- **Batch time-critical steps** in one evaluate (act → sleep inside the
  page → return) because model/tool round-trips are seconds long; ephemeral
  UI (auto-advancing overlays) will be gone otherwise.
- Poll with `for` + small sleeps inside evaluate; return a small JSON
  status ({ phase, found, x }) so failures are diagnosable.

## Verifying motion & geometry numerically

Screenshots can't judge motion sync or hit targets — measure in-page:

```js
// speed match: sample an element's rect twice, compare px/s to the constant
// tap safety: elementFromPoint(center) — does the control actually win?
// overlap audit: getBoundingClientRect intersections between UI and scenery
```

The tap test caught "figures steal touches"; the speed test proved bins ride
the belt at exactly tread speed; a rect-intersection audit distinguished
visual overlap from transparent-bounding-box false alarms.

## The screenshot loop

1. Size the viewport to the real target (phone 540×960; tablets 600×1024,
   800×1280 — check the engine's min/maxAspect to predict letterboxing).
2. Force the state via params / module-driving.
3. Screenshot → **actually read the image**. Look for: cropped text, z-order
   accidents, off-model proportions, empty regions, contrast failures.
4. Fix → reshoot. Never present un-looked-at screenshots for approval.

This loop caught: wordmark cropped at the exact docked position, a scene
flung off-screen by a CSS collision, tablet corner-clustering, a result
overlay too low-contrast over a bright backdrop.

## On-device ground truth (Android)

- `adb logcat -c` → cold-start app → `adb logcat -d | grep -iE 'pattern'`.
  SDKs log their real failures ("Publisher misconfiguration: no form(s)
  configured…") — one log line replaced hours of guessing. JS `console.warn`
  from fail-safe wrappers also lands in logcat.
- AdMob **test device registration** (Settings → Test devices, shake-gesture
  ad inspector ON): real units serve labeled test ads = safe end-to-end
  verification; the inspector names every no-fill reason.
- Verify a signed AAB's *contents* when in doubt: `unzip -l app.aab` and grep
  the zip listing (extraction wildcards lie; the listing doesn't).

## Test-suite shape

- Unit tests only for pure logic; every gate, generator, migration, and
  rotation has a spec. No component/DOM tests — the browser-driving loop
  covers integration far better per unit of effort.
- Determinism in tests: local mulberry32 seeded RNG; generate hundreds of
  samples and assert invariants rather than snapshots.
- Content validators as tests: e.g. an SVG-path parser asserting every art
  asset stays in its declared box — art regressions fail CI.
