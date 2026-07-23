<script lang="ts">
	import { onMount } from 'svelte';
	import { hashString, mulberry32 } from '$engine/rng';
	import Backdrop from '$lib/components/game/Backdrop.svelte';
	import Birds from '$lib/components/game/Birds.svelte';
	import CargoArt from '$lib/components/game/CargoArt.svelte';
	import Crane from '$lib/components/game/Crane.svelte';
	import Dock from '$lib/components/game/Dock.svelte';
	import Ship from '$lib/components/game/Ship.svelte';
	import { sessionAmbience } from '$lib/game/sessionAmbience';
	import { RELEASE_TOLERANCE, planBotTargetX } from '$lib/game/bot';
	import { getCargo } from '$lib/game/cargo';
	import { emit } from '$lib/game/events';
	import { isOverboard, WORLD } from '$lib/game/rules';
	import { shipName } from '$lib/game/shipNames';
	import {
		bobX,
		bobY,
		newPend,
		predictedLandingXPend,
		releaseFromPend,
		ROPE_L,
		stepPend,
		SWING_CENTER_X,
		SWING_SPAN,
		TROLLEY_Y,
		trolleyX,
		type PendState,
		type TossInput
	} from '$lib/game/swing';
	import {
		BOT_THINK_MS,
		CRANE_DROP_ANTICIPATION_MS,
		DEPART_BEAT_MS,
		EASE_ARRIVE,
		EASE_DEPART,
		EASE_POP,
		OVERLAY_IN_MS,
		SHIP_ARRIVE_MS,
		SHIP_DEPART_MS,
		SWING_PERIOD_MS,
		TROLLEY_PARK_MS
	} from '$lib/game/timing';
	import {
		advance,
		applyToss,
		bodyPoses,
		bodyShapes,
		createSim,
		newRunState,
		onCollision,
		restState,
		spawnCargo,
		step,
		type CargoPose,
		type PartShape,
		type RunState,
		type Sim
	} from '$lib/game/physics/sim';
	import { beginSimulating, lateSpill, resolveToss, session, startMatch } from '$lib/game/store';

	const amb = sessionAmbience(location.search);

	let sim: Sim = createSim();
	let view = $state<CargoPose[]>([]);
	let debugView = $state<{ cargoId: string; parts: PartShape[] }[]>([]);
	let debug = $state(false);
	// Trolley parks by the tower (the swing's left extreme) between drops and
	// matches — the title screen leaves it in exactly this spot, so scene
	// handoffs are seamless. Each turn the swing clock starts at the left
	// extreme with zero velocity: the trolley accelerates out naturally.
	const PARKED_X = SWING_CENTER_X - SWING_SPAN;
	let trolleyPos = $state(PARKED_X);
	let trolleyTransition = $state('none');
	let swingBase = performance.now();
	let pend: PendState = newPend();
	let bob = $state({ x: PARKED_X, y: TROLLEY_Y + ROPE_L });
	let lastT = 0;
	let dockPhase = $state<'arriving' | 'docked' | 'departing'>('arriving');
	let vesselTx = $state(-660);
	let vesselTransition = $state('none');
	let overlayUp = $state(false);
	let vesselName = $state('');
	let pendingRelease = $state<{ x: number; y: number; input: TossInput } | null>(null);
	let splash = $state<{ x: number; key: number } | null>(null);
	let trolleyRaf = 0;
	let fast = 1;
	let firstMatch = true;
	let botRng = mulberry32(1);
	let svgEl: SVGSVGElement;
	let timers: ReturnType<typeof setTimeout>[] = [];

	const hanging = $derived($session.phase === 'aiming' ? getCargo($session.currentCargo) : null);
	const spilledName = $derived.by(() => {
		const sunk = $session.rest.find((b) => b.y > WORLD.waterlineY);
		return sunk ? getCargo(sunk.cargoId).name.toLowerCase() : 'cargo';
	});

	function later(ms: number, fn: () => void): void {
		timers.push(setTimeout(fn, ms));
	}

	function syncView(): void {
		view = bodyPoses(sim);
		if (debug) debugView = bodyShapes(sim);
	}

	let tossImpacted = false;

	function newMatch(): void {
		const params = new URLSearchParams(location.search);
		const seed = params.get('seed') ?? `solo-${Date.now()}`;
		// fast is an honest multiplier: ?fast=2 → 2x, bare ?fast → 4x, ?fast=1 → normal
		const fastRaw = Number(params.get('fast'));
		fast = params.has('fast') ? (Number.isFinite(fastRaw) && fastRaw >= 1 ? fastRaw : 4) : 1;
		debug = params.get('debug') === '1';
		const difficulty = Number(params.get('difficulty') ?? 1) as 1 | 2 | 3;
		sim = createSim();
		activeRun = null;
		onCollision(sim, () => {
			if (!tossImpacted) {
				tossImpacted = true;
				emit('impact');
			}
		});
		botRng = mulberry32(hashString(`${seed}:bot`));
		vesselName = shipName(seed);
		overlayUp = false;
		splash = null;
		pendingRelease = null;
		pend = newPend();
		bob = { x: SWING_CENTER_X, y: TROLLEY_Y + ROPE_L };
		startMatch({ seed, difficulty, gentle: params.get('gentle') === '1' });
		syncView();
		emit('match-reset');
		// ?phase=docked is a dev shortcut for the FIRST match only — every
		// "Next ship" after that plays the full docking choreography.
		if (firstMatch && params.get('phase') === 'docked') {
			firstMatch = false;
			vesselTransition = 'none';
			vesselTx = 0;
			dockPhase = 'docked';
			return;
		}
		firstMatch = false;
		dockPhase = 'arriving';
		vesselTransition = 'none';
		vesselTx = -660;
		requestAnimationFrame(() =>
			requestAnimationFrame(() => {
				vesselTransition = `transform ${SHIP_ARRIVE_MS / fast}ms ${EASE_ARRIVE}`;
				vesselTx = 0;
			})
		);
		later(SHIP_ARRIVE_MS / fast + 100, () => (dockPhase = 'docked'));
	}

	// Physics never sleeps: one persistent loop steps the sim every frame for
	// the whole match. A toss just hands the loop a RunState to watch; between
	// turns the same engine keeps running so residual motion settles naturally
	// on screen instead of freezing mid-wobble.
	let activeRun: RunState | null = null;

	function doDrop(r: { x: number; y: number; input: TossInput }): void {
		const body = spawnCargo(sim, $session.currentCargo, r.x, r.y);
		applyToss(body, r.input);
		beginSimulating();
		tossImpacted = false;
		emit('toss-launched');
		activeRun = newRunState();
	}

	function spillSplash(rest: { x: number; y: number }[]): void {
		const sunk = rest.find((b) => b.y > WORLD.waterlineY);
		splash = { x: sunk?.x ?? WORLD.width / 2, key: Date.now() };
		emit('spill');
	}

	function physFrame(): void {
		if (activeRun) {
			advance(sim, activeRun, fast);
			syncView();
			if (activeRun.done) {
				activeRun = null;
				const rest = restState(sim);
				if (isOverboard(rest)) {
					spillSplash(rest);
				} else {
					emit('settled');
				}
				resolveToss(rest);
			}
			return;
		}
		// idle: keep the world honest while players aim (or the ship departs)
		if ($session.rest.length > 0 && $session.phase !== 'idle') {
			for (let i = 0; i < fast; i++) step(sim);
			syncView();
			if ($session.phase === 'aiming') {
				const rest = restState(sim);
				if (isOverboard(rest)) {
					spillSplash(rest);
					lateSpill(rest);
				}
			}
		}
	}

	// Anticipation before action (spec §1): freeze the hang point, dip the
	// cable for a beat, then let go.
	function beginRelease(): void {
		if ($session.phase !== 'aiming' || dockPhase !== 'docked' || pendingRelease) return;
		pendingRelease = releaseFromPend(pend, performance.now() - swingBase);
		later(CRANE_DROP_ANTICIPATION_MS / fast, () => {
			if (pendingRelease) {
				doDrop(pendingRelease);
				pendingRelease = null;
			}
		});
	}

	function onDown(): void {
		if ($session.active !== 0) return;
		beginRelease();
	}

	$effect(() => {
		if ($session.phase === 'aiming' && $session.active === 1 && dockPhase === 'docked') {
			let watchRaf = 0;
			const target = { x: 0, armed: false };
			const think = setTimeout(() => {
				target.x = planBotTargetX($session.rest, $session.difficulty, botRng);
				target.armed = true;
			}, BOT_THINK_MS / fast);
			const watch = (): void => {
				if (
					target.armed &&
					!pendingRelease &&
					Math.abs(predictedLandingXPend(pend, performance.now() - swingBase) - target.x) <
						RELEASE_TOLERANCE[$session.difficulty]
				) {
					beginRelease();
					return;
				}
				watchRaf = requestAnimationFrame(watch);
			};
			watchRaf = requestAnimationFrame(watch);
			return () => {
				clearTimeout(think);
				cancelAnimationFrame(watchRaf);
			};
		}
	});

	// Each aiming turn begins with the trolley parked at the tower: rebase the
	// swing clock to the left extreme (zero velocity) and re-hang the rope.
	$effect(() => {
		if ($session.phase === 'aiming' && dockPhase === 'docked') {
			swingBase = performance.now() + SWING_PERIOD_MS / 4;
			pend = newPend();
			bob = { x: PARKED_X, y: TROLLEY_Y + ROPE_L };
		}
	});

	// Loss sequence: splash → a beat of stillness → the ship departs with the
	// stack → only then the result card.
	$effect(() => {
		if ($session.phase === 'over') {
			const t1 = setTimeout(() => {
				emit('ship-departing');
				dockPhase = 'departing';
				vesselTransition = `transform ${SHIP_DEPART_MS / fast}ms ${EASE_DEPART}`;
				vesselTx = 680;
				later(SHIP_DEPART_MS / fast + 80, () => (overlayUp = true));
			}, DEPART_BEAT_MS / fast);
			return () => clearTimeout(t1);
		}
	});

	onMount(() => {
		const trolleyLoop = (): void => {
			physFrame();
			const now = performance.now() - swingBase;
			const active = $session.phase === 'aiming' && dockPhase === 'docked';
			if (active && !pendingRelease) {
				trolleyTransition = 'none';
				pend = stepPend(pend, lastT, now - lastT);
				trolleyPos = trolleyX(now);
				bob = { x: bobX(pend, now), y: bobY(pend) };
			} else if (!active && trolleyPos !== PARKED_X) {
				// glide home to the tower to fetch the next item
				trolleyTransition = `transform ${TROLLEY_PARK_MS}ms cubic-bezier(0.4, 0, 0.3, 1)`;
				trolleyPos = PARKED_X;
			}
			lastT = now;
			trolleyRaf = requestAnimationFrame(trolleyLoop);
		};
		trolleyRaf = requestAnimationFrame(trolleyLoop);
		newMatch();
		return () => {
			cancelAnimationFrame(trolleyRaf);
			timers.forEach(clearTimeout);
		};
	});
