<script lang="ts">
	// Diegetic title screen (TSA TitleScene pattern): the screen IS the harbor
	// before your shift. The title is a wooden sign hanging from the crane on a
	// real free pendulum; gulls land on it and it dips. Ships arrive already
	// loaded with absurd (physics-settled) cargo piles, dwell, and depart on
	// randomized timings. "Start Loading" releases the sign into the sea — the
	// menu literally becomes the first drop of the shift.
	import { onMount } from 'svelte';
	import Backdrop from '$lib/components/game/Backdrop.svelte';
	import Birds from '$lib/components/game/Birds.svelte';
	import CargoArt from '$lib/components/game/CargoArt.svelte';
	import Crane from '$lib/components/game/Crane.svelte';
	import Dock from '$lib/components/game/Dock.svelte';
	import GullArt from '$lib/components/game/GullArt.svelte';
	import Ship from '$lib/components/game/Ship.svelte';
	import { ALL_IDS } from '$lib/game/cargo';
	import { emit } from '$lib/game/events';
	import {
		advance,
		bodyPoses,
		createSim,
		newRunState,
		restState,
		spawnCargo,
		type CargoPose
	} from '$lib/game/physics/sim';
	import { WORLD, type RestBody } from '$lib/game/rules';
	import { sessionAmbience } from '$lib/game/sessionAmbience';
	import { shipName } from '$lib/game/shipNames';
	import { SWING_CENTER_X, TROLLEY_Y } from '$lib/game/swing';
	import {
		EASE_ARRIVE,
		EASE_DEPART,
		EASE_POP,
		OVERLAY_IN_MS,
		SHIP_ARRIVE_MS,
		SHIP_DEPART_MS
	} from '$lib/game/timing';

	let { onstart }: { onstart: () => void } = $props();

	const amb = sessionAmbience(location.search);

	// --- title sign: free damped pendulum around the crane hook ---------------
	// RULE: the sign never moves without a visible cause — a gull landing,
	// perching (its weight tilts the equilibrium), pushing off, or the drop.
	const SIGN_G = 0.002; // px/ms² — big sign, slow stately swing
	const SIGN_L = 110; // pivot → board centre
	const SIGN_DAMP = 0.0008; // each event visibly rings down over ~3-4s
	const GULL_KICK = 1.6e-6; // landing thump per px of perch offset (~2.7° max)
	const GULL_PUSHOFF = 1.1e-6; // lighter than landing
	const GULL_WEIGHT = 3.8e-9; // perched torque per px offset (~1.5° lean max)
	const GULL_FLY_MS = 750;
	let signTheta = $state(0);
	let signOmega = 0;
	let signDropY = $state(0);
	let dropping = $state(false);
	let dropVy = 0;
	let splash = $state<{ x: number; key: number } | null>(null);
	let signGone = $state(false);

	// --- ambient ship loop -----------------------------------------------------
	let dockPhase = $state<'gone' | 'arriving' | 'docked' | 'departing'>('docked');
	let vesselTx = $state(0);
	let vesselTransition = $state('none');
	let vesselName = $state('');
	let pile = $state<CargoPose[]>([]);
	let birdsRest = $state<RestBody[]>([]);

	// --- gull on the sign ------------------------------------------------------
	interface SignGull {
		x: number; // perch offset on the board
		face: 1 | -1;
		lx: number; // live position (sign-local), CSS transition does the flight
		ly: number;
		state: 'air' | 'perched';
	}
	let signGull = $state<SignGull | null>(null);

	const timers: ReturnType<typeof setTimeout>[] = [];
	const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
	const rand = (a: number, b: number) => a + Math.random() * (b - a);
	let raf = 0;
	let reduced = false;

	// Settle a fresh absurd pile with the real physics, keep what stayed aboard.
	function makePile(): void {
		const sim = createSim();
		const n = 3 + Math.floor(Math.random() * 3);
		for (let i = 0; i < n; i++) {
			const id = ALL_IDS[Math.floor(Math.random() * ALL_IDS.length)];
			spawnCargo(sim, id, 160 + Math.random() * 220, 690 - i * 130);
		}
		const rs = newRunState();
		advance(sim, rs, 600);
		pile = bodyPoses(sim).filter((p) => p.y < WORLD.waterlineY);
		birdsRest = restState(sim).filter((b) => b.y < WORLD.waterlineY);
	}

	function beginDeparture(): void {
		emit('ship-departing');
		birdsRest = [];
		dockPhase = 'departing';
		vesselTransition = `transform ${SHIP_DEPART_MS * 1.4}ms ${EASE_DEPART}`;
		vesselTx = 680;
		later(SHIP_DEPART_MS * 1.4 + 120, () => {
			dockPhase = 'gone';
			later(rand(5000, 11000), beginArrival);
		});
	}

	function beginArrival(): void {
		vesselName = shipName(`title-${Math.random()}`);
		makePile();
		dockPhase = 'arriving';
		vesselTransition = 'none';
		vesselTx = -660;
		requestAnimationFrame(() =>
			requestAnimationFrame(() => {
				vesselTransition = `transform ${SHIP_ARRIVE_MS * 1.6}ms ${EASE_ARRIVE}`;
				vesselTx = 0;
			})
		);
		later(SHIP_ARRIVE_MS * 1.6 + 150, () => {
			dockPhase = 'docked';
			emit('settled'); // gulls drift back to the fresh stack
			later(rand(14000, 26000), beginDeparture);
		});
	}

	// A gull visits the sign now and then: flies in, lands with a thump, leans
	// the sign with its weight while perched, then visibly pushes off and
	// leaves. Every impulse has an on-screen actor.
	function gullVisit(): void {
		if (dropping || signGone || signGull) return;
		const x = (Math.random() < 0.5 ? -1 : 1) * rand(50, 125);
		const face: 1 | -1 = x < 0 ? 1 : -1;
		signGull = { x, face, lx: x - face * 190, ly: -70, state: 'air' };
		requestAnimationFrame(() =>
			requestAnimationFrame(() => {
				if (signGull) signGull = { ...signGull, lx: x, ly: 121 };
			})
		);
		later(GULL_FLY_MS, () => {
			if (!signGull || dropping) return;
			signGull = { ...signGull, state: 'perched' };
			signOmega += x * GULL_KICK;
		});
		later(GULL_FLY_MS + rand(5000, 11000), () => {
			if (!signGull || dropping) return;
			signOmega -= x * GULL_PUSHOFF;
			signGull = { ...signGull, state: 'air', lx: x + face * 210, ly: -90 };
			later(GULL_FLY_MS + 80, () => {
				signGull = null;
				later(rand(6000, 14000), gullVisit);
			});
		});
	}

	function stepSign(tNow: number, dt: number): void {
		let remaining = Math.min(dt, 80);
		while (remaining > 0) {
			const h = Math.min(4, remaining);
			if (dropping) {
				dropVy += 0.0028 * h;
				signDropY += dropVy * h;
			} else {
				const perchTorque =
					signGull && signGull.state === 'perched' ? signGull.x * GULL_WEIGHT : 0;
				const acc =
					-(SIGN_G / SIGN_L) * Math.sin(signTheta) + perchTorque - SIGN_DAMP * signOmega;
				signOmega += acc * h;
				signTheta += signOmega * h;
			}
			remaining -= h;
		}
		if (dropping && !signGone && TROLLEY_Y + SIGN_L + signDropY > 850) {
			signGone = true;
			splash = { x: SWING_CENTER_X + SIGN_L * Math.sin(signTheta), key: Date.now() };
			later(700, onstart);
		}
	}

	function handleStart(): void {
		if (dropping) return;
		if (reduced) {
			onstart();
			return;
		}
		// a perched gull rides the sign down — its own fault for sitting there
		dropping = true;
		emit('spill'); // every gull in the harbor takes it personally
	}

	onMount(() => {
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		vesselName = shipName(`title-${Math.random()}`);
		makePile();
		if (!reduced) {
			later(rand(12000, 22000), beginDeparture);
			later(rand(2500, 6000), gullVisit);
			let lastT = performance.now();
			const loop = (t: number): void => {
				stepSign(t, t - lastT);
				lastT = t;
				raf = requestAnimationFrame(loop);
			};
			raf = requestAnimationFrame(loop);
		}
		return () => {
			cancelAnimationFrame(raf);
			timers.forEach(clearTimeout);
		};
	});

	const signThetaDeg = $derived((signTheta * 180) / Math.PI);
