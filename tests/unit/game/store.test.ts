import { get } from 'svelte/store';
import { beforeEach, describe, expect, it } from 'vitest';
import { WORLD } from '$lib/game/rules';
import { beginSimulating, resolveToss, session, startMatch } from '$lib/game/store';

const onDeck = { cargoId: 'crate', x: 270, y: 700, angle: 0 };
const inSea = { cargoId: 'crate', x: 520, y: WORLD.waterlineY + 10, angle: 0 };

describe('session store', () => {
	beforeEach(() => startMatch({ seed: 'test-match' }));

	it('startMatch deals turn 0 and hands the human the first toss', () => {
		const s = get(session);
		expect(s.phase).toBe('aiming');
		expect(s.turn).toBe(0);
		expect(s.active).toBe(0);
		expect(s.currentCargo).toBeTruthy();
		expect(s.loser).toBeNull();
	});

	it('a safe toss alternates the active player and deals the next item', () => {
		beginSimulating();
		resolveToss([onDeck]);
		const s = get(session);
		expect(s.phase).toBe('aiming');
		expect(s.turn).toBe(1);
		expect(s.active).toBe(1);
		expect(s.rest).toEqual([onDeck]);
	});

	it('an overboard toss ends the match and the tosser loses', () => {
		beginSimulating();
		resolveToss([onDeck]);
		beginSimulating();
		resolveToss([onDeck, inSea]);
		const s = get(session);
		expect(s.phase).toBe('over');
		expect(s.loser).toBe(1);
	});

	it('startMatch fully resets after a finished match', () => {
		resolveToss([inSea]);
		startMatch({ seed: 'again' });
		const s = get(session);
		expect(s.phase).toBe('aiming');
		expect(s.rest).toEqual([]);
		expect(s.loser).toBeNull();
	});
});
