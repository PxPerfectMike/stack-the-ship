<script lang="ts">
	// The vessel. Geometry contract: deck top at WORLD.deckY, rails exactly on
	// the physics lips. Hull ends at its actual edges (slight bow/stern rake)
	// so overboard spills visibly miss the boat — the ship is comically small
	// for its job. Pure scenery.
	import { WORLD } from '$lib/game/rules';

	let { name }: { name: string } = $props();
</script>

<g pointer-events="none">
	<!-- hull: raked stern left, raked bow right -->
	<path d="M 36 760 L 538 760 L 518 880 L 52 880 Z" fill="var(--hull)" />
	<rect x="36" y={WORLD.deckY} width="502" height="8" fill="var(--ship-deck)" />
	<path d="M 48.3 852 L 522.7 852 L 518 880 L 52 880 Z" fill="var(--hull-dark)" />
	<!-- weld seams -->
	<line x1="150" y1="775" x2="150" y2="852" stroke="var(--hull-dark)" stroke-width="2" opacity="0.3" />
	<line x1="330" y1="775" x2="330" y2="852" stroke="var(--hull-dark)" stroke-width="2" opacity="0.3" />
	<!-- portholes -->
	{#each [258, 320, 382, 444] as x (x)}
		<circle cx={x} cy="824" r="7" fill="var(--hull-dark)" />
		<circle cx={x} cy="824" r="4" fill="var(--sky-bottom)" opacity="0.85" />
	{/each}
	<!-- pilot cab on the bow, white with a roof and mast -->
	<rect x="517" y="670" width="5" height="24" rx="2" fill="var(--hull-dark)" />
	<rect x="517" y="670" width="5" height="7" rx="2" fill="#e8b84b" />
	<rect x="502" y="700" width="34" height="60" rx="4" fill="#f4f1e8" />
	<rect x="506" y="708" width="26" height="14" rx="2" fill="#2b3a44" />
	<rect x="524" y="736" width="9" height="24" rx="2" fill="#d8d2c2" />
	<rect x="502" y="752" width="34" height="8" fill="var(--hull)" />
	<rect x="500" y="694" width="38" height="8" rx="3" fill="#d8d2c2" />
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
