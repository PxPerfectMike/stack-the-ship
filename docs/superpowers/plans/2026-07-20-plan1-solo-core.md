# Stack the Ship — Plan 1: Solo Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A playable solo Stack the Ship duel in the browser — human vs Dockmaster bot, real Matter.js physics, sudden-death rule, deterministic deals — with placeholder flat-SVG rendering.

**Architecture:** SvelteKit 2 + Svelte 5 SPA (adapter-static). Pure game logic in `src/lib/game/` (no DOM imports); Matter.js isolated in `src/lib/game/physics/sim.ts`; one session store with module-level actions (playbook guide 02); the scene component owns the sim instance and drives rAF. Art, birds, ship choreography, multiplayer, and native shell are Plans 2–4 — this plan's visuals are deliberately placeholder shapes on the final coordinate system.

**Tech Stack:** SvelteKit 2, Svelte 5 (runes), TypeScript, matter-js + @types/matter-js, Vitest.

**Roadmap context:** Plan 1 of 4. Plan 2 = diorama art/animation/birds. Plan 3 = PartyKit async multiplayer. Plan 4 = Capacitor shell, monetization, release. Spec: `docs/superpowers/specs/2026-07-20-stack-the-ship-design.md`.

## Global Constraints

- Tabs for indentation, semicolons, camelCase; Svelte 5 runes (`$state`, `$derived`, `$props`).
- `src/lib/game/**` must have **no DOM/Svelte imports** (physics sim may import matter-js only).
- All tunable numbers are named exported constants — no inline magic numbers in components.
- Logical game space is portrait **540×960**; waterline y=880; deck surface y=760; deck spans x=40..500; crane release point (270,140).
- `npm run check` must report 0 errors before every commit; full `npm test` before every commit.
- Commit style: `feat:`/`fix:`/`chore:` + body explaining *why*.
- Scenery never intercepts input (`pointer-events: none`) — applies to every visual added.

---

### Task 1: Project scaffold

**Files:**
- Create: SvelteKit skeleton at repo root (via `sv create` in a temp dir, then moved), `vitest.config.ts`, `tests/unit/smoke.test.ts`, `.editorconfig`
- Modify: `svelte.config.js` (adapter-static, `$engine` alias), `package.json` (test script)
- Create: `src/routes/+layout.ts` (SPA mode)

**Interfaces:**
- Produces: working `npm test`, `npm run check`, `npm run dev`; alias `$engine` → `src/lib/engine`.

- [ ] **Step 1: Scaffold into temp dir and merge to root** (repo root is non-empty, `sv create` needs an empty target)

```powershell
npx sv create scaffold-tmp --template minimal --types ts --no-add-ons --no-install
Get-ChildItem -Force scaffold-tmp | Move-Item -Destination C:\repos\stack_the_ship
Remove-Item scaffold-tmp
npm install
npm install -D @sveltejs/adapter-static vitest matter-js @types/matter-js
```

(If `sv create` flag names differ, accept interactive defaults: minimal template, TypeScript, no add-ons.)

- [ ] **Step 2: Configure adapter-static, SPA fallback, `$engine` alias**

`svelte.config.js`:
```js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({ fallback: 'index.html' }),
		alias: { $engine: 'src/lib/engine' }
	}
};

export default config;
```

`src/routes/+layout.ts`:
```ts
export const ssr = false;
export const prerender = false;
```

- [ ] **Step 3: Vitest config + smoke test**

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		include: ['tests/**/*.test.ts']
	},
	resolve: {
		alias: {
			$engine: new URL('./src/lib/engine', import.meta.url).pathname,
			$lib: new URL('./src/lib', import.meta.url).pathname
		}
	}
});
```

`tests/unit/smoke.test.ts`:
```ts
import { describe, expect, it } from 'vitest';

describe('toolchain', () => {
	it('runs tests', () => {
		expect(1 + 1).toBe(2);
	});
});
```

Add to `package.json` scripts: `"test": "vitest run"`.

`.editorconfig`:
```ini
root = true
[*]
indent_style = tab
```

- [ ] **Step 4: Verify**

Run: `npm test` → smoke test PASS. Run: `npm run check` → 0 errors. Run: `npm run dev` briefly → welcome page serves.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: scaffold SvelteKit SPA with vitest and adapter-static

Static SPA per playbook guide 01; \$engine alias reserved for the
generic engine layer; node-env vitest because all unit-tested logic
is pure TS."
```

---

### Task 2: Seeded RNG (`$engine`)

**Files:**
- Create: `src/lib/engine/rng.ts`
- Test: `tests/unit/engine/rng.test.ts`

**Interfaces:**
- Produces: `hashString(s: string): number` (uint32), `mulberry32(seed: number): () => number` (returns floats in [0,1)).

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from 'vitest';
import { hashString, mulberry32 } from '$engine/rng';

describe('hashString', () => {
	it('is deterministic and input-sensitive', () => {
		expect(hashString('abc')).toBe(hashString('abc'));
		expect(hashString('abc')).not.toBe(hashString('abd'));
		expect(Number.isInteger(hashString('x'))).toBe(true);
	});
});

describe('mulberry32', () => {
	it('same seed gives identical sequences', () => {
		const a = mulberry32(42);
		const b = mulberry32(42);
		expect([a(), a(), a()]).toEqual([b(), b(), b()]);
	});
	it('stays in [0,1) over many samples', () => {
		const r = mulberry32(7);
		for (let i = 0; i < 1000; i++) {
			const v = r();
			expect(v).toBeGreaterThanOrEqual(0);
			expect(v).toBeLessThan(1);
		}
	});
});
```

- [ ] **Step 2: Run to verify failure** — `npm test` → FAIL (module not found).

- [ ] **Step 3: Implement**

```ts
export function hashString(s: string): number {
	let h = 1779033703 ^ s.length;
	for (let i = 0; i < s.length; i++) {
		h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
		h = (h << 13) | (h >>> 19);
	}
	return h >>> 0;
}

