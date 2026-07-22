<script lang="ts">
	// Foreground dock the viewer stands on. Pure scenery.
	import { WORLD } from '$lib/game/rules';
</script>

<g pointer-events="none">
	{#each [90, 270, 450] as x (x)}
		<rect x={x - 8} y="902" width="16" height="26" rx="3" fill="var(--dock-dark)" />
		<rect x={x - 10} y="900" width="20" height="6" rx="3" fill="var(--dock-dark)" />
	{/each}
	<rect y="920" width={WORLD.width} height="40" fill="var(--dock)" />
	<rect y="920" width={WORLD.width} height="5" fill="var(--dock-dark)" />
	{#each [68, 136, 204, 272, 340, 408, 476] as x (x)}
		<rect x={x} y="928" width="3" height="32" fill="var(--dock-dark)" opacity="0.45" />
	{/each}
</g>
