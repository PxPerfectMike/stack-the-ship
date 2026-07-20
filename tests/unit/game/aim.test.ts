import { describe, expect, it } from 'vitest';
import { CRANE_POINT, MAX_DRAG, VELOCITY_SCALE, arcPreview, dragToVelocity } from '$lib/game/aim';

describe('dragToVelocity', () => {
	it('inverts the drag direction (slingshot)', () => {
		const v = dragToVelocity(-50, 80);
		expect(v.vx).toBeGreaterThan(0);
		expect(v.vy).toBeLessThan(0);
	});
	it('clamps drag magnitude to MAX_DRAG', () => {
		const max = dragToVelocity(0, MAX_DRAG);
		const over = dragToVelocity(0, MAX_DRAG * 3);
		expect(over.vy).toBeCloseTo(max.vy, 5);
		expect(Math.abs(max.vy)).toBeCloseTo(MAX_DRAG * VELOCITY_SCALE, 5);
	});
});

describe('arcPreview', () => {
	it('starts at the crane point and curves downward over time', () => {
		const pts = arcPreview({ vx: 4, vy: -6 }, 12);
		expect(pts[0].x).toBeCloseTo(CRANE_POINT.x, 1);
		expect(pts[0].y).toBeCloseTo(CRANE_POINT.y, 1);
		expect(pts.at(-1)!.y).toBeGreaterThan(pts[Math.floor(pts.length / 2)].y);
		expect(pts.length).toBe(12);
	});
});
