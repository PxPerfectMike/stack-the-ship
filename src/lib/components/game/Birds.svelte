<script lang="ts">
	// The personality engine (spec §3): four gulls as setTimeout state machines
	// (guide 02) reacting to game events. JS sets targets; CSS transitions move.
	// Strictly scenery — no physics, no pointer events.
	import { onMount } from 'svelte';
	import GullArt from '$lib/components/game/GullArt.svelte';
	import { on } from '$lib/game/events';
	import { perchPoints } from '$lib/game/perch';
	import type { RestBody } from '$lib/game/rules';
	import {
		BIRD_HOP_MS,
		BIRD_IDLE_MIN_MS,
		BIRD_IDLE_SPAN_MS,
		BIRD_RETURN_MIN_MS,
		BIRD_RETURN_SPAN_MS,
		BIRD_SCATTER_MS,
		BIRD_STARTLE_MAX_MS,
		BIRD_STARTLE_MIN_MS
	} from '$lib/game/timing';

	let { rest }: { rest: RestBody[] } = $props();

	interface Bird {
		x: number;
		y: number;
		face: 1 | -1;
		state: 'perched' | 'air' | 'gone';
		dur: number;
		hop: boolean;
	}

	let birds = $state<Bird[]>(
		[80, 200, 340, 460].map((x) => ({ x, y: -60, face: 1, state: 'gone', dur: 0, hop: false }))
	);
	let timers: ReturnType<typeof setTimeout>[] = [];
	let reduced = false;

	function later(ms: number, fn: () => void): void {
		timers.push(setTimeout(fn, ms));
	}
	const rand = (a: number, b: number): number => a + Math.random() * (b - a);

	function freePerches(): { x: number; y: number }[] {
		return perchPoints(rest).filter(
			(p) => !birds.some((b) => b.state !== 'gone' && Math.abs(b.x - p.x) < 16)
		);
	}

	function land(i: number, delay: number): void {
		later(delay, () => {
			if (birds[i].state === 'perched') return;
			const opts = freePerches();
			if (!opts.length) return;
			const p = opts[Math.floor(Math.random() * opts.length)];
			const dur = rand(900, 1400);
			birds[i] = {
				...birds[i],
				state: 'air',
				x: p.x,
				y: p.y,
				dur,
				face: p.x >= birds[i].x ? 1 : -1
			};
			later(dur, () => {
				if (birds[i].state === 'air') {
					birds[i] = { ...birds[i], state: 'perched' };
					idle(i);
				}
			});
		});
	}

	function flyOff(i: number, delay: number): void {
		later(delay, () => {
			if (birds[i].state === 'gone') return;
			birds[i] = {
				...birds[i],
				state: 'gone',
				x: birds[i].x + (Math.random() < 0.5 ? -320 : 320),
				y: -70,
				dur: BIRD_SCATTER_MS + rand(0, 250)
			};
		});
	}

	function idle(i: number): void {
		later(rand(BIRD_IDLE_MIN_MS, BIRD_IDLE_MIN_MS + BIRD_IDLE_SPAN_MS), () => {
			if (birds[i].state !== 'perched') return;
			if (Math.random() < 0.5) {
				hop(i);
			} else {
				birds[i] = { ...birds[i], face: birds[i].face === 1 ? -1 : 1 };
			}
			idle(i);
		});
	}

	function hop(i: number): void {
		birds[i] = { ...birds[i], hop: true };
		later(BIRD_HOP_MS + 30, () => (birds[i] = { ...birds[i], hop: false }));
	}

	onMount(() => {
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) {
			// static tableau: three gulls simply perched, no loops, no reactions
			const pts = perchPoints(rest);
			birds = birds.map((b, i) =>
				i < 3 && pts[i] ? { ...b, state: 'perched', x: pts[i].x, y: pts[i].y, dur: 0 } : b
			);
			return () => timers.forEach(clearTimeout);
		}
		[0, 1, 2].forEach((i) => land(i, 500 + i * 800));
		const offs = [
			// launch: birds near the deck bail, distant ones stay to watch
			on('toss-launched', () => {
				birds.forEach((b, i) => {
					if (b.state === 'perched' && (b.y < 780 || Math.random() < 0.4)) flyOff(i, i * 60);
				});
			}),
			// impact: whoever stayed startle-hops ~100ms later (timing sells it)
			on('impact', () => {
				birds.forEach((b, i) => {
					if (b.state === 'perched') {
						later(rand(BIRD_STARTLE_MIN_MS, BIRD_STARTLE_MAX_MS), () => {
							if (birds[i].state === 'perched') hop(i);
						});
					}
				});
			}),
			// calm restored: the brave bird (0) always returns first
			on('settled', () => {
				birds.forEach((b, i) => {
					if (b.state === 'gone') land(i, BIRD_RETURN_MIN_MS + (i * BIRD_RETURN_SPAN_MS) / 4);
				});
			}),
			on('spill', () => birds.forEach((_, i) => flyOff(i, i * 50))),
			on('ship-departing', () => birds.forEach((_, i) => flyOff(i, i * 50))),
			on('match-reset', () => {
				birds.forEach((b, i) => {
					if (b.state === 'gone' && i < 3) land(i, 700 + i * 600);
				});
			})
		];
		return () => {
			offs.forEach((off) => off());
			timers.forEach(clearTimeout);
		};
	});
</script>

{#each birds as b, i (i)}
	<g
		class="bird"
		class:hop={b.hop}
		style="transform: translate({b.x}px, {b.y}px); transition: transform {b.dur}ms cubic-bezier(0.45, 0.2, 0.35, 1); --hop-t: {BIRD_HOP_MS}ms"
	>
		<g style="transform: scaleX({b.face})">
			<GullArt />
		</g>
	</g>
{/each}

<style>
	.bird {
		pointer-events: none;
	}
	.bird.hop {
		animation: hop var(--hop-t) ease-out;
	}
	@keyframes hop {
		50% {
			translate: 0 -9px;
		}
	}
</style>
