import { describe, expect, it } from 'vitest';
import { emit, on } from '$lib/game/events';

describe('event bus', () => {
	it('delivers to subscribers and honours unsubscribe', () => {
		const seen: unknown[] = [];
		const off = on('impact', (d) => seen.push(d));
		emit('impact', 7);
		off();
		emit('impact', 8);
		expect(seen).toEqual([7]);
	});
	it('supports multiple listeners on one event', () => {
		let a = 0;
		let b = 0;
		const offA = on('settled', () => a++);
		const offB = on('settled', () => b++);
		emit('settled');
		expect([a, b]).toEqual([1, 1]);
		offA();
		offB();
	});
	it('emit with no listeners is a no-op', () => {
		expect(() => emit('spill')).not.toThrow();
	});
});
