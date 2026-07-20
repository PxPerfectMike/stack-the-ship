# 01 — Stack & Project Setup

## Core stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | SvelteKit 2 + Svelte 5 (runes) + TypeScript | `adapter-static`, SPA fallback `index.html`, prerender only pages that need real files (see OTA/pages notes) |
| Game engine | In-house `$engine` alias (`src/lib/engine`) | Scene manager, game store factory, save manager w/ versioned migrations, tween/timeline, sfx, haptics, viewport/GameContainer |
| Native shell | Capacitor 6 | One codebase; web deploy + Android AAB from the same build |
| Tests | Vitest + jsdom, `tests/**` | Global localStorage/AudioContext/vibrate mocks in `tests/setup.ts` |
| Browser QA | Playwright (also a devDependency for scripted recording) | Drive the real app; see guide 04 |
| CI/CD | GitHub Actions → GitHub Pages (web + OTA artifacts) | Push to main = deploy; see guide 06 |

Capacitor plugins that earned their place: `@capacitor-community/admob`,
`@capacitor-community/in-app-review`, `cordova-plugin-purchase` (Play
Billing), `@capgo/capacitor-updater` (OTA), `@capacitor/app`, haptics,
splash-screen, status-bar. Match plugin major to Capacitor major.

## Project layout that worked

```
src/lib/engine/          # generic engine — no game knowledge
src/lib/game/            # pure game logic: store, rules, generation, save,
                         #   difficulty, ads, iap, ota, rating, breaks…
src/lib/components/game/ # visual components incl. scene "vignettes"
src/lib/scenes/          # Title / Game / Memo / GameOver scene components
src/routes/              # thin: '/', plus dev-only QA routes (/items, /demo)
tests/unit/…             # mirrors src/lib/game
scripts/                 # node tooling (record-demo, audits)
docs/                    # store-listing draft, specs
store-assets/            # generated release assets (never hand-made)
android/                 # Capacitor shell; keystore.properties GITIGNORED
```

**The load-bearing boundary:** `src/lib/game/*.ts` modules are pure TS with no
DOM/Svelte imports wherever possible. That's what makes the test suite fast,
the logic testable, and the browser-driving tricks (guide 04) possible.

## Conventions

- Tabs, semicolons, camelCase; Svelte 5 runes (`$state`, `$derived`, `$props`).
- Canvas code cannot read CSS custom properties → mirror needed design tokens
  into a TS constants file with a loud "IF tokens.css CHANGES, UPDATE THIS".
- Dev-only routes are fine to ship (`/items` catalog QA, `/demo` autoplayer):
  comment them as temporary, they cost nothing and keep QA one URL away.
- Commit style: `feat:`/`fix:`/`chore:` + a body that explains *why*. The
  repo's history is the project's memory.

## Workflow loop (per feature)

1. TDD the pure logic (`vitest` watch on the new module).
2. Build the component/glue.
3. `npm run check` (svelte-check) — keep at 0 errors always.
4. Drive it in the browser, screenshot, **look at the screenshot**.
5. Get the human's visual approval (they gate all visuals).
6. Commit → push main → auto-deploy/OTA.

Full suite + check before every ship. The suite ended at ~700 tests and ran
in ~15s; there is no excuse to skip it.