</script>

<svg
	bind:this={svgEl}
	class="tod-{amb.tod} wx-{amb.wx}"
	viewBox="0 0 {WORLD.width} {WORLD.height}"
	role="application"
	aria-label="Stack the Ship game"
	style="--anticipation-t: {CRANE_DROP_ANTICIPATION_MS}ms; --overlay-in: {OVERLAY_IN_MS}ms; --pop: {EASE_POP}"
	onpointerdown={onDown}
>
	<Backdrop {amb} />

	<!-- vessel: ship + its cargo travel as one -->
	<g style="transform: translateX({vesselTx}px); transition: {vesselTransition}">
		<Ship name={vesselName} />

		{#each view as b, i (i)}
			<g transform="translate({b.x} {b.y}) rotate({b.angleDeg}) translate({b.ox} {b.oy})">
				<CargoArt id={b.cargoId} />
			</g>
		{/each}

		<!-- front-layer pass: tub walls re-draw over their contents so cargo
		     that lands inside visually nests IN the tub -->
		{#each view as b, i (i)}
			{#if b.cargoId === 'bathtub'}
				<g transform="translate({b.x} {b.y}) rotate({b.angleDeg}) translate({b.ox} {b.oy})">
					<CargoArt id={b.cargoId} overlay />
				</g>
			{/if}
		{/each}

		{#if debug}
			{#each debugView as b, i (i)}
				<g opacity="0.35">
					{#each b.parts as p, j (j)}
						{#if p.kind === 'poly'}
							<polygon points={p.points} fill="none" stroke="#ff2fa0" stroke-width="2" />
						{:else}
							<circle cx={p.cx} cy={p.cy} r={p.r} fill="none" stroke="#ff2fa0" stroke-width="2" />
						{/if}
					{/each}
				</g>
			{/each}
		{/if}
	</g>

	<!-- near water covers sunken cargo -->
	<rect y="886" width={WORLD.width} height="74" fill="var(--water-deep)" pointer-events="none" />
	{#if splash}
		{#key splash.key}
			<g class="splash" transform="translate({splash.x} 884)" pointer-events="none">
				<ellipse rx="16" ry="5" fill="none" stroke="var(--foam)" stroke-width="4" />
				<circle cx="-10" cy="-8" r="3" fill="var(--foam)" />
				<circle cx="8" cy="-11" r="2.4" fill="var(--foam)" />
			</g>
		{/key}
	{/if}

	<!-- dockside gantry crane -->
	<Crane />

	<!-- trolley: always present, parks by the tower between drops -->
	<g
		pointer-events="none"
		style="transform: translateX({trolleyPos - SWING_CENTER_X}px); transition: {trolleyTransition}"
	>
		<rect x={SWING_CENTER_X - 16} y="84" width="32" height="18" rx="6" fill="var(--rope)" />
		<circle cx={SWING_CENTER_X - 8} cy="104" r="3.5" fill="var(--ink)" opacity="0.6" />
		<circle cx={SWING_CENTER_X + 8} cy="104" r="3.5" fill="var(--ink)" opacity="0.6" />
	</g>
	{#if hanging && dockPhase === 'docked'}
		<g pointer-events="none">
			<g class="hang" class:dip={pendingRelease !== null}>
				<!-- rope runs behind the item to its centre — same length for every item -->
				<line
					x1={trolleyPos}
					y1={TROLLEY_Y}
					x2={bob.x}
					y2={bob.y}
					stroke="var(--rope)"
					stroke-width="3"
				/>
				<g transform="translate({bob.x} {bob.y})">
					<CargoArt id={hanging.id} />
					<CargoArt id={hanging.id} overlay />
				</g>
			</g>
		</g>
		<text x={WORLD.width / 2} y="56" text-anchor="middle" class="label">
			{hanging.name} — {$session.active === 0 ? 'tap to drop!' : 'the Dockmaster is aiming…'}
		</text>
	{/if}

	<Birds rest={$session.rest} />

	<!-- foreground dock the viewer stands on -->
	<Dock />

	{#if overlayUp}
		<rect width={WORLD.width} height={WORLD.height} fill="#0b2530" opacity="0.45" />
		<g class="card">
			<rect x="60" y="356" width="420" height="190" rx="20" fill="var(--overlay-card)" />
			<text x={WORLD.width / 2} y="412" text-anchor="middle" class="card-title">
				{$session.loser === 0 ? 'Overboard.' : 'The Dockmaster fumbled it.'}
			</text>
			<text x={WORLD.width / 2} y="446" text-anchor="middle" class="card-sub">
				{$session.loser === 0 ? `The sea has your ${spilledName} now.` : 'The sea provides. You win.'}
			</text>
			<g
				onpointerdown={(e) => {
					e.stopPropagation();
					newMatch();
				}}
				role="button"
				tabindex="-1"
				style="cursor: pointer;"
			>
				<rect x={WORLD.width / 2 - 92} y="472" width="184" height="52" rx="14" fill="var(--crane)" />
				<text x={WORLD.width / 2} y="506" text-anchor="middle" class="card-btn">Next ship</text>
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
	.label {
		font: 20px system-ui, sans-serif;
		fill: var(--ink);
	}
	.hang {
		transition: translate var(--anticipation-t) ease-in;
	}
	.hang.dip {
		translate: 0 8px;
	}
	.splash {
		animation: splash-out 700ms ease-out forwards;
	}
	@keyframes splash-out {
		from {
			opacity: 0.95;
			scale: 0.4;
		}
		to {
			opacity: 0;
			scale: 2.2;
		}
	}
	.card {
		transform-box: fill-box;
		transform-origin: center;
		animation: pop var(--overlay-in) var(--pop) both;
	}
	@keyframes pop {
		from {
			opacity: 0;
			scale: 0.82;
		}
	}
	.card-title {
		font: 700 30px system-ui, sans-serif;
		fill: var(--ink);
	}
	.card-sub {
		font: 19px system-ui, sans-serif;
		fill: var(--ink);
		opacity: 0.8;
	}
	.card-btn {
		font: 700 21px system-ui, sans-serif;
		fill: #17323f;
	}
	@media (prefers-reduced-motion: reduce) {
		.splash,
		.card {
			animation: none;
		}
	}
</style>
