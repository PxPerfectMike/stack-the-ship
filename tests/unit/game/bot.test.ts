import { describe, expect, it } from 'vitest';
import { mulberry32 } from '$engine/rng';
import { CRANE_POINT } from '$lib/game/aim';
import { planBotToss } from '$lib/game/bot';
import {
	MAX_FRAMES,
	advance,
	applyToss,
	createSim,
	newRunState,
	restState,
	spawnCargo
} from '$lib/game/physics/sim';
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
