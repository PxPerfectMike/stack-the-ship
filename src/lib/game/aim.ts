export interface TossInput {
	vx: number;
	vy: number;
}

export const CRANE_POINT = { x: 270, y: 140 } as const;
export const MAX_DRAG = 220;
export const VELOCITY_SCALE = 0.09;
export const PREVIEW_GRAVITY = 1.4; // per preview step; visual hint only, tuned against matter in browser QA

export function dragToVelocity(dx: number, dy: number): TossInput {
	const len = Math.hypot(dx, dy);
	const clamp = len > MAX_DRAG ? MAX_DRAG / len : 1;
	return { vx: -dx * clamp * VELOCITY_SCALE, vy: -dy * clamp * VELOCITY_SCALE };
}

export function arcPreview(input: TossInput, steps = 14): { x: number; y: number }[] {
	const pts: { x: number; y: number }[] = [];
	let { x, y } = CRANE_POINT as { x: number; y: number };
	let vy = input.vy;
	for (let i = 0; i < steps; i++) {
		pts.push({ x, y });
		x += input.vx * 4;
		y += vy * 4;
		vy += PREVIEW_GRAVITY;
	}
	return pts;
}
