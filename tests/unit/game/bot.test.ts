import { describe, expect, it } from 'vitest';
import { mulberry32 } from '$engine/rng';
import { RELEASE_TOLERANCE, planBotTargetX } from '$lib/game/bot';
import {
	MAX_FRAMES,
	advance,
	applyToss,
	createSim,
	newRunState,
	restState,
	spawnCargo
} from '$lib/game/physics/sim';
import { isOverboard, WORLD } from '$lib/game/rules';
import {
	newPend,
	predictedLandingXPend,
	releaseFromPend,
	stepPend,
	type TossInput
} from '$lib/game/swing';
import { SWING_PERIOD_MS } from '$lib/game/timing';

describe('planBotTargetX', () => {
	it('is deterministic for the same rng seed', () => {
		expect(planBotTargetX([], 2, mulberry32(9))).toEqual(planBotTargetX([], 2, mulberry32(9)));
	});
	it('aims near the topmost body of the stack', () => {
		const rest = [
			{ cargoId: 'crate', x: 120, y: 730, angle: 0 },
			{ cargoId: 'crate', x: 400, y: 600, angle: 0 }
		];
		const target = planBotTargetX(rest, 3, mulberry32(1));
		expect(Math.abs(target - 400)).toBeLessThanOrEqual(RELEASE_TOLERANCE[3] + 10);
	});
	it('always targets within the deck', () => {
		for (let seed = 0; seed < 20; seed++) {
			const t = planBotTargetX([], 1, mulberry32(seed));
			expect(t).toBeGreaterThanOrEqual(WORLD.deckLeft + 20);
			expect(t).toBeLessThanOrEqual(WORLD.deckRight - 20);
		}
	});
	it('difficulty 3 on an empty deck never self-destructs (fixed seeds, real release)', () => {
		for (const seed of [1, 2, 3, 4, 5]) {
			const target = planBotTargetX([], 3, mulberry32(seed));
			// run the live pendulum and release when the predicted landing
			// point crosses the target — exactly what the in-game bot does
			let pend = newPend();
			let rel: { x: number; y: number; input: TossInput } | null = null;
			for (let t = 0; t < SWING_PERIOD_MS * 4 && !rel; t += 8) {
				pend = stepPend(pend, t, 8);
				if (Math.abs(predictedLandingXPend(pend, t + 8) - target) < RELEASE_TOLERANCE[3]) {
					rel = releaseFromPend(pend, t + 8);
				}
			}
			expect(rel).toBeTruthy();
			const sim = createSim();
			const body = spawnCargo(sim, 'crate', rel!.x, rel!.y);
			applyToss(body, rel!.input);
			const rs = newRunState();
			advance(sim, rs, MAX_FRAMES);
			expect(isOverboard(restState(sim))).toBe(false);
		}
	});
});
