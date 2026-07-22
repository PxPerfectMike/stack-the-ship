import { describe, expect, it } from 'vitest';
import { SWING_PERIOD_MS } from '$lib/game/timing';
import {
	bobX,
	bobY,
	newPend,
	predictedLandingXPend,
	releaseFromPend,
	ROPE_L,
	stepPend,
	SWING_CENTER_X,
	SWING_SPAN,
	TROLLEY_Y,
	trolleyX
} from '$lib/game/swing';

const run = (ms: number, step = 8) => {
	let p = newPend();
	for (let t = 0; t < ms; t += step) p = stepPend(p, t, step);
	return p;
};

describe('trolleyX', () => {
	it('starts at centre and reaches both extremes over a period', () => {
		expect(trolleyX(0)).toBeCloseTo(SWING_CENTER_X, 5);
		expect(trolleyX(SWING_PERIOD_MS / 4)).toBeCloseTo(SWING_CENTER_X + SWING_SPAN, 3);
		expect(trolleyX((3 * SWING_PERIOD_MS) / 4)).toBeCloseTo(SWING_CENTER_X - SWING_SPAN, 3);
		expect(trolleyX(SWING_PERIOD_MS)).toBeCloseTo(SWING_CENTER_X, 3);
	});
});

describe('driven pendulum', () => {
	it('is deterministic', () => {
		expect(run(5000)).toEqual(run(5000));
	});
	it('actually swings but stays bounded under the crane drive', () => {
		let p = newPend();
		let maxTheta = 0;
		for (let t = 0; t < SWING_PERIOD_MS * 6; t += 8) {
			p = stepPend(p, t, 8);
			maxTheta = Math.max(maxTheta, Math.abs(p.theta));
		}
		expect(maxTheta).toBeGreaterThan(0.05);
		expect(maxTheta).toBeLessThan(1.0);
	});
	it('bob hangs below the trolley on a constant-length rope', () => {
		const t = 3000;
		const p = run(t);
		const dx = bobX(p, t) - trolleyX(t);
		const dy = bobY(p) - TROLLEY_Y;
		expect(Math.hypot(dx, dy)).toBeCloseTo(ROPE_L, 6);
		expect(dy).toBeGreaterThan(0);
	});
	it('release velocity stays bounded for gameplay', () => {
		let p = newPend();
		for (let t = 0; t < SWING_PERIOD_MS * 4; t += 8) {
			p = stepPend(p, t, 8);
			const r = releaseFromPend(p, t + 8);
			expect(Math.abs(r.input.vx)).toBeLessThan(8);
			expect(Math.abs(r.input.vy)).toBeLessThan(3);
		}
	});
	it('predicted landing sweeps across most of the deck', () => {
		let p = newPend();
		let lo = Infinity;
		let hi = -Infinity;
		for (let t = 0; t < SWING_PERIOD_MS * 3; t += 8) {
			p = stepPend(p, t, 8);
			const x = predictedLandingXPend(p, t + 8);
			lo = Math.min(lo, x);
			hi = Math.max(hi, x);
		}
		expect(lo).toBeLessThan(SWING_CENTER_X - 100);
		expect(hi).toBeGreaterThan(SWING_CENTER_X + 100);
	});
});
