// Tiny typed event bus: the world's nervous system. Pure TS, no DOM.
// Emitters are game-flow code; listeners are scenery (birds, splash, sfx later).

export type GameEvent =
	| 'toss-launched'
	| 'impact'
	| 'settled'
	| 'spill'
	| 'ship-departing'
	| 'match-reset';

const listeners = new Map<GameEvent, Set<(data?: unknown) => void>>();

export function on(event: GameEvent, fn: (data?: unknown) => void): () => void {
	let set = listeners.get(event);
	if (!set) {
		set = new Set();
		listeners.set(event, set);
	}
	set.add(fn);
	return () => set.delete(fn);
}

export function emit(event: GameEvent, data?: unknown): void {
	listeners.get(event)?.forEach((fn) => fn(data));
}
