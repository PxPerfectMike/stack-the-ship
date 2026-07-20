<script lang="ts">
	// The vessel. Geometry contract: deck top at WORLD.deckY, rails exactly on
	// the physics lips, hull cropped past both frame edges (guide 03 — crop
	// sells scale). Pure scenery.
	import { WORLD } from '$lib/game/rules';

	let { name }: { name: string } = $props();
</script>

<g pointer-events="none">
	<!-- hull -->
	<rect x="-60" y={WORLD.deckY} width="690" height={WORLD.waterlineY - WORLD.deckY} fill="var(--hull)" />
	<rect x="-60" y={WORLD.deckY} width="690" height="8" fill="var(--ship-deck)" />
	<rect x="-60" y="852" width="690" height="28" fill="var(--hull-dark)" />
	<!-- weld seams -->
	<line x1="150" y1="775" x2="150" y2="852" stroke="var(--hull-dark)" stroke-width="2" opacity="0.3" />
	<line x1="330" y1="775" x2="330" y2="852" stroke="var(--hull-dark)" stroke-width="2" opacity="0.3" />
	<!-- portholes -->
	{#each [258, 320, 382, 444] as x (x)}
		<circle cx={x} cy="824" r="7" fill="var(--hull-dark)" />
		<circle cx={x} cy="824" r="4" fill="var(--sky-bottom)" opacity="0.85" />
	{/each}
	<!-- rails: visual twins of the physics lips -->
	<rect
		x={WORLD.deckLeft}
		y={WORLD.deckY - WORLD.lipH}
		width={WORLD.lipW}
		height={WORLD.lipH}
		rx="3"
		fill="var(--hull-dark)"
	/>
	<rect
		x={WORLD.deckRight - WORLD.lipW}
		y={WORLD.deckY - WORLD.lipH}
		width={WORLD.lipW}
		height={WORLD.lipH}
		rx="3"
		fill="var(--hull-dark)"
	/>
	<!-- wheelhouse, mostly cropped off the right edge -->
	<rect x="508" y="694" width="90" height="66" rx="5" fill="#f4f1e8" />
	<rect x="516" y="706" width="18" height="13" rx="2" fill="#2b3a44" />
	<rect x="516" y="734" width="30" height="6" rx="3" fill="#d8d2c2" />
	<rect x="544" y="662" width="15" height="34" rx="4" fill="var(--hull-dark)" />
	<rect x="544" y="662" width="15" height="8" rx="4" fill="#e8b84b" />
	<!-- name plate on the bow -->
	<rect x="58" y="790" width="164" height="27" rx="7" fill="#f4f1e8" />
	<text x="140" y="809" text-anchor="middle" class="plate">{name}</text>
</g>

<style>
	.plate {
		font: 700 13px system-ui, sans-serif;
		fill: #17323f;
		letter-spacing: 0.02em;
	}
</style>
