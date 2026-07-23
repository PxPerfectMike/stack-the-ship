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
				} else if (p.kind === 'circle') {
					expect(Math.abs(p.x) + p.r).toBeLessThanOrEqual(def.w / 2 + 0.001);
					expect(Math.abs(p.y) + p.r).toBeLessThanOrEqual(def.h / 2 + 0.001);
				} else {
					for (const v of p.verts) {
						expect(Math.abs(v.x)).toBeLessThanOrEqual(def.w / 2 + 0.001);
						expect(Math.abs(v.y)).toBeLessThanOrEqual(def.h / 2 + 0.001);
					}
				}
			}
		}
	});
	it('every polygon part is convex with at least 3 vertices', () => {
		for (const def of CARGO) {
			for (const p of def.parts) {
				if (p.kind !== 'poly') continue;
				expect(p.verts.length).toBeGreaterThanOrEqual(3);
				let sign = 0;
				const n = p.verts.length;
				for (let i = 0; i < n; i++) {
					const a = p.verts[i];
					const b = p.verts[(i + 1) % n];
					const c = p.verts[(i + 2) % n];
					const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
					if (Math.abs(cross) < 1e-9) continue;
					const s = Math.sign(cross);
					if (sign === 0) sign = s;
					expect(s, `${def.id} poly turns inconsistently at vertex ${i}`).toBe(sign);
				}
			}
		}
	});
	it('getCargo throws on unknown id', () => {
		expect(() => getCargo('nope')).toThrow();
	});
});
