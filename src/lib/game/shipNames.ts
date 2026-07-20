import { hashString, mulberry32 } from '$engine/rng';

export const SHIP_NAMES = [
	'MV Barely Adequate',
	'SS Probably Fine',
	'MV Second Thoughts',
	'SS Sink Later',
	'MV Deadweight',
	'SS Last Straw',
	'MV Overdue',
	'SS Mild Concern',
	'MV Final Warning',
	'SS Non-Refundable',
	'MV Best Effort',
	'SS Terms Apply'
];

export function shipName(seed: string): string {
	const r = mulberry32(hashString(`${seed}:ship`))();
	return SHIP_NAMES[Math.floor(r * SHIP_NAMES.length)];
}