</script>

<svg
	class="tod-{amb.tod} wx-{amb.wx}"
	viewBox="0 0 {WORLD.width} {WORLD.height}"
	role="img"
	aria-label="Stack the Ship title screen"
	style="--overlay-in: {OVERLAY_IN_MS}ms; --pop: {EASE_POP}"
>
	<Backdrop {amb} />

	<!-- ambient vessel with its pre-stacked absurd pile -->
	{#if dockPhase !== 'gone'}
		<g style="transform: translateX({vesselTx}px); transition: {vesselTransition}">
			<Ship name={vesselName} />
			{#each pile as b, i (i)}
				<g transform="translate({b.x} {b.y}) rotate({b.angleDeg}) translate({b.ox} {b.oy})">
					<CargoArt id={b.cargoId} />
				</g>
			{/each}
			{#each pile as b, i (i)}
				{#if b.cargoId === 'bathtub'}
					<g transform="translate({b.x} {b.y}) rotate({b.angleDeg}) translate({b.ox} {b.oy})">
						<CargoArt id={b.cargoId} overlay />
					</g>
				{/if}
			{/each}
		</g>
	{/if}

	<rect y="886" width={WORLD.width} height="74" fill="var(--water-deep)" pointer-events="none" />
	{#if splash}
		{#key splash.key}
			<g class="splash" transform="translate({splash.x} 884)" pointer-events="none">
				<ellipse rx="22" ry="6" fill="none" stroke="var(--foam)" stroke-width="4" />
				<circle cx="-13" cy="-9" r="3.5" fill="var(--foam)" />
				<circle cx="10" cy="-13" r="2.8" fill="var(--foam)" />
			</g>
		{/key}
	{/if}

	<Crane />

	<!-- the title sign, hanging from the trolley -->
	{#if !signGone}
		<g pointer-events="none">
			<rect x={SWING_CENTER_X - 16} y="84" width="32" height="18" rx="6" fill="var(--rope)" />
			<g transform="translate({SWING_CENTER_X} {TROLLEY_Y + signDropY}) rotate({signThetaDeg})">
				<circle cx="0" cy="2" r="5" fill="none" stroke="var(--rope)" stroke-width="3.5" />
				<line x1="0" y1="5" x2="-100" y2="124" stroke="var(--rope)" stroke-width="3" />
				<line x1="0" y1="5" x2="100" y2="124" stroke="var(--rope)" stroke-width="3" />
				<rect x="-160" y="120" width="320" height="96" rx="9" fill="#b07e5f" />
				<rect x="-160" y="120" width="320" height="10" rx="5" fill="#c08f6c" />
				<rect x="-160" y="204" width="320" height="12" rx="6" fill="#96684a" />
				<rect
					x="-160"
					y="120"
					width="320"
					height="96"
					rx="9"
					fill="none"
					stroke="#7f5540"
					stroke-width="4"
				/>
				<circle cx="-100" cy="127" r="4" fill="#5e3f2e" />
				<circle cx="100" cy="127" r="4" fill="#5e3f2e" />
				{#each [-148, 148] as nx (nx)}
					<circle cx={nx} cy="132" r="2" fill="#7f5540" />
					<circle cx={nx} cy="204" r="2" fill="#7f5540" />
				{/each}
				<text x="0" y="165" text-anchor="middle" class="sign-title shadow">STACK</text>
				<text x="0" y="163" text-anchor="middle" class="sign-title">STACK</text>
				<text x="0" y="200" text-anchor="middle" class="sign-title shadow">THE SHIP</text>
				<text x="0" y="198" text-anchor="middle" class="sign-title">THE SHIP</text>
				{#if signGull}
					<g
						class="sgull"
						class:flying={signGull.state === 'air'}
						style="transform: translate({signGull.lx}px, {signGull.ly}px); transition: transform {GULL_FLY_MS}ms cubic-bezier(0.45, 0.2, 0.35, 1)"
					>
						<g style="transform: scaleX({signGull.face})">
							<GullArt />
						</g>
					</g>
				{/if}
			</g>
		</g>
	{/if}

	<Birds rest={birdsRest} />

	<Dock />

	<!-- harbor manifest + start -->
	{#if !dropping}
		<g class="card">
			<rect x="80" y="330" width="380" height="176" rx="16" fill="var(--overlay-card)" />
			<text x="270" y="362" text-anchor="middle" class="m-head">HARBOR MANIFEST</text>
			{#each [{ l: 'STACK THE CARGO', s: 'REQUIRED', c: '#2e7d4f' }, { l: 'SPILL NOTHING', s: 'SUDDEN DEATH', c: '#b93a3a' }, { l: 'FEEDING THE GULLS', s: 'IGNORED', c: '#8a7f6a' }, { l: 'NOW DOCKING', s: dockPhase === 'docked' || dockPhase === 'arriving' ? vesselName : 'STANDBY', c: '#17323f' }] as row, ri (ri)}
				<text x="104" y={392 + ri * 27} class="m-label">{row.l}</text>
				<line
					x1="108"
					x2="432"
					y1={389 + ri * 27}
					y2={389 + ri * 27}
					stroke="#8a7f6a"
					stroke-width="1.5"
					stroke-dasharray="2 5"
					opacity="0.45"
				/>
				<text x="436" y={392 + ri * 27} text-anchor="end" class="m-status" fill={row.c}>{row.s}</text>
			{/each}
			<g
				class="start"
				onpointerdown={(e) => {
					e.stopPropagation();
					handleStart();
				}}
				role="button"
				tabindex="-1"
			>
				<rect x="150" y="532" width="240" height="58" rx="16" fill="var(--crane)" />
				<text x="270" y="569" text-anchor="middle" class="start-label">Start Loading</text>
			</g>
		</g>
	{/if}
</svg>

<style>
	:global(html, body) {
		margin: 0;
		height: 100%;
		overflow: hidden;
		background: #0b2530;
	}
	svg {
		display: block;
		width: 100%;
		height: 100vh;
		max-width: calc(100vh * 540 / 960);
		margin: 0 auto;
		touch-action: none;
		background: #0b2530;
	}
	.sign-title {
		font: 800 36px system-ui, sans-serif;
		letter-spacing: 3px;
		fill: #f7f0e6;
	}
	.sign-title.shadow {
		fill: #7f5540;
	}
	.m-head {
		font: 700 16px system-ui, sans-serif;
		letter-spacing: 3px;
		fill: var(--ink);
	}
	.m-label,
	.m-status {
		font: 600 12.5px ui-monospace, monospace;
		letter-spacing: 0.5px;
	}
	.m-label {
		fill: #17323f;
	}
	.card {
		transform-box: fill-box;
		transform-origin: center;
		animation: pop var(--overlay-in) var(--pop) both;
	}
	@keyframes pop {
		from {
			opacity: 0;
			scale: 0.85;
		}
	}
	.start {
		cursor: pointer;
	}
	.start:active rect {
		filter: brightness(0.88);
	}
	.start-label {
		font: 700 22px system-ui, sans-serif;
		fill: #17323f;
	}
	.sgull.flying :global(.wing) {
		transform-box: fill-box;
		transform-origin: 92% 55%;
		animation: flap 150ms ease-in-out infinite alternate;
	}
	@keyframes flap {
		from {
			rotate: 12deg;
		}
		to {
			rotate: -55deg;
		}
	}
	.splash {
		animation: splash-out 800ms ease-out forwards;
	}
	@keyframes splash-out {
		from {
			opacity: 0.95;
			scale: 0.4;
		}
		to {
			opacity: 0;
			scale: 2.4;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.card,
		.splash {
			animation: none;
		}
	}
</style>
