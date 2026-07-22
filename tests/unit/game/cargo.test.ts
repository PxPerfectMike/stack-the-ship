import { describe, expect, it } from 'vitest';
import { ALL_IDS, CARGO, getCargo } from '$lib/game/cargo';

describe('cargo catalog', () => {
	it('has 22 unique items', () => {
		expect(CARGO.length).toBe(22);
		expect(new Set(ALL_IDS).size).toBe(22);
	});
	it('every part stays inside its declared bounding box', () => {
		for (const def of CARGO) {
			for (const p of def.parts) {
				if (p.kind === 'rect') {
					expect(Math.abs(p.x) + p.w / 2).toBeLessThanOrEqual(def.w / 2 + 0.001);
					expect(Math.abs(p.y) + p.h / 2).toBeLessThanOrEqual(def.h / 2 + 0.001);
				} else {
					expect(Math.abs(p.x) + p.r).toBeLessThanOrEqual(def.w / 2 + 0.001);
					expect(Math.abs(p.y) + p.r).toBeLessThanOrEqual(def.h / 2 + 0.001);
				}
			}
		}
	});
	it('getCargo throws on unknown id', () => {
		expect(() => getCargo('nope')).toThrow();
	});
});
