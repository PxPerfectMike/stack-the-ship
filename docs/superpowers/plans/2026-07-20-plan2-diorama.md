# Stack the Ship — Plan 2: Diorama, Art & Birds Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Plan 1's placeholder rendering with the real game: DWTD-grade flat-SVG harbor diorama, ship docking/departure choreography, real cargo art, the crane, and the reactive bird system.

**Architecture:** Presentation only — the Plan 1 logic layer is untouched except for two additive seams: an origin-offset pose API in the sim (so authored art rides physics bodies exactly) and a collision hook (so the world can react to impacts). All motion is CSS transform/opacity driven by JS-set targets (guide 03); every duration/easing lives in `src/lib/game/timing.ts`; palettes are CSS custom properties switched by namespaced state classes (`tod-*`, `wx-*`). Scenery never intercepts input.

**Tech Stack:** unchanged (SvelteKit 2, Svelte 5, matter-js). No new dependencies.

**Roadmap context:** Plan 2 of 4. Spec: `docs/superpowers/specs/2026-07-20-stack-the-ship-design.md` §1, §3, §7 plus the §2 docking bookends.

## Global Constraints

- Everything from Plan 1's Global Constraints (tabs/semicolons, pure `src/lib/game`, 0 check errors, commit style).
- **No inline durations/easings/delays anywhere** — every number imports from `timing.ts`.
- All motion is `transform`/`opacity` only. No rAF for scenery (rAF is only the physics loop).
- State classes are namespaced (`tod-night`, `wx-rain`) — never bare (`night`, `rain`) (guide 03 trap).
- All scenery layers: `pointer-events: none`.
- `prefers-reduced-motion`: every animated component must render a deliberate static tableau.
- Every visual lands only after the guide-04 screenshot loop AND human approval. Human gates all visuals.
- Silhouette-first: any cargo art must read at 48px; faces only on the pig (and nothing else, v1).

---

### Task 1: Timing constants, palettes, session ambience

**Files:**
- Create: `src/lib/game/timing.ts`, `src/lib/game/ambience.ts`, `src/lib/styles/tokens.css`
- Modify: `src/routes/+layout.svelte` (import tokens.css)
- Test: `tests/unit/game/ambience.test.ts`

**Interfaces:**
- Produces: `timing.ts` exporting named `*_MS` numbers and `EASE_*` cubic-bezier strings (starting set below; grows as tasks need — additions allowed, inline numbers are not).
- Produces: `Ambience { tod: 'day' | 'dusk' | 'night'; wx: 'clear' | 'rain' }`, `rollAmbience(rng: () => number): Ambience` (weighted: day 45%, dusk 30%, night 25%; rain 25%), `resolveAmbience(search: string, rng: () => number): Ambience` (URL `?tod=`/`?wx=` overrides win).
- Produces: `tokens.css` defining `--sky-top --sky-bottom --water --water-deep --silhouette --hull --hull-dark --ship-deck --crane --rope --ink --cloud --lamp` under `.tod-day`, `.tod-dusk`, `.tod-night` scopes.

- [ ] **Step 1: Failing tests** — `rollAmbience` determinism for a fixed rng; distribution sanity over 1000 seeded rolls (every tod occurs); `resolveAmbience('?tod=night&wx=rain', rng)` returns exactly that; partial override keeps the rolled other half.
- [ ] **Step 2: Implement** timing.ts starting set:

```ts
export const SHIP_ARRIVE_MS = 2600;
export const SHIP_DEPART_MS = 2200;
export const DEPART_BEAT_MS = 1100; // stillness between loss and the horn
export const CRANE_SWAY_MS = 2600;
export const CRANE_DROP_ANTICIPATION_MS = 140;
export const BOT_THINK_MS = 700;
export const BIRD_STARTLE_MIN_MS = 80;
export const BIRD_STARTLE_MAX_MS = 120;
export const BIRD_SCATTER_MS = 700;
export const BIRD_RETURN_MIN_MS = 1800;
export const BIRD_RETURN_SPAN_MS = 2600;
export const BIRD_HOP_MS = 220;
export const OVERLAY_IN_MS = 450;
export const EASE_ARRIVE = 'cubic-bezier(0.16, 1, 0.3, 1)';
export const EASE_DEPART = 'cubic-bezier(0.7, 0, 0.84, 0)';
export const EASE_POP = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
```

