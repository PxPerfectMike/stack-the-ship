# 02 — Architecture Patterns

## The session store

One store (`session`) holds the whole run state; module-level action functions
mutate it (`startGame`, `decideCurrent`, `advanceAfterResult`, `continueRun`).
Components subscribe (`$session`) and call actions; they never patch state
shapes themselves.

Rules learned the hard way:

- **The store clones state.** Never compare store objects by reference across
  a patch — key on a stable ID field instead (this silently broke a driver
  that checked `current === expected`).
- **Guard flags live in the store** when they must gate actions globally
  (`coaching` disables decisions + patience drain; `continueUsed` is
  once-per-run). Reset them explicitly in `startGame`.
- **One-shot session signals** (e.g. "replay the tutorial next shift") are a
  module-level `let` + `request…()`/`consume…()` pair — deliberately NOT in
  the persisted save, so they can't re-arm anything permanently. Trivially
  unit-testable.

## Pure gates everywhere

Every "should X happen?" decision is a pure exported function with an
interface, unit tests, and no side effects:

```ts
shouldRequestReview(save, newBest)        // rating prompt
shouldShowInterstitial(gate, newBest, t)  // ad frequency
shouldApplyOta({runningBuildId, …})       // update safety
breakVariant(completedWave)               // which break screen
shouldShowOnboarding(save)                // tutorial
```

The pattern: *gate is pure and tested; the caller wraps the side effect in
try/catch and is allowed to fail silently.* Grep-test: if a function talks to
a plugin AND makes a decision, split it.

## Fail-safe integration wrappers

Ads, IAP, OTA, ratings all follow the same skeleton:

```ts
let initialized = false;
export async function initX(): Promise<void> {
  if (!Capacitor.isNativePlatform() || initialized) return;
  initialized = true;
  try {
    const { Plugin } = await import('plugin'); // dynamic: web never loads it
    …
  } catch (e) { console.warn('x init failed:', e); } // never throws upward
}
```

- Native-only guard first; web is always a no-op.
- Dynamic `import()` keeps native SDKs out of the web bundle.
- **Isolate independent failure domains in separate try/catch.** The one real
  ads outage came from a consent-service error aborting ad preload because
  both lived in one try block. Consent failing must degrade to "ads without
  the form", never "no ads".
- Boot everything fire-and-forget from the root layout `onMount` — SDK
  slowness must never delay first paint.

## Save data

Versioned save with explicit migrations (`createSaveManager(key, {version,
migrations})`). Every new persisted field = version bump + migration that
derives a sensible value for veterans (e.g. `onboardingDone: gamesPlayed > 0`).
In-memory cache over storage; storage writes are best-effort try/catch (a
storage failure must not break the game). A `__resetSaveCacheForTests()`
export makes the cache testable. Note: if the test harness mocks localStorage
with black-hole stubs, assert persistence via the mock's call log, not
round-trips.

## Scenes

Scene manager with id → component map, fade transitions, context-provided
scene store (`getContext(Symbol.for('scene-store'))`). Scenes own their
transitions (Title's start button does `startGame() + goto('game')`).
Backdrops are components layered at `z-index: -1; pointer-events: none` inside
each scene — scenery must NEVER intercept input (a decorative figure once
stole taps from buttons; `pointer-events: none` on all scenery is now law).

## Shared-session ambience

For per-session random flavor that should stay coherent across scenes (time
of day, weather): roll once in `<script module>` scope, reuse on every mount.
First mount rolls, everyone else inherits, next app launch re-rolls. One
line of state, huge perceived-world payoff.

## Choreography state machines

Scene choreography (planes docking, bins on belts) = plain
`setTimeout`-chained state machines in the component, driving CSS
`transition`/`animation` values. Collect every timer in an array and clear
them all in `onMount`'s cleanup. Randomized dwell/spawn intervals =
`min + Math.random() * span`. No rAF, no tween lib needed for scenery.
