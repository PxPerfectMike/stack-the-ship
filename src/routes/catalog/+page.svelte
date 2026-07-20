<script lang="ts">
	// Dev-only QA route: renders every cargo item at true scale (guide 01).
	import { CARGO } from '$lib/game/cargo';
</script>

<div class="grid">
	{#each CARGO as def (def.id)}
		<figure>
			<svg
				viewBox="{-def.w / 2 - 10} {-def.h / 2 - 10} {def.w + 20} {def.h + 20}"
				width={def.w + 20}
				height={def.h + 20}
			>
				{#each def.parts as p, j (j)}
					{#if p.kind === 'rect'}
						<rect x={p.x - p.w / 2} y={p.y - p.h / 2} width={p.w} height={p.h} fill="#d9a066" stroke="#7a4a22" />
					{:else}
						<circle cx={p.x} cy={p.y} r={p.r} fill="#d9a066" stroke="#7a4a22" />
					{/if}
				{/each}
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
	}
	figcaption {
		font: 13px system-ui, sans-serif;
	}
</style>
