import { describe, expect, it } from 'vitest';
import { mulberry32 } from '$engine/rng';
import { resolveAmbience, rollAmbience } from '$lib/game/ambience';

describe('rollAmbience', () => {
	it('is deterministic for the same rng seed', () => {
		expect(rollAmbience(mulberry32(3))).toEqual(rollAmbience(mulberry32(3)));
	});
	it('produces every time of day and both weathers over many rolls', () => {
		const tods = new Set<string>();
		const wxs = new Set<string>();
		for (let i = 0; i < 1000; i++) {
			const a = rollAmbience(mulberry32(i));
			tods.add(a.tod);
			wxs.add(a.wx);
		}
		expect(tods).toEqual(new Set(['day', 'dusk', 'night']));
		expect(wxs).toEqual(new Set(['clear', 'rain']));
	});
});

describe('resolveAmbience', () => {
	it('URL params override the roll entirely', () => {
		const a = resolveAmbience('?tod=night&wx=rain', mulberry32(1));
		expect(a).toEqual({ tod: 'night', wx: 'rain' });
	});
	it('partial override keeps the rolled other half', () => {
		const rolled = rollAmbience(mulberry32(5));
		const a = resolveAmbience('?tod=dusk', mulberry32(5));
		expect(a.tod).toBe('dusk');
		expect(a.wx).toBe(rolled.wx);
	});
	it('ignores invalid values', () => {
		const rolled = rollAmbience(mulberry32(8));
		expect(resolveAmbience('?tod=blizzard', mulberry32(8))).toEqual(rolled);
	});
});
