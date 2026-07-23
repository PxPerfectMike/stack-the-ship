<script lang="ts">
	// Dev-only QA route: renders every cargo item's art at true scale over its
	// physics silhouette ghost (guide 01/04).
	import CargoArt from '$lib/components/game/CargoArt.svelte';
	import { CARGO } from '$lib/game/cargo';
</script>

<div class="grid tod-day">
	{#each CARGO as def (def.id)}
		<figure>
			<svg
				viewBox="{-def.w / 2 - 14} {-def.h / 2 - 14} {def.w + 28} {def.h + 28}"
				width={def.w + 28}
				height={def.h + 28}
			>
				{#each def.parts as p, j (j)}
					{#if p.kind === 'rect'}
						<rect x={p.x - p.w / 2} y={p.y - p.h / 2} width={p.w} height={p.h} fill="#dfe9ef" />
					{:else if p.kind === 'circle'}
						<circle cx={p.x} cy={p.y} r={p.r} fill="#dfe9ef" />
					{:else}
						<polygon points={p.verts.map((v) => `${v.x},${v.y}`).join(' ')} fill="#dfe9ef" />
					{/if}
				{/each}
				<CargoArt id={def.id} />
				<CargoArt id={def.id} overlay />
			</svg>
			<figcaption>{def.name} <small>d={def.density} r={def.restitution}</small></figcaption>
		</figure>
	{/each}
</div>

<style>
	.grid {
		display: flex;
		flex-wrap: wrap;
		gap: 24px;
		padding: 24px;
		align-items: flex-end;
		background: #f3f7f9;
		min-height: 100vh;
	}
	figcaption {
		font: 13px system-ui, sans-serif;
	}
</style>
