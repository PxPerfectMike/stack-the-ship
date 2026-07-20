<script lang="ts">
	import { onMount } from 'svelte';
	import { hashString, mulberry32 } from '$engine/rng';
	import { CRANE_POINT, arcPreview, dragToVelocity, type TossInput } from '$lib/game/aim';
	import { planBotToss } from '$lib/game/bot';
	import { getCargo } from '$lib/game/cargo';
	import { WORLD } from '$lib/game/rules';
	import {
		advance,
		applyToss,
		bodyShapes,
		createSim,
		newRunState,
		restState,
		spawnCargo,
		type PartShape,
		type Sim
	} from '$lib/game/physics/sim';
	import { beginSimulating, resolveToss, session, startMatch } from '$lib/game/store';

	let sim: Sim = createSim();
	let view = $state<{ cargoId: string; parts: PartShape[] }[]>([]);
	let drag = $state<{ dx: number; dy: number } | null>(null);
	let raf = 0;
	let fast = 1;
	let botRng = mulberry32(1);
	let svgEl: SVGSVGElement;

	const preview = $derived(drag ? arcPreview(dragToVelocity(drag.dx, drag.dy)) : []);
	const hanging = $derived($session.phase === 'aiming' ? getCargo($session.currentCargo) : null);

	function syncView(): void {
		view = bodyShapes(sim);
	}

	function newMatch(): void {
		const params = new URLSearchParams(location.search);
		const seed = params.get('seed') ?? `solo-${Date.now()}`;
		fast = params.get('fast') ? 4 : 1;
		const difficulty = Number(params.get('difficulty') ?? 1) as 1 | 2 | 3;
		sim = createSim();
		botRng = mulberry32(hashString(`${seed}:bot`));
		startMatch({ seed, difficulty, gentle: params.get('gentle') === '1' });
		syncView();
	}

	function doToss(input: TossInput): void {
		const body = spawnCargo(sim, $session.currentCargo, CRANE_POINT.x, CRANE_POINT.y);
		applyToss(body, input);
		beginSimulating();
		const rs = newRunState();
		const loop = (): void => {
			advance(sim, rs, fast);
			syncView();
			if (rs.done) {
				resolveToss(restState(sim));
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

	{#each view as b, i (i)}
		<g>
			{#each b.parts as p, j (j)}
				{#if p.kind === 'poly'}
					<polygon points={p.points} fill="#d9a066" stroke="#7a4a22" />
				{:else}
					<circle cx={p.cx} cy={p.cy} r={p.r} fill="#d9a066" stroke="#7a4a22" />
				{/if}
			{/each}
		</g>
	{/each}

	{#if hanging}
		<g transform="translate({CRANE_POINT.x} {CRANE_POINT.y})" opacity="0.9">
			{#each hanging.parts as p, j (j)}
				{#if p.kind === 'rect'}
					<rect x={p.x - p.w / 2} y={p.y - p.h / 2} width={p.w} height={p.h} fill="#e8c17a" stroke="#7a4a22" />
				{:else}
					<circle cx={p.x} cy={p.y} r={p.r} fill="#e8c17a" stroke="#7a4a22" />
				{/if}
			{/each}
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
