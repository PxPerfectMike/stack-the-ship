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
