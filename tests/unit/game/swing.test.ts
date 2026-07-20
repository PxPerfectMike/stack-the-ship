import { describe, expect, it } from 'vitest';
import { SWING_PERIOD_MS } from '$lib/game/timing';
import {
	DROP_CARRY,
	HOOK_Y,
	SWING_CENTER_X,
	SWING_SPAN,
	releaseInput,
	trolleyX
} from '$lib/game/swing';

describe('trolleyX', () => {
	it('starts at centre and reaches both extremes over a period', () => {
		expect(trolleyX(0)).toBeCloseTo(SWING_CENTER_X, 5);
		expect(trolleyX(SWING_PERIOD_MS / 4)).toBeCloseTo(SWING_CENTER_X + SWING_SPAN, 3);
		expect(trolleyX((3 * SWING_PERIOD_MS) / 4)).toBeCloseTo(SWING_CENTER_X - SWING_SPAN, 3);
		expect(trolleyX(SWING_PERIOD_MS)).toBeCloseTo(SWING_CENTER_X, 3);
	});
});

describe('releaseInput', () => {
	it('drops with lateral carry matching motion direction at centre', () => {
		const r = releaseInput(0); // moving toward +x at centre
		expect(r.x).toBeCloseTo(SWING_CENTER_X, 5);
		expect(r.input.vx).toBeGreaterThan(0);
		expect(r.input.vy).toBe(0);
	});
	it('has near-zero carry at the extremes', () => {
		const r = releaseInput(SWING_PERIOD_MS / 4);
		expect(Math.abs(r.input.vx)).toBeLessThan(0.01);
	});
	it('carry scales with DROP_CARRY and stays bounded', () => {
		const vmax = Math.abs(releaseInput(0).input.vx);
		expect(vmax).toBeGreaterThan(1);
		expect(vmax).toBeLessThan(12);
		expect(vmax).toBeCloseTo(
			SWING_SPAN * ((2 * Math.PI) / SWING_PERIOD_MS) * (1000 / 60) * DROP_CARRY,
			3
		);
	});
	it('hook height is above the deck play area', () => {
		expect(HOOK_Y).toBeLessThan(300);
	});
});
