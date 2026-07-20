import { describe, expect, it } from 'vitest';
import { SHIP_NAMES, shipName } from '$lib/game/shipNames';

describe('shipName', () => {
	it('is deterministic per seed', () => {
		expect(shipName('abc')).toBe(shipName('abc'));
	});
	it('spreads across the fleet', () => {
		const names = new Set(Array.from({ length: 12 }, (_, i) => shipName(`seed${i}`)));
		expect(names.size).toBeGreaterThan(3);
	});
	it('always returns a listed name', () => {
		for (let i = 0; i < 20; i++) {
			expect(SHIP_NAMES).toContain(shipName(`s${i}`));
		}
	});
});
