import { WORLD, type RestBody } from './rules';

// The Dockmaster picks a target x on the deck; the scene releases when the
// trolley passes within RELEASE_TOLERANCE of it. Difficulty = how tight the
// aim and the release window are.
export const AIM_NOISE: Record<1 | 2 | 3, number> = { 1: 60, 2: 30, 3: 10 };
export const RELEASE_TOLERANCE: Record<1 | 2 | 3, number> = { 1: 26, 2: 14, 3: 7 };

export function planBotTargetX(rest: RestBody[], difficulty: 1 | 2 | 3, rng: () => number): number {
	const top = rest.length ? rest.reduce((a, b) => (b.y < a.y ? b : a)) : null;
	const targetX = top ? top.x : (WORLD.deckLeft + WORLD.deckRight) / 2;
	const noisy = targetX + (rng() - 0.5) * 2 * AIM_NOISE[difficulty];
	const margin = 30;
	return Math.min(WORLD.deckRight - margin, Math.max(WORLD.deckLeft + margin, noisy));
}
