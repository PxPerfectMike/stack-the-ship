<script lang="ts">
	import { onMount } from 'svelte';
	import { hashString, mulberry32 } from '$engine/rng';
	import { CRANE_POINT, arcPreview, dragToVelocity, type TossInput } from '$lib/game/aim';
	import { planBotToss } from '$lib/game/bot';
	import { getCargo } from '$lib/game/cargo';
	import { WORLD } from '$lib/game/rules';
	import CargoArt from '$lib/components/game/CargoArt.svelte';
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
	import { emit } from '$lib/game/events';
	import { isOverboard } from '$lib/game/rules';
	import { beginSimulating, resolveToss, session, startMatch } from '$lib/game/store';

	let sim: Sim = createSim();
	let view = $state<CargoPose[]>([]);
	let debugView = $state<{ cargoId: string; parts: PartShape[] }[]>([]);
	let debug = $state(false);
	let drag = $state<{ dx: number; dy: number } | null>(null);
	let raf = 0;
	let fast = 1;
	let botRng = mulberry32(1);
	let svgEl: SVGSVGElement;

	const preview = $derived(drag ? arcPreview(dragToVelocity(drag.dx, drag.dy)) : []);
	const hanging = $derived($session.phase === 'aiming' ? getCargo($session.currentCargo) : null);

	function syncView(): void {
		view = bodyPoses(sim);
		if (debug) debugView = bodyShapes(sim);
	}

	let tossImpacted = false;

	function newMatch(): void {
		const params = new URLSearchParams(location.search);
		const seed = params.get('seed') ?? `solo-${Date.now()}`;
		fast = params.get('fast') ? 4 : 1;
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
		startMatch({ seed, difficulty, gentle: params.get('gentle') === '1' });
		syncView();
		emit('match-reset');
	}

	function doToss(input: TossInput): void {
		const body = spawnCargo(sim, $session.currentCargo, CRANE_POINT.x, CRANE_POINT.y);
		applyToss(body, input);
		beginSimulating();
		tossImpacted = false;
		emit('toss-launched');
		const rs = newRunState();
		const loop = (): void => {
			advance(sim, rs, fast);
			syncView();
			if (rs.done) {
				const rest = restState(sim);
				emit(isOverboard(rest) ? 'spill' : 'settled');
				resolveToss(rest);
			} else {
				raf = requestAnimationFrame(loop);
			}
		};
		raf = requestAnimationFrame(loop);
	}

	function svgPoint(e: PointerEvent): { x: number; y: number } {
		const r = svgEl.getBoundingClientRect();
		return {
			x: ((e.clientX - r.left) / r.width) * WORLD.width,
			y: ((e.clientY - r.top) / r.height) * WORLD.height
		};
	}

	let dragStart: { x: number; y: number } | null = null;

	function onDown(e: PointerEvent): void {
		if ($session.phase !== 'aiming' || $session.active !== 0) return;
		dragStart = svgPoint(e);
		drag = { dx: 0, dy: 0 };
		svgEl.setPointerCapture(e.pointerId);
	}
	function onMove(e: PointerEvent): void {
		if (!dragStart) return;
		const p = svgPoint(e);
		drag = { dx: p.x - dragStart.x, dy: p.y - dragStart.y };
	}
	function onUp(): void {
		if (!dragStart || !drag) return;
		const input = dragToVelocity(drag.dx, drag.dy);
		dragStart = null;
		drag = null;
		doToss(input);
	}

	$effect(() => {
		if ($session.phase === 'aiming' && $session.active === 1) {
			const t = setTimeout(() => {
				doToss(planBotToss($session.rest, $session.difficulty, botRng));
			}, 700 / fast);
			return () => clearTimeout(t);
		}
	});

	onMount(() => {
		newMatch();
		return () => cancelAnimationFrame(raf);
	});
</script>

<svg
	bind:this={svgEl}
	viewBox="0 0 {WORLD.width} {WORLD.height}"
	role="application"
	aria-label="Stack the Ship game"
	onpointerdown={onDown}
	onpointermove={onMove}
	onpointerup={onUp}
>
	<!-- placeholder backdrop: sky, sea, deck. Real diorama arrives in Plan 2. -->
	<rect width={WORLD.width} height={WORLD.height} fill="#bfe3f2" />
	<rect y={WORLD.waterlineY} width={WORLD.width} height={WORLD.height - WORLD.waterlineY} fill="#2e6f8e" />
	<rect
		x={WORLD.deckLeft}
		y={WORLD.deckY}
		width={WORLD.deckRight - WORLD.deckLeft}
		height={WORLD.waterlineY - WORLD.deckY}
		fill="#8a5a3b"
	/>
	<rect x={WORLD.deckLeft} y={WORLD.deckY - WORLD.lipH} width={WORLD.lipW} height={WORLD.lipH} fill="#8a5a3b" />
	<rect x={WORLD.deckRight - WORLD.lipW} y={WORLD.deckY - WORLD.lipH} width={WORLD.lipW} height={WORLD.lipH} fill="#8a5a3b" />

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

	{#if hanging}
		<g transform="translate({CRANE_POINT.x} {CRANE_POINT.y})" opacity="0.95">
			<CargoArt id={hanging.id} />
		</g>
		<text x={WORLD.width / 2} y="60" text-anchor="middle" class="label">
			{hanging.name} — {$session.active === 0 ? 'your toss' : 'Dockmaster is aiming…'}
		</text>
	{/if}

	{#each preview as pt, i (i)}
		<circle cx={pt.x} cy={pt.y} r="4" fill="#1a3a4a" opacity="0.55" />
	{/each}

	{#if $session.phase === 'over'}
		<rect width={WORLD.width} height={WORLD.height} fill="#00000088" />
		<text x={WORLD.width / 2} y="420" text-anchor="middle" class="big">
			{$session.loser === 0 ? 'Overboard! The Dockmaster wins.' : 'The Dockmaster spilled it. You win!'}
		</text>
		<g onpointerdown={newMatch} role="button" tabindex="-1" style="cursor: pointer;">
			<rect x={WORLD.width / 2 - 90} y="470" width="180" height="56" rx="12" fill="#e8c17a" />
			<text x={WORLD.width / 2} y="505" text-anchor="middle" class="label">Rematch</text>
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
		fill: #123;
	}
	.big {
		font: 28px system-ui, sans-serif;
		fill: #fff;
	}
</style>
