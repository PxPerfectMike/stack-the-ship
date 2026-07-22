<script module lang="ts">
	import { rollAmbience, type Ambience } from '$lib/game/ambience';

	// Shared-session ambience (guide 02): first mount rolls, later mounts
	// inherit, next app launch re-rolls.
	let sessionAmbience: Ambience | undefined;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { hashString, mulberry32 } from '$engine/rng';
	import Backdrop from '$lib/components/game/Backdrop.svelte';
	import Birds from '$lib/components/game/Birds.svelte';
	import CargoArt from '$lib/components/game/CargoArt.svelte';
	import Crane from '$lib/components/game/Crane.svelte';
	import Dock from '$lib/components/game/Dock.svelte';
	import Ship from '$lib/components/game/Ship.svelte';
	import { TODS, WXS } from '$lib/game/ambience';
	import { RELEASE_TOLERANCE, planBotTargetX } from '$lib/game/bot';
	import { getCargo } from '$lib/game/cargo';
	import { emit } from '$lib/game/events';
	import { isOverboard, WORLD } from '$lib/game/rules';
	import { shipName } from '$lib/game/shipNames';
	import {
		HOOK_Y,
		predictedLandingX,
		releaseInput,
		trolleyX,
		type TossInput
	} from '$lib/game/swing';
	import {
		BOT_THINK_MS,
		CRANE_DROP_ANTICIPATION_MS,
		CRANE_SWAY_MS,
		DEPART_BEAT_MS,
		EASE_ARRIVE,
		EASE_DEPART,
		EASE_POP,
		OVERLAY_IN_MS,
		SHIP_ARRIVE_MS,
		SHIP_DEPART_MS
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
		type CargoPose,
		type PartShape,
		type Sim
	} from '$lib/game/physics/sim';
	import { beginSimulating, resolveToss, session, startMatch } from '$lib/game/store';

	sessionAmbience ??= rollAmbience(mulberry32((Math.random() * 4294967296) >>> 0));
	const ambParams = new URLSearchParams(location.search);
	const amb: Ambience = {
		tod: (TODS as readonly string[]).includes(ambParams.get('tod') ?? '')
			? (ambParams.get('tod') as Ambience['tod'])
			: sessionAmbience.tod,
		wx: (WXS as readonly string[]).includes(ambParams.get('wx') ?? '')
			? (ambParams.get('wx') as Ambience['wx'])
			: sessionAmbience.wx
	};

	let sim: Sim = createSim();
	let view = $state<CargoPose[]>([]);
	let debugView = $state<{ cargoId: string; parts: PartShape[] }[]>([]);
	let debug = $state(false);
	let trolleyPos = $state(270);
	let dockPhase = $state<'arriving' | 'docked' | 'departing'>('arriving');
	let vesselTx = $state(-660);
	let vesselTransition = $state('none');
	let overlayUp = $state(false);
	let vesselName = $state('');
	let pendingRelease = $state<{ x: number; input: TossInput } | null>(null);
	let splash = $state<{ x: number; key: number } | null>(null);
	let raf = 0;
	let trolleyRaf = 0;
	let fast = 1;
	let firstMatch = true;
	let botRng = mulberry32(1);
	let svgEl: SVGSVGElement;
	let timers: ReturnType<typeof setTimeout>[] = [];
	const t0 = performance.now();

	const hanging = $derived($session.phase === 'aiming' ? getCargo($session.currentCargo) : null);
	const hangOffset = $derived(hanging ? hanging.h / 2 + 12 : 0);
	const hangX = $derived(pendingRelease ? pendingRelease.x : trolleyPos);
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

	function doDrop(r: { x: number; input: TossInput }): void {
		const def = getCargo($session.currentCargo);
		const body = spawnCargo(sim, $session.currentCargo, r.x, HOOK_Y + def.h / 2 + 12);
		applyToss(body, r.input);
		beginSimulating();
		tossImpacted = false;
		emit('toss-launched');
		const rs = newRunState();
		const loop = (): void => {
			advance(sim, rs, fast);
			syncView();
			if (rs.done) {
				const rest = restState(sim);
				if (isOverboard(rest)) {
					const sunk = rest.find((b) => b.y > WORLD.waterlineY);
					splash = { x: sunk?.x ?? WORLD.width / 2, key: Date.now() };
					emit('spill');
				} else {
					emit('settled');
				}
				resolveToss(rest);
			} else {
				raf = requestAnimationFrame(loop);
			}
		};
		raf = requestAnimationFrame(loop);
	}

	// Anticipation before action (spec §1): freeze the hang point, dip the
	// cable for a beat, then let go.
	function beginRelease(): void {
		if ($session.phase !== 'aiming' || dockPhase !== 'docked' || pendingRelease) return;
		const r = releaseInput(performance.now() - t0);
		pendingRelease = { x: r.x, input: r.input };
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
					Math.abs(predictedLandingX(performance.now() - t0) - target.x) <
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
			if ($session.phase === 'aiming' && !pendingRelease) {
				trolleyPos = trolleyX(performance.now() - t0);
			}
			trolleyRaf = requestAnimationFrame(trolleyLoop);
		};
		trolleyRaf = requestAnimationFrame(trolleyLoop);
		newMatch();
		return () => {
			cancelAnimationFrame(raf);
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
	style="--sway-t: {CRANE_SWAY_MS}ms; --anticipation-t: {CRANE_DROP_ANTICIPATION_MS}ms; --overlay-in: {OVERLAY_IN_MS}ms; --pop: {EASE_POP}"
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

	{#if hanging && dockPhase === 'docked'}
		<g pointer-events="none">
			<rect x={hangX - 16} y="84" width="32" height="18" rx="6" fill="var(--rope)" />
			<circle cx={hangX - 8} cy="104" r="3.5" fill="var(--ink)" opacity="0.6" />
			<circle cx={hangX + 8} cy="104" r="3.5" fill="var(--ink)" opacity="0.6" />
			<g class="hang" class:dip={pendingRelease !== null}>
				<line x1={hangX} y1="100" x2={hangX} y2={HOOK_Y + 2} stroke="var(--rope)" stroke-width="3" />
				<path
					d="M {hangX} {HOOK_Y - 2} q 0 10 -6 10"
					fill="none"
					stroke="var(--rope)"
					stroke-width="4"
					stroke-linecap="round"
				/>
				<g transform="translate({hangX} {HOOK_Y + hangOffset})">
					<CargoArt id={hanging.id} />
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
		animation: sway var(--sway-t) ease-in-out infinite alternate;
		transform-box: fill-box;
		transform-origin: top center;
		transition: translate var(--anticipation-t) ease-in;
	}
	.hang.dip {
		translate: 0 8px;
	}
	@keyframes sway {
		from {
			rotate: -2.5deg;
		}
		to {
			rotate: 2.5deg;
		}
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
		.hang,
		.splash,
		.card {
			animation: none;
		}
	}
</style>
