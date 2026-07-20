import { describe, expect, it } from 'vitest';
import { WORLD, isOverboard } from '$lib/game/rules';

describe('isOverboard', () => {
	it('is false for bodies resting on deck', () => {
		expect(isOverboard([{ cargoId: 'crate', x: 270, y: WORLD.deckY - 30, angle: 0 }])).toBe(false);
	});
	it('is true when any body is below the waterline', () => {
		expect(
			isOverboard([
				{ cargoId: 'crate', x: 270, y: 700, angle: 0 },
				{ cargoId: 'pig', x: 520, y: WORLD.waterlineY + 5, angle: 1 }
			])
		).toBe(true);
	});
	it('is false for an empty deck', () => {
		expect(isOverboard([])).toBe(false);
	});
});