ambience.ts implementation + tokens.css palettes (day: warm cheerful blues/sand; dusk: apricot/slate; night: deep teal + lamps). GameScene reads ambience once per session via `<script module>` roll (guide 02) — wired in Task 4.
- [ ] **Step 3: Tests pass, check 0 errors, commit.**

### Task 2: Collision hook + typed event bus

**Files:**
- Create: `src/lib/game/events.ts`
- Modify: `src/lib/game/physics/sim.ts` (collision callback), `src/lib/scenes/GameScene.svelte` (bridge sim → bus)
- Test: `tests/unit/game/events.test.ts`, extend `tests/unit/game/physics/sim.test.ts`

**Interfaces:**
- Produces: `GameEvent = 'toss-launched' | 'impact' | 'settled' | 'spill' | 'ship-departing' | 'match-reset'`; `on(e: GameEvent, fn: (data?: unknown) => void): () => void` (returns unsubscribe), `emit(e: GameEvent, data?: unknown): void`.
- Produces: `onCollision(sim: Sim, cb: () => void): void` — fires on matter `collisionStart` involving any cargo body.

- [ ] **Step 1: Failing tests** — bus: on/emit/unsubscribe, multiple listeners, emit with no listeners is a no-op. Sim: spawn crate above deck, `onCollision` callback fires during `advance` before settle.
- [ ] **Step 2: Implement** (bus is a `Map<GameEvent, Set<fn>>`; sim uses `Events.on(engine, 'collisionStart', …)`).
- [ ] **Step 3: Scene bridge** — doToss emits `toss-launched`; first collision per toss emits `impact`; resolve emits `settled` or `spill`; departure emits `ship-departing`; newMatch emits `match-reset`.
- [ ] **Step 4: Tests pass, check, commit.**

### Task 3: Cargo art system (all 12 items) + debug outlines

**Files:**
- Create: `src/lib/components/game/CargoArt.svelte`
- Modify: `src/lib/game/physics/sim.ts` (origin-offset poses), `src/lib/scenes/GameScene.svelte` (render art at poses), `src/routes/catalog/+page.svelte` (render CargoArt)
- Test: extend `tests/unit/game/physics/sim.test.ts`

**Interfaces:**
- Produces: sim `bodyPoses(sim): { cargoId: string; x; y; angleDeg; ox; oy }[]` where `(ox, oy)` is the def-origin minus compound-centroid offset captured at spawn (0,0 for single-part bodies). Render contract: `<g transform="translate(x y) rotate(angleDeg) translate(ox oy)"><CargoArt id/></g>` puts authored def-space art exactly on the physics body.
- Produces: `CargoArt` — props `{ id: string }`, draws flat-SVG art in def-local coordinates within the def's `w×h` box, matching the physics silhouette closely enough that outlines feel honest.
- `?debug=1` overlays the world-vertex polygons (existing `bodyShapes`) at 35% opacity over the art.

**Acceptance criteria (screenshot-gated):** each item reads at 48px from silhouette; flat fills, minimal strokes; only the pig has a face (dot eyes + small mouth, anxious brows); palette-compatible colors; `/catalog` grid approved by the human; `?debug=1` shows art tracking bodies through a real toss including rotation.

- [ ] **Step 1: Failing test** — `bodyPoses` for a spawned bathtub: rendered def-origin (`pose + rotated offset`) equals the spawn point at angle 0; for crate `ox === 0 && oy === 0`.
- [ ] **Step 2: Implement poses** (capture offset at spawn), **CargoArt** for all 12 items, catalog + scene switchover.
- [ ] **Step 3: Screenshot loop** — catalog grid + mid-toss with `?debug=1`; fix until aligned; human approval; commit.

