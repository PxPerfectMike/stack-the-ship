# Game Production Playbook

Method guides distilled from shipping **TSA: Terminal Security Agent**
(SvelteKit + Capacitor, solo dev + Claude, prototype → Google Play production).
Everything here is artistically agnostic — it captures *how* results were
achieved, not what the game looked like.

| Guide | Covers |
|---|---|
| [01-stack.md](01-stack.md) | Tech stack, project layout, conventions, tooling |
| [02-architecture.md](02-architecture.md) | Store/scene patterns, pure-gate logic, save migrations, fail-safe integrations |
| [03-animation.md](03-animation.md) | The diorama method: flat SVG scenes, CSS motion, JS sequencing, the traps |
| [04-qa-verification.md](04-qa-verification.md) | Dev QA params, browser-driving the game, screenshot pipelines, on-device debugging |
| [05-monetization-release.md](05-monetization-release.md) | Ads, IAP, ratings, signing, versioning, and every store-console gotcha hit |
| [06-ota-pipeline.md](06-ota-pipeline.md) | Self-hosted OTA web-bundle updates via CI |
| [07-store-assets.md](07-store-assets.md) | Deterministic demo videos, screenshots, feature graphics — all generated |

## The five meta-rules that made the project work

1. **Pure gates, thin glue.** Every behavioral decision (show an ad? apply an
   OTA? which break screen?) lives in a pure, unit-tested function. The
   SDK/plugin calls around it are thin, wrapped, and allowed to fail silently.
   Monetization and infra must never be able to break the game.
2. **Verify by driving the real thing.** Tests pass ≠ done. Every feature was
   driven in a real browser (and the money paths on a real phone) before it
   shipped. Screenshots were *looked at*, and the look found real bugs the
   tests never would (corner-clustered tablet rendering, letterboxed videos,
   swallowed wordmarks).
3. **Sequence the store bureaucracy early.** Ad units, consent messages,
   payment verification, store listings, and review pipelines all have
   multi-day warm-ups. The reason "ads never work on day one" is that these
   get done on day one. Do them weeks early; code was never the bottleneck.
4. **Ship every change immediately** (main = deploy = OTA release). Small
   reviewable increments, each visually approved, each committed with a
   message explaining *why*. The OTA pipeline made the title-screen rebuild a
   zero-store-release event.
5. **Determinism is a feature.** Seeded RNG for anything scripted (demo cast),
   URL params to force any visual state, negative animation delays to start
   mid-scene. If you can't reproduce a state on demand, you can't screenshot
   it, test it, or debug it.
