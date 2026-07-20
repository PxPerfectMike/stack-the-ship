import { getCargo } from './cargo';
import { WORLD, type RestBody } from './rules';

export interface Perch {
	x: number;
	y: number;
	kind: 'cargo' | 'rail' | 'post' | 'crane';
}

// Where a gull may stand. Cargo tops are approximated from the def's
// bounding box — birds are scenery and only need to LOOK right (spec §3).
export function perchPoints(rest: RestBody[]): Perch[] {
	const pts: Perch[] = [
		{ x: WORLD.deckLeft + WORLD.lipW / 2, y: WORLD.deckY - WORLD.lipH, kind: 'rail' },
		{ x: WORLD.deckRight - WORLD.lipW / 2, y: WORLD.deckY - WORLD.lipH, kind: 'rail' },
		{ x: 90, y: 900, kind: 'post' },
		{ x: 450, y: 900, kind: 'post' },
		{ x: 502, y: 88, kind: 'crane' }
	];
	for (const b of rest.slice(-4)) {
		const y = b.y - getCargo(b.cargoId).h / 2 - 2;
		if (b.y <= WORLD.waterlineY) pts.push({ x: b.x, y, kind: 'cargo' });
	}
	return pts;
}
