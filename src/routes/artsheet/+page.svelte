<script lang="ts">
	// Art review sheet (dev-only): every cargo item plus the major scene pieces
	// on one full-width page, switchable per palette, so style cohesion can be
	// judged at a glance (guide 04 — look at the screenshot).
	import CargoArt from '$lib/components/game/CargoArt.svelte';
	import Crane from '$lib/components/game/Crane.svelte';
	import Dock from '$lib/components/game/Dock.svelte';
	import GullArt from '$lib/components/game/GullArt.svelte';
	import Ship from '$lib/components/game/Ship.svelte';
	import { CARGO } from '$lib/game/cargo';
	import { HOOK_Y } from '$lib/game/swing';
	import { WORLD } from '$lib/game/rules';

	const SCALE = 1.5;
	const PAD = 16;
	const TODS = ['day', 'dusk', 'night'] as const;

	let tod = $state<'day' | 'dusk' | 'night'>('day');
	let ghosts = $state(false);

	const hangDef = CARGO[0];
	const hangX = 300;
</script>

<div class="sheet tod-{tod} wx-clear">
	<header>
		<h1>Stack the Ship — art sheet</h1>
		<div class="controls">
			{#each TODS as t (t)}
				<button class:active={tod === t} onclick={() => (tod = t)}>{t}</button>
			{/each}
			<label><input type="checkbox" bind:checked={ghosts} /> physics ghosts</label>
		</div>
	</header>

	<h2>Cargo manifest — {CARGO.length} items <small>(true relative scale ×{SCALE})</small></h2>
	<div class="grid">
		{#each CARGO as def (def.id)}
			<figure>
				<svg
					viewBox="{-def.w / 2 - PAD} {-def.h / 2 - PAD} {def.w + PAD * 2} {def.h + PAD * 2}"
					width={(def.w + PAD * 2) * SCALE}
					height={(def.h + PAD * 2) * SCALE}
				>
					<rect
						x={-def.w / 2 - PAD}
						y={def.h / 2 + 2}
						width={def.w + PAD * 2}
						height="6"
						fill="var(--ship-deck)"
					/>
					{#if ghosts}
						{#each def.parts as p, j (j)}
							{#if p.kind === 'rect'}
								<rect
									x={p.x - p.w / 2}
									y={p.y - p.h / 2}
									width={p.w}
									height={p.h}
									fill="#ff2fa0"
									opacity="0.25"
								/>
							{:else}
								<circle cx={p.x} cy={p.y} r={p.r} fill="#ff2fa0" opacity="0.25" />
							{/if}
						{/each}
					{/if}
					<CargoArt id={def.id} />
				</svg>
				<figcaption><b>{def.name}</b> <code>{def.id}</code></figcaption>
			</figure>
		{/each}
	</div>

	<h2>Scene pieces</h2>
	<div class="pieces">
		<figure class="piece">
			<svg viewBox="16 630 542 290" width="600">
				<Ship name="MV Barely Adequate" />
				<rect x="16" y="886" width="542" height="34" fill="var(--water-deep)" />
			</svg>
			<figcaption><b>The ship</b> <code>Ship.svelte</code></figcaption>
		</figure>

		<figure class="piece">
			<svg viewBox="0 60 560 880" width="270" height="424">
				<Crane />
				<!-- static trolley + cable + hook + hanging item, as seen mid-game -->
				<rect x={hangX - 16} y="84" width="32" height="18" rx="6" fill="var(--rope)" />
				<circle cx={hangX - 8} cy="104" r="3.5" fill="var(--ink)" opacity="0.6" />
				<circle cx={hangX + 8} cy="104" r="3.5" fill="var(--ink)" opacity="0.6" />
				<line x1={hangX} y1="100" x2={hangX} y2={HOOK_Y + 2} stroke="var(--rope)" stroke-width="3" />
				<path
					d="M {hangX} {HOOK_Y - 2} q 0 10 -6 10"
					fill="none"
					stroke="var(--rope)"
					stroke-width="4"
					stroke-linecap="round"
				/>
				<g transform="translate({hangX} {HOOK_Y + hangDef.h / 2 + 12})">
					<CargoArt id={hangDef.id} />
				</g>
			</svg>
			<figcaption><b>Crane + trolley</b> <code>Crane.svelte</code></figcaption>
		</figure>

		<figure class="piece">
			<svg viewBox="0 890 540 70" width="540">
				<Dock />
			</svg>
			<figcaption><b>Foreground dock</b> <code>Dock.svelte</code></figcaption>
		</figure>

		<figure class="piece">
			<svg viewBox="-24 -30 48 36" width="144">
				<GullArt />
			</svg>
			<figcaption><b>Gull</b> <code>GullArt.svelte</code></figcaption>
		</figure>

		<figure class="piece">
			<svg viewBox="-40 -30 80 44" width="160">
				<g transform="translate(0 4)">
					<ellipse rx="16" ry="5" fill="none" stroke="var(--foam)" stroke-width="4" />
					<circle cx="-10" cy="-8" r="3" fill="var(--foam)" />
					<circle cx="8" cy="-11" r="2.4" fill="var(--foam)" />
				</g>
			</svg>
			<figcaption><b>Splash</b> <small>(one frame)</small></figcaption>
		</figure>

		<figure class="piece">
			<svg viewBox="40 340 460 220" width="460">
				<rect x="60" y="356" width="420" height="190" rx="20" fill="var(--overlay-card)" />
				<text x={WORLD.width / 2} y="412" text-anchor="middle" class="card-title">Overboard.</text>
				<text x={WORLD.width / 2} y="446" text-anchor="middle" class="card-sub">
					The sea has your grand piano now.
				</text>
				<rect x={WORLD.width / 2 - 92} y="472" width="184" height="52" rx="14" fill="var(--crane)" />
				<text x={WORLD.width / 2} y="506" text-anchor="middle" class="card-btn">Next ship</text>
			</svg>
			<figcaption><b>Result card</b></figcaption>
		</figure>
	</div>
</div>

<style>
	:global(html, body) {
		margin: 0;
	}
	.sheet {
		min-height: 100vh;
		padding: 20px 32px 80px;
		background: linear-gradient(var(--sky-top), var(--sky-bottom));
		color: var(--ink);
		font-family: system-ui, sans-serif;
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 12px;
	}
	h1 {
		font-size: 22px;
		margin: 0;
	}
	h2 {
		font-size: 16px;
		margin: 28px 0 12px;
		opacity: 0.85;
	}
	.controls {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
	}
	.controls button {
		font: 600 14px system-ui, sans-serif;
		padding: 6px 14px;
		border-radius: 10px;
		border: 2px solid var(--ink);
		background: transparent;
		color: var(--ink);
		cursor: pointer;
		opacity: 0.6;
	}
	.controls button.active {
		opacity: 1;
		background: var(--overlay-card);
		color: #17323f;
	}
	.controls label {
		margin-left: 10px;
		user-select: none;
	}
	.grid {
		display: flex;
		flex-wrap: wrap;
		gap: 14px;
		align-items: flex-end;
	}
	figure {
		margin: 0;
		padding: 10px 12px;
		border-radius: 14px;
		background: color-mix(in srgb, var(--overlay-card) 18%, transparent);
		text-align: center;
	}
	figcaption {
		font-size: 13px;
		margin-top: 6px;
	}
	figcaption code {
		opacity: 0.6;
		font-size: 11px;
	}
	.pieces {
		display: flex;
		flex-wrap: wrap;
		gap: 18px;
		align-items: flex-end;
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
</style>