### Task 4: Harbor backdrop (sky, water, distant harbor, dock) + ambience wiring

**Files:**
- Create: `src/lib/components/game/Backdrop.svelte`
- Modify: `src/lib/scenes/GameScene.svelte` (compose; scene root classes `tod-* wx-*` from `resolveAmbience`; `<script module>` session roll)
- Modify: `docs/dev-qa-params.md` (`?tod= ?wx=`)

**Layer order (guide 03):** sky gradient → sun/moon + stars (night) → distant harbor silhouettes (cranes, warehouses, light dots at night) → open water band → rain layers (wx-rain: two SVG line layers, different speed/opacity, slight slant, seamless 50% loop) → foreground dock strip at the bottom edge with mooring posts.
**Acceptance criteria:** all three tods × clear/rain approved from screenshots; slow ambient loop present (drifting clouds day / shimmer band on water / blinking harbor lamp at night, `steps(1)` blink); reduced-motion shows a static tableau; zero pointer events.

- [ ] **Step 1: Implement backdrop layers + state-class CSS theming.**
- [ ] **Step 2: Wire ambience** — module-scope roll, URL overrides, root classes.
- [ ] **Step 3: Screenshot matrix (6 shots), fix, human approval, commit.**

### Task 5: The ship + docking/departure choreography

**Files:**
- Create: `src/lib/components/game/Ship.svelte`, `src/lib/game/shipNames.ts`
- Modify: `src/lib/scenes/GameScene.svelte`
- Test: `tests/unit/game/shipNames.test.ts`

**Interfaces:**
- Produces: `shipName(seed: string): string` — seeded pick from ≥10 deadpan names (*MV Barely Adequate*, *SS Probably Fine*, *MV Second Thoughts*, *SS Sink Later*, *MV Deadweight*, …). Deterministic per match seed.
- Ship geometry contract: hull top edge exactly at `WORLD.deckY`, rails exactly at the physics lips (`WORLD.lipW/lipH` at `deckLeft`/`deckRight`), hull extends past both frame edges (guide 03: crop sells scale), name plate on the bow, low wheelhouse outside the play zone.
- Choreography: scene-level `dockPhase: 'arriving' | 'docked' | 'departing'`. One `<g class="vessel">` wraps ship AND the cargo layer; CSS transform `translateX(-110%) → 0` over `SHIP_ARRIVE_MS`/`EASE_ARRIVE` on match start, `0 → +110%` over `SHIP_DEPART_MS`/`EASE_DEPART` on departure — the stack leaves WITH the ship. Input and bot are gated on `dockPhase === 'docked'`. Sequence on game over: splash → `DEPART_BEAT_MS` stillness → `ship-departing` → overlay after the ship clears frame. `?phase=docked` QA param skips arrival.

- [ ] **Step 1: Failing test** — shipName determinism + spread (10 seeds → >3 distinct names).
- [ ] **Step 2: Implement ship art + vessel group + phase state machine (timers collected & cleaned, guide 02).**
- [ ] **Step 3: Drive full match: arrival, play, spill, beat, departure-with-stack, overlay. Screenshots of each phase (`?phase=` params). Human approval, commit.**

### Task 6: The crane + hanging sway + release anticipation

**Files:**
- Create: `src/lib/components/game/Crane.svelte`
- Modify: `src/lib/scenes/GameScene.svelte` (hanging cargo renders under the hook; doToss gets anticipation)

Dockside tower crane on the left, arm reaching over the deck to `CRANE_POINT`; cable + hook; hanging cargo sways gently (`CRANE_SWAY_MS` loop, transform rotate around hook). On release: `CRANE_DROP_ANTICIPATION_MS` cable dip (EASE_POP) then the body spawns — anticipation before action. Aiming drag visually tilts the hanging item toward the drag vector. Reduced-motion: no sway.
**Acceptance criteria:** crane silhouette reads instantly; sway is subtle (≤4°); release feels snappy, not laggy (anticipation ≤150ms); arc preview restyled to match ink token. Screenshots + human approval.

- [ ] **Step 1: Implement, screenshot loop, approval, commit.**

