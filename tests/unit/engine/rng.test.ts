import { describe, expect, it } from 'vitest';
import { hashString, mulberry32 } from '$engine/rng';

describe('hashString', () => {
	it('is deterministic and input-sensitive', () => {
		expect(hashString('abc')).toBe(hashString('abc'));
		expect(hashString('abc')).not.toBe(hashString('abd'));
		expect(Number.isInteger(hashString('x'))).toBe(true);
	});
});

describe('mulberry32', () => {
	it('same seed gives identical sequences', () => {
		const a = mulberry32(42);
		const b = mulberry32(42);
		expect([a(), a(), a()]).toEqual([b(), b(), b()]);
	});
	it('stays in [0,1) over many samples', () => {
		const r = mulberry32(7);
		for (let i = 0; i < 1000; i++) {
			const v = r();
			expect(v).toBeGreaterThanOrEqual(0);
			expect(v).toBeLessThan(1);
		}
	});
});
