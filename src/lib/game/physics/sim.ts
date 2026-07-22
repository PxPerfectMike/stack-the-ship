import { Bodies, Body, Composite, Engine, Events } from 'matter-js';
import { getCargo } from '../cargo';
import { WORLD, type RestBody } from '../rules';

export const SETTLE_SPEED = 0.15;
export const SETTLE_ANGULAR = 0.05;
export const SETTLE_FRAMES = 45;
export const SPLASH_FRAMES = 45; // once cargo is in the sea the loss is decided — one splash beat, then conclude
export const MAX_FRAMES = 720; // 12s hard cap — a rocking pig can never hang the game
export const FRAME_MS = 1000 / 60;
export const RECORD_EVERY = 3; // ≈20Hz trajectory samples

export interface Sim {
	engine: Engine;
	cargo: { body: Body; cargoId: string; ox: number; oy: number }[];
}

export interface TrajectoryFrame {
	t: number;
	bodies: { x: number; y: number; angle: number }[];
}

export interface RunState {
	frames: number;
	calm: number;
	splash: number;
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
	// Small mercy lips at both rails: catch slow rolls, not real tosses.
	const lipL = Bodies.rectangle(
		WORLD.deckLeft + WORLD.lipW / 2,
		WORLD.deckY - WORLD.lipH / 2,
		WORLD.lipW,
		WORLD.lipH,
		{ isStatic: true, label: 'lip' }
	);
	const lipR = Bodies.rectangle(
		WORLD.deckRight - WORLD.lipW / 2,
		WORLD.deckY - WORLD.lipH / 2,
		WORLD.lipW,
		WORLD.lipH,
		{ isStatic: true, label: 'lip' }
	);
	// The whole hull is solid, not just the cargo deck: items tipping over a
	// lip land on the bow foredeck (under the cab) or graze the stern sliver
	// instead of ghosting through painted ship. Two stepped rects follow the
	// bow rake; the pilot cab is deliberately NOT solid.
	const bowTop = Bodies.rectangle(
		(WORLD.deckRight + WORLD.hullRight) / 2,
		WORLD.deckY + 30,
		WORLD.hullRight - WORLD.deckRight,
		60,
		{ isStatic: true, label: 'hull' }
	);
	const bowLower = Bodies.rectangle(WORLD.deckRight + 14, WORLD.deckY + 90, 28, 60, {
		isStatic: true,
		label: 'hull'
	});
	const stern = Bodies.rectangle(
		(WORLD.hullLeft + WORLD.deckLeft) / 2,
		WORLD.deckY + 60,
		WORLD.deckLeft - WORLD.hullLeft,
		120,
		{ isStatic: true, label: 'hull' }
	);
	Composite.add(engine.world, [deck, lipL, lipR, bowTop, bowLower, stern]);
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
	// Compound bodies centre on their parts' centroid; remember where the def
	// origin sits relative to it so authored art can ride the body exactly.
	sim.cargo.push({ body, cargoId, ox: x - body.position.x, oy: y - body.position.y });
	return body;
}

export interface CargoPose {
	cargoId: string;
	x: number;
	y: number;
	angleDeg: number;
	ox: number;
	oy: number;
}

export function bodyPoses(sim: Sim): CargoPose[] {
	return sim.cargo.map(({ body, cargoId, ox, oy }) => ({
		cargoId,
		x: body.position.x,
		y: body.position.y,
		angleDeg: (body.angle * 180) / Math.PI,
		ox,
		oy
	}));
}

export function applyToss(body: Body, input: { vx: number; vy: number }): void {
	Body.setVelocity(body, { x: input.vx, y: input.vy });
}

export function onCollision(sim: Sim, cb: () => void): void {
	Events.on(sim.engine, 'collisionStart', () => cb());
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
	return { frames: 0, calm: 0, splash: 0, trajectory: [], done: false };
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
		const drowning = sim.cargo.some(({ body }) => body.position.y > WORLD.waterlineY);
		rs.splash = drowning ? rs.splash + 1 : 0;
		if (rs.calm >= SETTLE_FRAMES || rs.splash >= SPLASH_FRAMES || rs.frames >= MAX_FRAMES) {
			rs.done = true;
		}
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
		// Compound bodies centre on their parts' centroid, not the def origin —
		// setPosition/setAngle restore the exact recorded pose regardless.
		Body.setPosition(body, { x: r.x, y: r.y });
		Body.setAngle(body, r.angle);
	}
}

// World-space outlines for rendering. Compound bodies keep the container at
// parts[0]; drawing actual part vertices sidesteps centroid-offset math.
export interface PartShape {
	kind: 'poly' | 'circle';
	points?: string;
	cx?: number;
	cy?: number;
	r?: number;
}

export function bodyShapes(sim: Sim): { cargoId: string; parts: PartShape[] }[] {
	return sim.cargo.map(({ body, cargoId }) => {
		const def = getCargo(cargoId);
		const parts = body.parts.length > 1 ? body.parts.slice(1) : body.parts;
		return {
			cargoId,
			parts: parts.map((p, i) => {
				const dp = def.parts[i];
				if (dp.kind === 'circle') {
					return { kind: 'circle' as const, cx: p.position.x, cy: p.position.y, r: dp.r };
				}
				return {
					kind: 'poly' as const,
					points: p.vertices.map((v) => `${Math.round(v.x * 10) / 10},${Math.round(v.y * 10) / 10}`).join(' ')
				};
			})
		};
	});
}
