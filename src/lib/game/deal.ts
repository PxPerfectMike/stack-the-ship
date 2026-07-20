import { hashString, mulberry32 } from '$engine/rng';
import { ALL_IDS } from './cargo';

export const GENTLE_POOL: readonly string[] = ['crate', 'barrel', 'tire', 'plank'];

function rawIndex(seed: string, turn: number, len: number): number {
	return Math.floor(mulberry32(hashString(`${seed}:${turn}`))() * len);
}

// No-consecutive-repeat rule: walk from turn 0 so every turn's pick is
// self-consistent no matter which turn you query first.
export function dealCargo(seed: string, turn: number, pool: readonly string[] = ALL_IDS): string {
	let prev = -1;
	let idx = 0;
	for (let t = 0; t <= turn; t++) {
		idx = rawIndex(seed, t, pool.length);
		if (idx === prev) idx = (idx + 1) % pool.length;
		prev = idx;
	}
	return pool[idx];
}
