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
