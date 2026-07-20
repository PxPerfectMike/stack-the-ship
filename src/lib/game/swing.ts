// Pendulum drop mechanic: the crane trolley oscillates along its rail; a tap
// releases the hanging item with the trolley's lateral momentum. Release
// timing IS the aim. Pure math over a time value the caller supplies.
import { SWING_PERIOD_MS } from './timing';
import { WORLD } from './rules';

export interface TossInput {
	vx: number;
	vy: number;
}

export const SWING_CENTER_X = (WORLD.deckLeft + WORLD.deckRight) / 2;
export const SWING_SPAN = 190;
export const HOOK_Y = 150;
export const DROP_CARRY = 0.3; // fraction of trolley momentum the item keeps
// Effective horizontal drift multiplier over a hook-to-deck fall (frames of
// carry after air friction). Tuned against the sim via the bot release test.
export const DRIFT_COMP_FRAMES = 24;

const OMEGA = (2 * Math.PI) / SWING_PERIOD_MS;

export function trolleyX(tMs: number): number {
	return SWING_CENTER_X + SWING_SPAN * Math.sin(OMEGA * tMs);
}

export function releaseInput(tMs: number): { x: number; input: TossInput } {
	// derivative px/ms → px/frame at 60fps, scaled by carry factor
	const vxPerFrame = SWING_SPAN * OMEGA * Math.cos(OMEGA * tMs) * (1000 / 60) * DROP_CARRY;
	return { x: trolleyX(tMs), input: { vx: vxPerFrame, vy: 0 } };
}

// Where a release at time t roughly lands after momentum drift.
export function predictedLandingX(tMs: number): number {
	const { x, input } = releaseInput(tMs);
	return x + input.vx * DRIFT_COMP_FRAMES;
}
