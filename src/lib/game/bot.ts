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
