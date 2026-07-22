// Pendulum drop mechanic: the crane trolley oscillates along its rail and the
// hanging item is a driven, damped pendulum on a constant-length rope from the
// trolley to the ITEM'S CENTRE (rope renders behind the art). A tap releases
// the item with the bob's real velocity — release timing IS the aim. Pure
// math over a time value the caller supplies.
import { SWING_PERIOD_MS } from './timing';
import { WORLD } from './rules';

export interface TossInput {
	vx: number;
	vy: number;
}

export interface PendState {
	theta: number; // rad from vertical, +ve toward +x
	omega: number; // rad/ms
}

export const SWING_CENTER_X = (WORLD.deckLeft + WORLD.deckRight) / 2;
export const SWING_SPAN = 190;
export const TROLLEY_Y = 100; // rope pivot under the trolley bar
export const ROPE_L = 96; // pivot → item centre, identical for every item
export const PEND_G = 0.005; // px/ms² — natural period ≈ 870ms, lags the 2.2s drive
export const PEND_DAMP = 0.0012; // per ms — settles instead of building forever
const PEND_DT_MS = 4; // fixed substep: deterministic and stable
export const DROP_CARRY = 0.3; // fraction of bob momentum the item keeps
// Effective horizontal drift multiplier over a hook-to-deck fall (frames of
// carry after air friction). Tuned against the sim via the bot release test.
export const DRIFT_COMP_FRAMES = 24;

const OMEGA = (2 * Math.PI) / SWING_PERIOD_MS;
const PX_PER_FRAME = 1000 / 60; // px/ms → px/frame

export function trolleyX(tMs: number): number {
	return SWING_CENTER_X + SWING_SPAN * Math.sin(OMEGA * tMs);
}

const pivotVel = (tMs: number): number => SWING_SPAN * OMEGA * Math.cos(OMEGA * tMs);
const pivotAccel = (tMs: number): number => -SWING_SPAN * OMEGA * OMEGA * Math.sin(OMEGA * tMs);

export const newPend = (): PendState => ({ theta: 0, omega: 0 });

// Advance the pendulum from absolute time tMs by elapsedMs (semi-implicit
// Euler in fixed substeps; long gaps are clamped so tab-switches can't explode).
export function stepPend(p: PendState, tMs: number, elapsedMs: number): PendState {
	let { theta, omega } = p;
	let t = tMs;
	let remaining = Math.min(elapsedMs, 100);
	while (remaining > 0) {
		const dt = Math.min(PEND_DT_MS, remaining);
		const acc =
			-(PEND_G / ROPE_L) * Math.sin(theta) -
			(pivotAccel(t) / ROPE_L) * Math.cos(theta) -
			PEND_DAMP * omega;
		omega += acc * dt;
		theta += omega * dt;
		t += dt;
		remaining -= dt;
	}
	return { theta, omega };
}

export function bobX(p: PendState, tMs: number): number {
	return trolleyX(tMs) + ROPE_L * Math.sin(p.theta);
}

export function bobY(p: PendState): number {
	return TROLLEY_Y + ROPE_L * Math.cos(p.theta);
}

// The bob's true velocity (pivot + rotation), scaled to px/frame with carry.
export function releaseFromPend(
	p: PendState,
	tMs: number
): { x: number; y: number; input: TossInput } {
	const vx = (pivotVel(tMs) + ROPE_L * p.omega * Math.cos(p.theta)) * PX_PER_FRAME * DROP_CARRY;
	const vy = -ROPE_L * p.omega * Math.sin(p.theta) * PX_PER_FRAME * DROP_CARRY;
	return { x: bobX(p, tMs), y: bobY(p), input: { vx, vy } };
}

// Where a release right now roughly lands after momentum drift.
export function predictedLandingXPend(p: PendState, tMs: number): number {
	const r = releaseFromPend(p, tMs);
	return r.x + r.input.vx * DRIFT_COMP_FRAMES;
}
