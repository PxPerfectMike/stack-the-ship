import { hashString, mulberry32 } from '$engine/rng';
import { ALL_IDS, getCargo } from './cargo';

export const GENTLE_POOL: readonly string[] = ['crate', 'barrel', 'tire', 'plank'];

// Items gated by minTurn sit out the opening turns; weights (rarity) skew the
// roll so chaos items stay rare. Falls back to the whole pool if a turn gate
// would empty it.
function eligible(pool: readonly string[], turn: number): string[] {
	const ok = pool.filter((id) => (getCargo(id).minTurn ?? 0) <= turn);
	return ok.length ? ok : [...pool];
}

function weightedIndex(ids: string[], roll: number): number {
	const weights = ids.map((id) => getCargo(id).rarity ?? 1);
	const total = weights.reduce((a, b) => a + b, 0);
	let acc = 0;
	const target = roll * total;
	for (let i = 0; i < ids.length; i++) {
		acc += weights[i];
		if (target < acc) return i;
	}
	return ids.length - 1;
}

// No-consecutive-repeat rule: walk from turn 0 so every turn's pick is
// self-consistent no matter which turn you query first.
export function dealCargo(seed: string, turn: number, pool: readonly string[] = ALL_IDS): string {
	let prev = '';
	let pick = pool[0];
	for (let t = 0; t <= turn; t++) {
		const ids = eligible(pool, t);
		const roll = mulberry32(hashString(`${seed}:${t}`))();
		let idx = weightedIndex(ids, roll);
		if (ids[idx] === prev) idx = (idx + 1) % ids.length;
		pick = ids[idx];
		prev = pick;
	}
	return pick;
}