export function mulberry32(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
```

- [ ] **Step 4: Run to verify pass** — `npm test` → PASS.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: seeded RNG primitives (mulberry32 + string hash)"`

---

### Task 3: Cargo catalog + bounds validator

**Files:**
- Create: `src/lib/game/cargo.ts`
- Test: `tests/unit/game/cargo.test.ts`

**Interfaces:**
- Produces: `CargoPart` (`{ kind: 'rect'; x; y; w; h } | { kind: 'circle'; x; y; r }`, local coords, part centers relative to cargo center), `CargoDef` (`{ id; name; w; h; density; restitution; friction; parts: CargoPart[] }`), `CARGO: CargoDef[]` (12 items), `ALL_IDS: string[]`, `getCargo(id: string): CargoDef` (throws on unknown id).

- [ ] **Step 1: Write failing tests** (the validator-as-test pattern from guide 04)

```ts
import { describe, expect, it } from 'vitest';
import { ALL_IDS, CARGO, getCargo } from '$lib/game/cargo';

describe('cargo catalog', () => {
	it('has 12 unique items', () => {
		expect(CARGO.length).toBe(12);
		expect(new Set(ALL_IDS).size).toBe(12);
	});
	it('every part stays inside its declared bounding box', () => {
		for (const def of CARGO) {
			for (const p of def.parts) {
				if (p.kind === 'rect') {
					expect(Math.abs(p.x) + p.w / 2).toBeLessThanOrEqual(def.w / 2 + 0.001);
					expect(Math.abs(p.y) + p.h / 2).toBeLessThanOrEqual(def.h / 2 + 0.001);
				} else {
					expect(Math.abs(p.x) + p.r).toBeLessThanOrEqual(def.w / 2 + 0.001);
					expect(Math.abs(p.y) + p.r).toBeLessThanOrEqual(def.h / 2 + 0.001);
				}
			}
		}
	});
	it('getCargo throws on unknown id', () => {
		expect(() => getCargo('nope')).toThrow();
	});
});
```

- [ ] **Step 2: Run to verify failure** — `npm test` → FAIL.

- [ ] **Step 3: Implement the catalog**

```ts
export type CargoPart =
	| { kind: 'rect'; x: number; y: number; w: number; h: number }
	| { kind: 'circle'; x: number; y: number; r: number };

export interface CargoDef {
	id: string;
	name: string;
	w: number;
	h: number;
	density: number;
	restitution: number;
	friction: number;
	parts: CargoPart[];
}

const rect = (x: number, y: number, w: number, h: number): CargoPart => ({ kind: 'rect', x, y, w, h });

export const CARGO: CargoDef[] = [
	{ id: 'crate', name: 'Crate', w: 60, h: 60, density: 0.001, restitution: 0.05, friction: 0.6, parts: [rect(0, 0, 60, 60)] },
	{ id: 'barrel', name: 'Barrel', w: 50, h: 66, density: 0.0012, restitution: 0.1, friction: 0.45, parts: [rect(0, 0, 50, 66)] },
	{ id: 'tire', name: 'Tire', w: 56, h: 56, density: 0.0008, restitution: 0.5, friction: 0.8, parts: [{ kind: 'circle', x: 0, y: 0, r: 28 }] },
	{ id: 'plank', name: 'Long Plank', w: 160, h: 18, density: 0.0009, restitution: 0.05, friction: 0.6, parts: [rect(0, 0, 160, 18)] },
	{ id: 'piano', name: 'Grand Piano', w: 120, h: 90, density: 0.003, restitution: 0.05, friction: 0.55, parts: [rect(0, -15, 120, 60), rect(-50, 30, 12, 30), rect(50, 30, 12, 30)] },
	{ id: 'moai', name: 'Moai Head', w: 70, h: 100, density: 0.004, restitution: 0.02, friction: 0.7, parts: [rect(0, 10, 70, 80), rect(0, -40, 50, 20)] },
	{ id: 'bathtub', name: 'Bathtub', w: 110, h: 50, density: 0.0015, restitution: 0.08, friction: 0.5, parts: [rect(0, 17, 110, 16), rect(-49, -5, 12, 40), rect(49, -5, 12, 40)] },
	{ id: 'wardrobe', name: 'Wardrobe', w: 70, h: 130, density: 0.0011, restitution: 0.05, friction: 0.6, parts: [rect(0, 0, 70, 130)] },
	{ id: 'anchor', name: 'Anchor', w: 80, h: 90, density: 0.01, restitution: 0.01, friction: 0.9, parts: [rect(0, -25, 16, 40), rect(0, 25, 80, 24)] },
	{ id: 'beachball', name: 'Beach Ball', w: 52, h: 52, density: 0.0002, restitution: 0.8, friction: 0.2, parts: [{ kind: 'circle', x: 0, y: 0, r: 26 }] },
	{ id: 'pig', name: 'Anxious Pig', w: 84, h: 60, density: 0.001, restitution: 0.15, friction: 0.7, parts: [rect(-8, 4, 64, 44), rect(30, -8, 24, 26)] },
	{ id: 'sink', name: 'Kitchen Sink', w: 76, h: 46, density: 0.0014, restitution: 0.05, friction: 0.5, parts: [rect(0, 12, 76, 20), rect(-30, -10, 14, 26), rect(30, -10, 14, 26)] }
];

export const ALL_IDS: string[] = CARGO.map((c) => c.id);

export function getCargo(id: string): CargoDef {
	const def = CARGO.find((c) => c.id === id);
	if (!def) throw new Error(`unknown cargo id: ${id}`);
	return def;
}
```

- [ ] **Step 4: Run to verify pass** — `npm test` → PASS.
- [ ] **Step 5: Commit** — `git commit -m "feat: absurd-manifest cargo catalog with bounds validator test"`

---

### Task 4: World rules + deterministic deal order

**Files:**
- Create: `src/lib/game/rules.ts`, `src/lib/game/deal.ts`
- Test: `tests/unit/game/rules.test.ts`, `tests/unit/game/deal.test.ts`

**Interfaces:**
- Produces: `WORLD` const (`{ width: 540, height: 960, waterlineY: 880, deckY: 760, deckLeft: 40, deckRight: 500 }`), `RestBody` (`{ cargoId: string; x: number; y: number; angle: number }`), `isOverboard(rest: RestBody[]): boolean`, `dealCargo(seed: string, turn: number, pool?: readonly string[]): string`, `GENTLE_POOL: readonly string[]`.

- [ ] **Step 1: Write failing tests**

`tests/unit/game/rules.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { WORLD, isOverboard } from '$lib/game/rules';

describe('isOverboard', () => {
	it('is false for bodies resting on deck', () => {
		expect(isOverboard([{ cargoId: 'crate', x: 270, y: WORLD.deckY - 30, angle: 0 }])).toBe(false);
	});
	it('is true when any body is below the waterline', () => {
		expect(isOverboard([
			{ cargoId: 'crate', x: 270, y: 700, angle: 0 },
			{ cargoId: 'pig', x: 520, y: WORLD.waterlineY + 5, angle: 1 }
		])).toBe(true);
	});
	it('is false for an empty deck', () => {
		expect(isOverboard([])).toBe(false);
	});
});
```

`tests/unit/game/deal.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { ALL_IDS } from '$lib/game/cargo';
import { GENTLE_POOL, dealCargo } from '$lib/game/deal';

describe('dealCargo', () => {
	it('is deterministic for the same seed+turn', () => {
		expect(dealCargo('m1', 5)).toBe(dealCargo('m1', 5));
	});
	it('differs across seeds (sampled)', () => {
		const a = [0, 1, 2, 3, 4].map((t) => dealCargo('seedA', t)).join(',');
		const b = [0, 1, 2, 3, 4].map((t) => dealCargo('seedB', t)).join(',');
		expect(a).not.toBe(b);
	});
	it('never deals the same item twice in a row', () => {
		for (let t = 1; t < 60; t++) {
			expect(dealCargo('m2', t)).not.toBe(dealCargo('m2', t - 1));
		}
	});
	it('only deals from the given pool', () => {
		for (let t = 0; t < 30; t++) {
			expect(GENTLE_POOL).toContain(dealCargo('m3', t, GENTLE_POOL));
		}
	});
	it('deals valid ids from the full catalog by default', () => {
		for (let t = 0; t < 30; t++) {
			expect(ALL_IDS).toContain(dealCargo('m4', t));
		}
	});
});
```

- [ ] **Step 2: Run to verify failure** — `npm test` → FAIL.

- [ ] **Step 3: Implement**

`src/lib/game/rules.ts`:
```ts
export const WORLD = {
	width: 540,
	height: 960,
	waterlineY: 880,
	deckY: 760,
	deckLeft: 40,
	deckRight: 500
} as const;

export interface RestBody {
	cargoId: string;
	x: number;
	y: number;
	angle: number;
}

export function isOverboard(rest: RestBody[]): boolean {
	return rest.some((b) => b.y > WORLD.waterlineY);
}
```

`src/lib/game/deal.ts`:
```ts
import { hashString, mulberry32 } from '$engine/rng';
import { ALL_IDS } from './cargo';

export const GENTLE_POOL: readonly string[] = ['crate', 'barrel', 'tire', 'plank'];

function rawIndex(seed: string, turn: number, len: number): number {
	return Math.floor(mulberry32(hashString(`${seed}:${turn}`))() * len);
}

// No-consecutive-repeat rule: walk from turn 0 so every turn's pick is
// self-consistent no matter which turn you query first.
export function dealCargo(seed: string, turn: number, pool: readonly string[] = ALL_IDS): string {
	let prev = -1;
	let idx = 0;
	for (let t = 0; t <= turn; t++) {
		idx = rawIndex(seed, t, pool.length);
		if (idx === prev) idx = (idx + 1) % pool.length;
		prev = idx;
	}
	return pool[idx];
}
```

- [ ] **Step 4: Run to verify pass** — `npm test` → PASS.
- [ ] **Step 5: Commit** — `git commit -m "feat: world constants, overboard rule, deterministic deal order"`

---

### Task 5: Physics sim wrapper (Matter.js, isolated)

**Files:**
- Create: `src/lib/game/physics/sim.ts`
- Test: `tests/unit/game/physics/sim.test.ts`

**Interfaces:**
- Consumes: `getCargo` (Task 3), `WORLD`, `RestBody` (Task 4).
- Produces: constants `SETTLE_SPEED = 0.15`, `SETTLE_ANGULAR = 0.05`, `SETTLE_FRAMES = 45`, `MAX_FRAMES = 720`, `FRAME_MS = 1000/60`, `RECORD_EVERY = 3`; types `Sim`, `TrajectoryFrame { t: number; bodies: { x; y; angle }[] }`, `RunState { frames; calm; trajectory: TrajectoryFrame[]; done: boolean }`; functions `createSim(): Sim`, `spawnCargo(sim, cargoId, x, y): Body`, `applyToss(body, { vx, vy }): void`, `step(sim): void`, `newRunState(): RunState`, `advance(sim, rs, steps?): void` (mutates rs, sets `done` on settle or frame cap), `restState(sim): RestBody[]`, `rebuildFromRest(sim, rest): void`.

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from 'vitest';
import { WORLD, isOverboard } from '$lib/game/rules';
import {
	MAX_FRAMES, advance, applyToss, createSim, newRunState,
	rebuildFromRest, restState, spawnCargo
} from '$lib/game/physics/sim';

function runToRest(sim: ReturnType<typeof createSim>) {
	const rs = newRunState();
	advance(sim, rs, MAX_FRAMES);
	return rs;
}

describe('sim', () => {
	it('a dropped crate settles on the deck, not overboard', () => {
		const sim = createSim();
		spawnCargo(sim, 'crate', 270, 200);
		const rs = runToRest(sim);
		expect(rs.done).toBe(true);
		const rest = restState(sim);
		expect(rest[0].y).toBeLessThan(WORLD.deckY);
		expect(isOverboard(rest)).toBe(false);
	});
	it('a crate tossed hard sideways goes overboard', () => {
		const sim = createSim();
		const body = spawnCargo(sim, 'crate', 270, 200);
		applyToss(body, { vx: 18, vy: 0 });
		runToRest(sim);
		expect(isOverboard(restState(sim))).toBe(true);
	});
	it('never exceeds the frame cap even for a bouncy ball', () => {
		const sim = createSim();
		spawnCargo(sim, 'beachball', 270, 160);
		const rs = runToRest(sim);
		expect(rs.frames).toBeLessThanOrEqual(MAX_FRAMES);
		expect(rs.done).toBe(true);
	});
	it('records a monotonic trajectory including every body', () => {
		const sim = createSim();
		spawnCargo(sim, 'crate', 200, 500);
		spawnCargo(sim, 'barrel', 340, 200);
		const rs = runToRest(sim);
		expect(rs.trajectory.length).toBeGreaterThan(3);
		for (let i = 1; i < rs.trajectory.length; i++) {
			expect(rs.trajectory[i].t).toBeGreaterThan(rs.trajectory[i - 1].t);
			expect(rs.trajectory[i].bodies.length).toBe(2);
		}
	});
	it('rebuildFromRest reproduces a stable stack', () => {
		const sim = createSim();
		spawnCargo(sim, 'crate', 270, 400);
		runToRest(sim);
		const rest = restState(sim);
		const sim2 = createSim();
		rebuildFromRest(sim2, rest);
		const rs2 = runToRest(sim2);
		expect(isOverboard(restState(sim2))).toBe(false);
		expect(restState(sim2)[0].x).toBeCloseTo(rest[0].x, 0);
	});
});
```

- [ ] **Step 2: Run to verify failure** — `npm test` → FAIL.

- [ ] **Step 3: Implement**

```ts
import { Bodies, Body, Composite, Engine } from 'matter-js';
import { getCargo } from '../cargo';
import { WORLD, type RestBody } from '../rules';

export const SETTLE_SPEED = 0.15;
export const SETTLE_ANGULAR = 0.05;
export const SETTLE_FRAMES = 45;
export const MAX_FRAMES = 720; // 12s hard cap — a rocking pig can never hang the game
export const FRAME_MS = 1000 / 60;
export const RECORD_EVERY = 3; // ≈20Hz trajectory samples

export interface Sim {
	engine: Engine;
	cargo: { body: Body; cargoId: string }[];
}

export interface TrajectoryFrame {
	t: number;
	bodies: { x: number; y: number; angle: number }[];
}

export interface RunState {
	frames: number;
	calm: number;
	trajectory: TrajectoryFrame[];
	done: boolean;
}

export function createSim(): Sim {
	const engine = Engine.create();
	const deck = Bodies.rectangle(
		(WORLD.deckLeft + WORLD.deckRight) / 2,
		WORLD.deckY + 20,
		WORLD.deckRight - WORLD.deckLeft,
		40,
		{ isStatic: true, label: 'deck' }
	);
	Composite.add(engine.world, deck);
	return { engine, cargo: [] };
}

export function spawnCargo(sim: Sim, cargoId: string, x: number, y: number): Body {
	const def = getCargo(cargoId);
	const opts = { density: def.density, restitution: def.restitution, friction: def.friction };
	const parts = def.parts.map((p) =>
		p.kind === 'circle'
			? Bodies.circle(x + p.x, y + p.y, p.r, opts)
			: Bodies.rectangle(x + p.x, y + p.y, p.w, p.h, opts)
	);
	const body = parts.length === 1 ? parts[0] : Body.create({ parts, ...opts });
	Composite.add(sim.engine.world, body);
	sim.cargo.push({ body, cargoId });
	return body;
}

export function applyToss(body: Body, input: { vx: number; vy: number }): void {
	Body.setVelocity(body, { x: input.vx, y: input.vy });
}

export function step(sim: Sim): void {
	Engine.update(sim.engine, FRAME_MS);
}

function isSettledFrame(sim: Sim): boolean {
	return sim.cargo.every(
		({ body }) => body.speed < SETTLE_SPEED && body.angularSpeed < SETTLE_ANGULAR
	);
}

export function newRunState(): RunState {
	return { frames: 0, calm: 0, trajectory: [], done: false };
}

export function advance(sim: Sim, rs: RunState, steps = 1): void {
	for (let i = 0; i < steps && !rs.done; i++) {
		step(sim);
		if (rs.frames % RECORD_EVERY === 0) {
			rs.trajectory.push({
				t: rs.frames * FRAME_MS,
				bodies: sim.cargo.map(({ body }) => ({
					x: body.position.x,
					y: body.position.y,
					angle: body.angle
				}))
			});
		}
		rs.frames++;
		rs.calm = isSettledFrame(sim) ? rs.calm + 1 : 0;
		if (rs.calm >= SETTLE_FRAMES || rs.frames >= MAX_FRAMES) rs.done = true;
	}
}

export function restState(sim: Sim): RestBody[] {
	return sim.cargo.map(({ body, cargoId }) => ({
		cargoId,
		x: body.position.x,
		y: body.position.y,
		angle: body.angle
	}));
}

export function rebuildFromRest(sim: Sim, rest: RestBody[]): void {
	for (const r of rest) {
		const body = spawnCargo(sim, r.cargoId, r.x, r.y);
		Body.setAngle(body, r.angle);
	}
}
```

- [ ] **Step 4: Run to verify pass** — `npm test` → PASS. If the crate-settles test is marginal, tune `SETTLE_SPEED`/`SETTLE_FRAMES` here and nowhere else.
- [ ] **Step 5: Commit** — `git commit -m "feat: matter-js sim wrapper with settle detection and trajectory recording"`

---

### Task 6: Aim math

**Files:**
- Create: `src/lib/game/aim.ts`
- Test: `tests/unit/game/aim.test.ts`

**Interfaces:**
- Produces: `TossInput { vx: number; vy: number }`, `CRANE_POINT = { x: 270, y: 140 }`, `MAX_DRAG = 220`, `VELOCITY_SCALE = 0.09`, `PREVIEW_GRAVITY = 0.35`, `dragToVelocity(dx: number, dy: number): TossInput` (slingshot: drag down-left → launch up-right, magnitude clamped), `arcPreview(input: TossInput, steps?: number): { x: number; y: number }[]` (approximate dotted-arc points from `CRANE_POINT`).

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from 'vitest';
import { CRANE_POINT, MAX_DRAG, VELOCITY_SCALE, arcPreview, dragToVelocity } from '$lib/game/aim';

describe('dragToVelocity', () => {
	it('inverts the drag direction (slingshot)', () => {
		const v = dragToVelocity(-50, 80);
		expect(v.vx).toBeGreaterThan(0);
		expect(v.vy).toBeLessThan(0);
	});
	it('clamps drag magnitude to MAX_DRAG', () => {
		const max = dragToVelocity(0, MAX_DRAG);
		const over = dragToVelocity(0, MAX_DRAG * 3);
		expect(over.vy).toBeCloseTo(max.vy, 5);
		expect(Math.abs(max.vy)).toBeCloseTo(MAX_DRAG * VELOCITY_SCALE, 5);
	});
});

describe('arcPreview', () => {
	it('starts at the crane point and curves downward over time', () => {
		const pts = arcPreview({ vx: 4, vy: -6 }, 12);
		expect(pts[0].x).toBeCloseTo(CRANE_POINT.x, 1);
		expect(pts[0].y).toBeCloseTo(CRANE_POINT.y, 1);
		expect(pts.at(-1)!.y).toBeGreaterThan(pts[Math.floor(pts.length / 2)].y);
		expect(pts.length).toBe(12);
	});
});
```

- [ ] **Step 2: Run to verify failure** — `npm test` → FAIL.

- [ ] **Step 3: Implement**

```ts
export interface TossInput {
	vx: number;
	vy: number;
}

export const CRANE_POINT = { x: 270, y: 140 } as const;
export const MAX_DRAG = 220;
export const VELOCITY_SCALE = 0.09;
export const PREVIEW_GRAVITY = 0.35; // tuned to visually match matter gravity; hint only

export function dragToVelocity(dx: number, dy: number): TossInput {
	const len = Math.hypot(dx, dy);
	const clamp = len > MAX_DRAG ? MAX_DRAG / len : 1;
	return { vx: -dx * clamp * VELOCITY_SCALE, vy: -dy * clamp * VELOCITY_SCALE };
}

export function arcPreview(input: TossInput, steps = 14): { x: number; y: number }[] {
	const pts: { x: number; y: number }[] = [];
	let { x, y } = CRANE_POINT;
	let vy = input.vy;
	for (let i = 0; i < steps; i++) {
		pts.push({ x, y });
		x += input.vx * 4;
		y += vy * 4;
		vy += PREVIEW_GRAVITY;
	}
	return pts;
}
```

- [ ] **Step 4: Run to verify pass** — `npm test` → PASS.
- [ ] **Step 5: Commit** — `git commit -m "feat: slingshot aim math with clamped drag and arc preview"`

---

### Task 7: Session store

**Files:**
- Create: `src/lib/game/store.ts`
- Test: `tests/unit/game/store.test.ts`

**Interfaces:**
- Consumes: `dealCargo`, `GENTLE_POOL` (Task 4), `isOverboard`, `RestBody` (Task 4).
- Produces: `Phase = 'idle' | 'aiming' | 'simulating' | 'over'`, `MatchState { phase; matchSeed; turn; currentCargo; active: 0 | 1; rest: RestBody[]; loser: 0 | 1 | null; difficulty: 1 | 2 | 3; gentle: boolean }`, `session` (Svelte `writable<MatchState>`), actions `startMatch({ seed, difficulty?, gentle? })`, `beginSimulating()`, `resolveToss(rest: RestBody[])`. Active player 0 = human, 1 = Dockmaster.

- [ ] **Step 1: Write failing tests**

```ts
import { get } from 'svelte/store';
import { beforeEach, describe, expect, it } from 'vitest';
import { WORLD } from '$lib/game/rules';
import { beginSimulating, resolveToss, session, startMatch } from '$lib/game/store';

const onDeck = { cargoId: 'crate', x: 270, y: 700, angle: 0 };
const inSea = { cargoId: 'crate', x: 520, y: WORLD.waterlineY + 10, angle: 0 };

describe('session store', () => {
	beforeEach(() => startMatch({ seed: 'test-match' }));

	it('startMatch deals turn 0 and hands the human the first toss', () => {
		const s = get(session);
		expect(s.phase).toBe('aiming');
		expect(s.turn).toBe(0);
		expect(s.active).toBe(0);
		expect(s.currentCargo).toBeTruthy();
		expect(s.loser).toBeNull();
	});

	it('a safe toss alternates the active player and deals the next item', () => {
		beginSimulating();
		resolveToss([onDeck]);
		const s = get(session);
		expect(s.phase).toBe('aiming');
		expect(s.turn).toBe(1);
		expect(s.active).toBe(1);
		expect(s.rest).toEqual([onDeck]);
	});

	it('an overboard toss ends the match and the tosser loses', () => {
		beginSimulating();
		resolveToss([onDeck]);
		beginSimulating();
		resolveToss([onDeck, inSea]);
		const s = get(session);
		expect(s.phase).toBe('over');
		expect(s.loser).toBe(1);
	});

	it('startMatch fully resets after a finished match', () => {
		resolveToss([inSea]);
		startMatch({ seed: 'again' });
		const s = get(session);
		expect(s.phase).toBe('aiming');
		expect(s.rest).toEqual([]);
		expect(s.loser).toBeNull();
	});
});
```

- [ ] **Step 2: Run to verify failure** — `npm test` → FAIL.

- [ ] **Step 3: Implement**

```ts
import { get, writable } from 'svelte/store';
import { GENTLE_POOL, dealCargo } from './deal';
import { isOverboard, type RestBody } from './rules';

export type Phase = 'idle' | 'aiming' | 'simulating' | 'over';

export interface MatchState {
	phase: Phase;
	matchSeed: string;
	turn: number;
	currentCargo: string;
	active: 0 | 1;
	rest: RestBody[];
	loser: 0 | 1 | null;
	difficulty: 1 | 2 | 3;
	gentle: boolean;
}

const initial: MatchState = {
	phase: 'idle',
	matchSeed: '',
	turn: 0,
	currentCargo: '',
	active: 0,
	rest: [],
	loser: null,
	difficulty: 1,
	gentle: false
};

export const session = writable<MatchState>({ ...initial });

function patch(p: Partial<MatchState>): void {
	session.update((s) => ({ ...s, ...p }));
}

export function startMatch(opts: { seed: string; difficulty?: 1 | 2 | 3; gentle?: boolean }): void {
	const gentle = opts.gentle ?? false;
	session.set({
		...initial,
		phase: 'aiming',
		matchSeed: opts.seed,
		difficulty: opts.difficulty ?? 1,
		gentle,
		currentCargo: dealCargo(opts.seed, 0, gentle ? GENTLE_POOL : undefined)
	});
}

export function beginSimulating(): void {
	patch({ phase: 'simulating' });
}

export function resolveToss(rest: RestBody[]): void {
	const s = get(session);
	if (isOverboard(rest)) {
		patch({ phase: 'over', rest, loser: s.active });
		return;
	}
	const turn = s.turn + 1;
	patch({
		phase: 'aiming',
		rest,
		turn,
		active: s.active === 0 ? 1 : 0,
		currentCargo: dealCargo(s.matchSeed, turn, s.gentle ? GENTLE_POOL : undefined)
	});
}
```

- [ ] **Step 4: Run to verify pass** — `npm test` → PASS.
- [ ] **Step 5: Commit** — `git commit -m "feat: session store with sudden-death turn loop"`

---

### Task 8: The Dockmaster bot

**Files:**
- Create: `src/lib/game/bot.ts`
- Test: `tests/unit/game/bot.test.ts`

**Interfaces:**
- Consumes: `RestBody`, `WORLD` (Task 4), `CRANE_POINT`, `TossInput` (Task 6), `mulberry32` (Task 2), sim API (Task 5, tests only).
- Produces: `AIM_NOISE: Record<1 | 2 | 3, number>` (`{1: 60, 2: 30, 3: 10}`), `planBotToss(rest: RestBody[], difficulty: 1 | 2 | 3, rng: () => number): TossInput`.

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from 'vitest';
import { mulberry32 } from '$engine/rng';
import { planBotToss } from '$lib/game/bot';
import { MAX_FRAMES, advance, applyToss, createSim, newRunState, restState, spawnCargo } from '$lib/game/physics/sim';
import { CRANE_POINT } from '$lib/game/aim';
import { isOverboard } from '$lib/game/rules';

describe('planBotToss', () => {
	it('is deterministic for the same rng seed', () => {
		expect(planBotToss([], 2, mulberry32(9))).toEqual(planBotToss([], 2, mulberry32(9)));
	});
	it('aims at the topmost body of the stack', () => {
		const rest = [
			{ cargoId: 'crate', x: 120, y: 730, angle: 0 },
			{ cargoId: 'crate', x: 400, y: 600, angle: 0 }
		];
		const toss = planBotToss(rest, 3, mulberry32(1));
		// topmost (smallest y) is at x=400, right of the crane → positive vx
		expect(toss.vx).toBeGreaterThan(0);
	});
	it('difficulty 3 on an empty deck never self-destructs (fixed seeds)', () => {
		for (const seed of [1, 2, 3, 4, 5]) {
			const sim = createSim();
			const toss = planBotToss([], 3, mulberry32(seed));
			const body = spawnCargo(sim, 'crate', CRANE_POINT.x, CRANE_POINT.y);
			applyToss(body, toss);
			const rs = newRunState();
			advance(sim, rs, MAX_FRAMES);
			expect(isOverboard(restState(sim))).toBe(false);
		}
	});
});
```

- [ ] **Step 2: Run to verify failure** — `npm test` → FAIL.

- [ ] **Step 3: Implement**

```ts
import { CRANE_POINT, type TossInput } from './aim';
import { WORLD, type RestBody } from './rules';

export const AIM_NOISE: Record<1 | 2 | 3, number> = { 1: 60, 2: 30, 3: 10 };

// Aim at the top of the stack (or deck centre when empty), with
// difficulty-scaled horizontal noise. vy is a gentle lob; vx carries aim.
export function planBotToss(rest: RestBody[], difficulty: 1 | 2 | 3, rng: () => number): TossInput {
	const top = rest.length ? rest.reduce((a, b) => (b.y < a.y ? b : a)) : null;
	const targetX = top ? top.x : (WORLD.deckLeft + WORLD.deckRight) / 2;
	const noisyX = targetX + (rng() - 0.5) * 2 * AIM_NOISE[difficulty];
	const dx = noisyX - CRANE_POINT.x;
	return { vx: dx * 0.055, vy: 2 + rng() * 1.5 };
}
```

- [ ] **Step 4: Run to verify pass** — `npm test` → PASS. If the empty-deck test fails on a listed seed, tune the `0.055` vx factor — the bot must clear this bar before it's allowed in the scene.
- [ ] **Step 5: Commit** — `git commit -m "feat: Dockmaster bot with difficulty-scaled aim noise"`

---

### Task 9: Game scene (placeholder visuals) + route wiring

**Files:**
- Create: `src/lib/scenes/GameScene.svelte`
- Modify: `src/routes/+page.svelte` (replace template welcome content)

**Interfaces:**
- Consumes: everything above. No new exports — this is the glue layer; all logic it contains must be trivial (playbook meta-rule 1).

- [ ] **Step 1: Implement the scene**

`src/lib/scenes/GameScene.svelte`:
```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { hashString, mulberry32 } from '$engine/rng';
	import { CRANE_POINT, arcPreview, dragToVelocity, type TossInput } from '$lib/game/aim';
	import { planBotToss } from '$lib/game/bot';
	import { getCargo } from '$lib/game/cargo';
	import { WORLD } from '$lib/game/rules';
	import {
		advance, applyToss, createSim, newRunState, restState, spawnCargo, type Sim
	} from '$lib/game/physics/sim';
	import { beginSimulating, resolveToss, session, startMatch } from '$lib/game/store';

	let sim: Sim = createSim();
	let view = $state<{ cargoId: string; x: number; y: number; angle: number }[]>([]);
	let drag = $state<{ dx: number; dy: number } | null>(null);
	let raf = 0;
	let timers: ReturnType<typeof setTimeout>[] = [];
	let fast = 1;
	let botRng = mulberry32(1);
	let svgEl: SVGSVGElement;

	const preview = $derived(drag ? arcPreview(dragToVelocity(drag.dx, drag.dy)) : []);
	const hanging = $derived(
		$session.phase === 'aiming' ? getCargo($session.currentCargo) : null
	);

	function syncView(): void {
		view = restState(sim);
	}

	function newMatch(): void {
		const params = new URLSearchParams(location.search);
		const seed = params.get('seed') ?? `solo-${Date.now()}`;
		fast = params.get('fast') ? 4 : 1;
		const difficulty = Number(params.get('difficulty') ?? 1) as 1 | 2 | 3;
		sim = createSim();
		botRng = mulberry32(hashString(`${seed}:bot`));
		startMatch({ seed, difficulty, gentle: params.get('gentle') === '1' });
		syncView();
	}

	function doToss(input: TossInput): void {
		const body = spawnCargo(sim, $session.currentCargo, CRANE_POINT.x, CRANE_POINT.y);
		applyToss(body, input);
		beginSimulating();
		const rs = newRunState();
		const loop = (): void => {
			advance(sim, rs, fast);
			syncView();
			if (rs.done) {
				resolveToss(restState(sim));
			} else {
				raf = requestAnimationFrame(loop);
			}
		};
		raf = requestAnimationFrame(loop);
	}

	function svgPoint(e: PointerEvent): { x: number; y: number } {
		const r = svgEl.getBoundingClientRect();
		return {
			x: ((e.clientX - r.left) / r.width) * WORLD.width,
			y: ((e.clientY - r.top) / r.height) * WORLD.height
		};
	}

	let dragStart: { x: number; y: number } | null = null;

	function onDown(e: PointerEvent): void {
		if ($session.phase !== 'aiming' || $session.active !== 0) return;
		dragStart = svgPoint(e);
		drag = { dx: 0, dy: 0 };
		svgEl.setPointerCapture(e.pointerId);
	}
	function onMove(e: PointerEvent): void {
		if (!dragStart) return;
		const p = svgPoint(e);
		drag = { dx: p.x - dragStart.x, dy: p.y - dragStart.y };
	}
	function onUp(): void {
		if (!dragStart || !drag) return;
		const input = dragToVelocity(drag.dx, drag.dy);
		dragStart = null;
		drag = null;
		doToss(input);
	}

	$effect(() => {
		if ($session.phase === 'aiming' && $session.active === 1) {
			const t = setTimeout(() => {
				doToss(planBotToss($session.rest, $session.difficulty, botRng));
			}, 700 / fast);
			timers.push(t);
		}
	});

	onMount(() => {
		newMatch();
		return () => {
			cancelAnimationFrame(raf);
			timers.forEach(clearTimeout);
		};
	});
</script>

<svg
	bind:this={svgEl}
	viewBox="0 0 {WORLD.width} {WORLD.height}"
	onpointerdown={onDown}
	onpointermove={onMove}
	onpointerup={onUp}
>
	<!-- placeholder backdrop: sky, sea, deck. Real diorama arrives in Plan 2. -->
	<rect width={WORLD.width} height={WORLD.height} fill="#bfe3f2" />
	<rect y={WORLD.waterlineY} width={WORLD.width} height={WORLD.height - WORLD.waterlineY} fill="#2e6f8e" />
	<rect
		x={WORLD.deckLeft} y={WORLD.deckY}
		width={WORLD.deckRight - WORLD.deckLeft} height={WORLD.waterlineY - WORLD.deckY}
		fill="#8a5a3b"
	/>

	{#each view as b (b)}
		<g transform="translate({b.x} {b.y}) rotate({(b.angle * 180) / Math.PI})">
			{#each getCargo(b.cargoId).parts as p}
				{#if p.kind === 'rect'}
					<rect x={p.x - p.w / 2} y={p.y - p.h / 2} width={p.w} height={p.h} fill="#d9a066" stroke="#7a4a22" />
				{:else}
					<circle cx={p.x} cy={p.y} r={p.r} fill="#d9a066" stroke="#7a4a22" />
				{/if}
			{/each}
		</g>
	{/each}

	{#if hanging}
		<g transform="translate({CRANE_POINT.x} {CRANE_POINT.y})" opacity="0.9">
			{#each hanging.parts as p}
				{#if p.kind === 'rect'}
					<rect x={p.x - p.w / 2} y={p.y - p.h / 2} width={p.w} height={p.h} fill="#e8c17a" stroke="#7a4a22" />
				{:else}
					<circle cx={p.x} cy={p.y} r={p.r} fill="#e8c17a" stroke="#7a4a22" />
				{/if}
			{/each}
		</g>
		<text x={WORLD.width / 2} y="60" text-anchor="middle" class="label">
			{hanging.name} — {$session.active === 0 ? 'your toss' : 'Dockmaster is aiming…'}
		</text>
	{/if}

	{#each preview as pt}
		<circle cx={pt.x} cy={pt.y} r="3" fill="#ffffff" opacity="0.6" />
	{/each}

	{#if $session.phase === 'over'}
		<rect width={WORLD.width} height={WORLD.height} fill="#00000088" />
		<text x={WORLD.width / 2} y="420" text-anchor="middle" class="big">
			{$session.loser === 0 ? 'Overboard! The Dockmaster wins.' : 'The Dockmaster spilled it. You win!'}
		</text>
		<g onpointerdown={newMatch} style="cursor: pointer;">
			<rect x={WORLD.width / 2 - 90} y="470" width="180" height="56" rx="12" fill="#e8c17a" />
			<text x={WORLD.width / 2} y="505" text-anchor="middle" class="label">Rematch</text>
		</g>
	{/if}
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: 100vh;
		max-width: calc(100vh * 540 / 960);
		margin: 0 auto;
		touch-action: none;
		background: #0b2530;
	}
	.label {
		font: 20px system-ui, sans-serif;
		fill: #123;
	}
	.big {
		font: 28px system-ui, sans-serif;
		fill: #fff;
	}
</style>
```

`src/routes/+page.svelte`:
```svelte
<script lang="ts">
	import GameScene from '$lib/scenes/GameScene.svelte';
</script>

<GameScene />
```

- [ ] **Step 2: Typecheck** — `npm run check` → 0 errors.
- [ ] **Step 3: Drive it in the browser** (playbook guide 04): `npm run dev`, open `http://localhost:5173/?seed=qa1&fast=1`, play a full match — drag-toss lands cargo, bot answers after ~0.2s (fast mode), stack grows, force an overboard throw, verify game-over overlay + rematch works. Screenshot at 540×960 and **look at it**.
- [ ] **Step 4: Human visual approval** — present the screenshot; placeholder quality is expected but layout/feel must be approved.
- [ ] **Step 5: Commit** — `git commit -m "feat: playable solo duel scene with placeholder rendering"`

---

### Task 10: Dev QA affordances — catalog route + params doc

**Files:**
- Create: `src/routes/catalog/+page.svelte`
- Create: `docs/dev-qa-params.md`

**Interfaces:**
- Consumes: `CARGO` (Task 3). QA params already implemented in Task 9 (`?seed=`, `?fast=1`, `?difficulty=`, `?gentle=1`).

- [ ] **Step 1: Implement the catalog grid** (guide 01: dev routes are fine to ship)

```svelte
<script lang="ts">
	// Dev-only QA route: renders every cargo item at true scale.
	import { CARGO } from '$lib/game/cargo';
</script>

<div class="grid">
	{#each CARGO as def (def.id)}
		<figure>
			<svg viewBox="{-def.w / 2 - 10} {-def.h / 2 - 10} {def.w + 20} {def.h + 20}" width={def.w + 20} height={def.h + 20}>
				{#each def.parts as p}
					{#if p.kind === 'rect'}
						<rect x={p.x - p.w / 2} y={p.y - p.h / 2} width={p.w} height={p.h} fill="#d9a066" stroke="#7a4a22" />
					{:else}
						<circle cx={p.x} cy={p.y} r={p.r} fill="#d9a066" stroke="#7a4a22" />
					{/if}
				{/each}
			</svg>
			<figcaption>{def.name} <small>d={def.density} r={def.restitution}</small></figcaption>
		</figure>
	{/each}
</div>

<style>
	.grid {
		display: flex;
		flex-wrap: wrap;
		gap: 24px;
		padding: 24px;
		align-items: flex-end;
	}
	figcaption {
		font: 13px system-ui, sans-serif;
	}
</style>
```

- [ ] **Step 2: Document the QA params** in `docs/dev-qa-params.md`:

```markdown
# Dev QA URL params (guide 04 pattern)

Game route (`/`):
- `?seed=NAME` — deterministic match seed (deals + bot aim)
- `?fast=1` — 4x physics steps per frame, bot thinks in 175ms
- `?difficulty=1|2|3` — Dockmaster tier
- `?gentle=1` — tutorial pool (crate/barrel/tire/plank only)

Routes:
- `/catalog` — every cargo item at true scale (content QA)
```

- [ ] **Step 3: Verify** — `npm run check` → 0 errors; open `/catalog`, screenshot, look at it (all 12 items present, proportions sane relative to each other).
- [ ] **Step 4: Commit** — `git commit -m "feat: cargo catalog QA route and dev-param docs"`

---

### Task 11: Full verification pass

**Files:** none new.

- [ ] **Step 1: Full suite + typecheck** — `npm test` (all green) and `npm run check` (0 errors).
- [ ] **Step 2: Browser-drive a complete match at normal speed** (no `fast`): human wins one, loses one; confirm rematch resets cleanly both times; confirm no console errors.
- [ ] **Step 3: Screenshot set** — 540×960 phone shots of: aiming with arc preview visible, a 5+ item stack mid-match, the game-over overlay, `/catalog`. Look at every image (guide 04 checklist: cropped text, z-order accidents, empty regions, contrast).
- [ ] **Step 4: Present screenshots for human approval.** Art quality is placeholder by design — approval is for layout, readability, and feel.
- [ ] **Step 5: Commit any fixes** — `git commit -m "fix: <what the screenshots caught>"` (repeat shoot→fix→reshoot as needed).

---

## Self-Review (performed at write time)

- **Spec coverage (Plan 1 scope):** core loop §2 (Tasks 4–9), physics §4 (Task 5), solo bot §6 (Task 8, gentle pool = tutorial deal), QA §9 (validators Task 3, dev params Tasks 9–10, screenshot loop Tasks 9/11). Deliberately deferred to Plans 2–4: art/§1, birds/§3, multiplayer/§5 (trajectory recording already produced by Task 5 for Plan 3), scene personality/§7, monetization/§8, replay-fidelity test (Plan 3, where replay exists).
- **Placeholder scan:** clean — every code step contains real code; placeholder *visuals* are an explicit deliverable, not a plan gap.
- **Type consistency:** `RestBody`/`TossInput`/`RunState` names and shapes checked across Tasks 4–9; `dealCargo(seed, turn, pool?)` signature consistent in store and tests; `advance(sim, rs, steps)` mutation contract consistent between sim tests and scene loop.
