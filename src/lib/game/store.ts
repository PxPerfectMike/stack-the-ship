import { get, writable } from 'svelte/store';
import { GENTLE_POOL, dealCargo } from './deal';
import { isOverboard, type RestBody } from './rules';

export type Phase = 'idle' | 'aiming' | 'simulating' | 'over';

export interface MatchState {
	phase: Phase;
	matchSeed: string;
	turn: number;
	currentCargo: string;
	active: 0 | 1;
	rest: RestBody[];
	loser: 0 | 1 | null;
	difficulty: 1 | 2 | 3;
	gentle: boolean;
}

const initial: MatchState = {
	phase: 'idle',
	matchSeed: '',
	turn: 0,
	currentCargo: '',
	active: 0,
	rest: [],
	loser: null,
	difficulty: 1,
	gentle: false
};

export const session = writable<MatchState>({ ...initial });

function patch(p: Partial<MatchState>): void {
	session.update((s) => ({ ...s, ...p }));
}

export function startMatch(opts: { seed: string; difficulty?: 1 | 2 | 3; gentle?: boolean }): void {
	const gentle = opts.gentle ?? false;
	session.set({
		...initial,
		phase: 'aiming',
		matchSeed: opts.seed,
		difficulty: opts.difficulty ?? 1,
		gentle,
		currentCargo: dealCargo(opts.seed, 0, gentle ? GENTLE_POOL : undefined)
	});
}

export function beginSimulating(): void {
	patch({ phase: 'simulating' });
}

export function resolveToss(rest: RestBody[]): void {
	const s = get(session);
	if (isOverboard(rest)) {
		patch({ phase: 'over', rest, loser: s.active });
		return;
	}
	const turn = s.turn + 1;
	patch({
		phase: 'aiming',
		rest,
		turn,
		active: s.active === 0 ? 1 : 0,
		currentCargo: dealCargo(s.matchSeed, turn, s.gentle ? GENTLE_POOL : undefined)
	});
}
