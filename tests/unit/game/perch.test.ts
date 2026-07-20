import { describe, expect, it } from 'vitest';
import { getCargo } from '$lib/game/cargo';
import { perchPoints } from '$lib/game/perch';
import { WORLD } from '$lib/game/rules';

describe('perchPoints', () => {
	it('offers rail, post and crane perches even on an empty deck', () => {
		const pts = perchPoints([]);
		const kinds = new Set(pts.map((p) => p.kind));
		expect(kinds).toContain('rail');
		expect(kinds).toContain('post');
		expect(kinds).toContain('crane');
		expect(pts.length).toBeGreaterThanOrEqual(5);
	});
	it('adds cargo perches on top of bodies', () => {
		const rest = [{ cargoId: 'crate', x: 200, y: 700, angle: 0 }];
		const cargoPerch = perchPoints(rest).find((p) => p.kind === 'cargo');
		expect(cargoPerch).toBeDefined();
		expect(cargoPerch!.y).toBeCloseTo(700 - getCargo('crate').h / 2 - 2, 5);
		expect(cargoPerch!.x).toBe(200);
	});
	it('only offers the newest four cargo perches', () => {
		const rest = Array.from({ length: 7 }, (_, i) => ({
			cargoId: 'crate',
			x: 100 + i * 40,
			y: 700,
			angle: 0
		}));
		expect(perchPoints(rest).filter((p) => p.kind === 'cargo').length).toBe(4);
	});
	it('never offers a perch on sunken cargo', () => {
		const rest = [{ cargoId: 'crate', x: 520, y: WORLD.waterlineY + 40, angle: 0 }];
		expect(perchPoints(rest).some((p) => p.kind === 'cargo')).toBe(false);
	});
});
