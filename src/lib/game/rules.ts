export const WORLD = {
	width: 540,
	height: 960,
	waterlineY: 880,
	deckY: 760,
	deckLeft: 40,
	deckRight: 500,
	lipW: 10,
	lipH: 18,
	// visual hull extents (Ship.svelte draws to these) — the hull is solid
	// out to here; only the pilot cab is pass-through
	hullLeft: 36,
	hullRight: 538
} as const;

export interface RestBody {
	cargoId: string;
	x: number;
	y: number;
	angle: number;
}

export function isOverboard(rest: RestBody[]): boolean {
	return rest.some((b) => b.y > WORLD.waterlineY);
}