### Task 7: Birds (the personality engine)

**Files:**
- Create: `src/lib/components/game/Birds.svelte`, `src/lib/game/perch.ts`
- Modify: `src/lib/scenes/GameScene.svelte` (compose; pass rest state)
- Test: `tests/unit/game/perch.test.ts`

**Interfaces:**
- Produces: `perchPoints(rest: RestBody[]): { x: number; y: number; kind: 'cargo' | 'rail' | 'post' | 'crane' }[]` — cargo tops (`body.y − def.h/2`, weighted toward the newest/highest item by ordering), both rail lips, dock posts, crane arm tip. Pure, tested: cargo perch y sits above the body; empty deck still offers rail/post/crane perches.
- Birds component: 4 gulls, DWTD-flat (oval body, round head, dot eye, tiny beak triangle, two-state wings). Each bird is a `setTimeout` state machine (guide 02): perched → occasional idle hop/head-turn → reacts to bus events:
  - `toss-launched` → scatter upward off-screen (`BIRD_SCATTER_MS`, staggered)
  - `impact` → perched birds startle-hop (`BIRD_HOP_MS`) after `BIRD_STARTLE_MIN..MAX_MS`; heads track the flying item while airborne
  - `settled` → return one at a time (`BIRD_RETURN_MIN_MS + i * spread`), the brave one (bird 0) always first, landing on fresh perch points
  - `spill`/`ship-departing` → full panic scatter; two return during the game-over overlay and stare at the player
  - `match-reset` → fresh flock
- All timers collected and cleared on unmount; `pointer-events: none`; reduced-motion = statically perched, no reactions.

- [ ] **Step 1: Failing perch tests, implement `perch.ts`, pass.**
- [ ] **Step 2: Implement Birds; verify reactions by driving tosses in the browser; tune `BIRD_*` constants until reactions feel alive (screenshot + short observation loop).**
- [ ] **Step 3: Human approval, commit.**

### Task 8: Presentation polish + reduced-motion pass + full matrix approval

**Files:**
- Modify: `src/lib/scenes/GameScene.svelte` (game-over overlay restyle: cheerful card, `OVERLAY_IN_MS` pop via `EASE_POP`, deadpan result copy, turn indicator restyle, splash effect ring at waterline on spill)
- Modify: any component failing the checks below

- [ ] **Step 1: Overlay + HUD restyle** (DWTD-cheerful against the disaster; copy like "Overboard. The sea has your piano now.").
- [ ] **Step 2: Reduced-motion audit** — emulate `prefers-reduced-motion` in the browser; every scene state renders a deliberate freeze-frame.
- [ ] **Step 3: Full screenshot matrix** — {day, dusk, night} × {clear, rain} × {arriving, mid-match with 5+ stack, game-over} at 540×960, plus 800×1280 tablet sanity shot (guide 03 fixed-pixel trap check). Look at every image.
- [ ] **Step 4: Tap-safety + overlap audit** (guide 04): `elementFromPoint` over the aim zone and rematch button — scenery must never win.
- [ ] **Step 5: Fix → reshoot loop, human approval of the matrix, full suite + check, commit.**

---

## Self-Review (performed at write time)

- **Spec coverage:** §1 art direction (Tasks 3–8 + constraints), §3 birds fully (Task 7 incl. brave-bird, head-tracking, reduced-motion), §7 personality (Task 4 ambience/loops/rare-ish blink, Task 5 deadpan names, Task 8 copy), §2 docking bookends (Task 5). Deferred: whale/aurora rare events and one-bird-steals-item gag (post-Plan 2 polish, noted), sfx (Plan 4), demo route (Plan 4).
- **Placeholder scan:** art steps carry acceptance criteria + geometry contracts instead of full SVG source (art is authored in the screenshot loop by design); all logic steps specify real interfaces and test intent.
- **Type consistency:** `bodyPoses` offset contract matches Task 3 render usage; `perchPoints` consumes `RestBody` from Plan 1; bus event names identical across Tasks 2/5/7.
