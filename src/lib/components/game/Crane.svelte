<script lang="ts">
	// Dockside gantry crane — static structure only; the moving trolley, cable,
	// and hook live in GameScene. Pure scenery.
	import { WORLD } from '$lib/game/rules';
</script>

<g pointer-events="none">
	<rect x="12" y="96" width="15" height="832" fill="var(--crane)" />
	<rect x="12" y="300" width="15" height="10" fill="var(--rope)" opacity="0.5" />
	<rect x="12" y="520" width="15" height="10" fill="var(--rope)" opacity="0.5" />
	<line x1="27" y1="130" x2="130" y2="97" stroke="var(--crane)" stroke-width="7" />
	<rect x={WORLD.deckLeft - 34} y="86" width="530" height="14" rx="7" fill="var(--crane)" />
	<rect x="0" y="78" width="48" height="20" rx="7" fill="var(--crane)" />
	<rect x="4" y="120" width="34" height="26" rx="5" fill="var(--rope)" />
</g>
