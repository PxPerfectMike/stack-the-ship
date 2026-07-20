<script lang="ts">
	// Flat DWTD-style cargo art, drawn in def-local coordinates (origin = def
	// centre, matching src/lib/game/cargo.ts physics silhouettes). Silhouette
	// first; faces on the pig only (spec §1).
	let { id }: { id: string } = $props();
</script>

{#if id === 'crate'}
	<g>
		<rect x="-30" y="-30" width="60" height="60" rx="4" fill="#e3a857" />
		<rect x="-30" y="-30" width="60" height="12" rx="4" fill="#f0bc6e" />
		<rect x="-30" y="-30" width="60" height="60" rx="4" fill="none" stroke="#c98c3f" stroke-width="3" />
		<line x1="-30" y1="-10" x2="30" y2="-10" stroke="#c98c3f" stroke-width="3" />
		<line x1="-30" y1="10" x2="30" y2="10" stroke="#c98c3f" stroke-width="3" />
	</g>
{:else if id === 'barrel'}
	<g>
		<rect x="-25" y="-33" width="50" height="66" rx="14" fill="#5b8dbe" />
		<rect x="-25" y="-14" width="50" height="6" fill="#47709a" />
		<rect x="-25" y="8" width="50" height="6" fill="#47709a" />
		<rect x="-18" y="-26" width="7" height="52" rx="3.5" fill="#74a3cd" />
	</g>
{:else if id === 'tire'}
	<g>
		<circle r="28" fill="#3a3f47" />
		<circle r="27" fill="none" stroke="#2a2e34" stroke-width="4" stroke-dasharray="6 5" />
		<circle r="12" fill="#6b7683" />
		<circle r="5" fill="#3a3f47" />
	</g>
{:else if id === 'plank'}
	<g>
		<rect x="-80" y="-9" width="160" height="18" rx="6" fill="#d9a066" />
		<line x1="-62" y1="-2" x2="-14" y2="-2" stroke="#c08a52" stroke-width="2.5" stroke-linecap="round" />
		<line x1="6" y1="3" x2="60" y2="3" stroke="#c08a52" stroke-width="2.5" stroke-linecap="round" />
	</g>
{:else if id === 'piano'}
	<g>
		<rect x="-56" y="15" width="12" height="30" fill="#16181c" />
		<rect x="44" y="15" width="12" height="30" fill="#16181c" />
		<rect x="-60" y="-45" width="120" height="60" rx="8" fill="#23262b" />
		<rect x="-60" y="1" width="120" height="14" fill="#16181c" />
		<rect x="-54" y="3" width="108" height="10" rx="2" fill="#f4f1e8" />
		<g fill="#23262b">
			<rect x="-46" y="3" width="5" height="6" />
			<rect x="-32" y="3" width="5" height="6" />
			<rect x="-18" y="3" width="5" height="6" />
			<rect x="-4" y="3" width="5" height="6" />
			<rect x="10" y="3" width="5" height="6" />
			<rect x="24" y="3" width="5" height="6" />
			<rect x="38" y="3" width="5" height="6" />
		</g>
		<rect x="-52" y="-38" width="104" height="5" rx="2.5" fill="#3d424a" />
	</g>
{:else if id === 'moai'}
	<g>
		<rect x="-25" y="-50" width="50" height="20" rx="8" fill="#75828d" />
		<rect x="-35" y="-30" width="70" height="80" rx="18" fill="#8e9ba6" />
		<rect x="-28" y="-18" width="56" height="10" rx="5" fill="#6d7a85" />
		<rect x="-7" y="-14" width="14" height="34" rx="6" fill="#7c8994" />
		<rect x="-24" y="28" width="48" height="7" rx="3.5" fill="#6d7a85" />
	</g>
{:else if id === 'bathtub'}
	<g>
		<rect x="-55" y="-25" width="12" height="40" rx="5" fill="#eef2f4" stroke="#9fb3bd" stroke-width="2.5" />
		<rect x="43" y="-25" width="12" height="40" rx="5" fill="#eef2f4" stroke="#9fb3bd" stroke-width="2.5" />
		<rect x="-55" y="9" width="110" height="16" rx="7" fill="#eef2f4" stroke="#9fb3bd" stroke-width="2.5" />
		<rect x="-49" y="11" width="98" height="5" rx="2.5" fill="#bfd0d8" />
		<circle cx="-49" cy="-22" r="4.5" fill="#8fa3ad" />
		<rect x="-52" y="-20" width="6" height="9" rx="2" fill="#8fa3ad" />
	</g>
{:else if id === 'wardrobe'}
	<g>
		<rect x="-35" y="-65" width="70" height="130" rx="6" fill="#9c6b4f" />
		<rect x="-35" y="-65" width="70" height="8" rx="4" fill="#b07e5f" />
		<rect x="-29" y="-53" width="26" height="112" rx="4" fill="#b07e5f" />
		<rect x="3" y="-53" width="26" height="112" rx="4" fill="#b07e5f" />
		<circle cx="-7" cy="0" r="3" fill="#5e3f2e" />
		<circle cx="9" cy="0" r="3" fill="#5e3f2e" />
	</g>
{:else if id === 'anchor'}
	<g>
		<circle cx="0" cy="-40" r="7" fill="none" stroke="#35507a" stroke-width="5" />
		<rect x="-8" y="-45" width="16" height="60" rx="6" fill="#35507a" />
		<rect x="-22" y="-22" width="44" height="7" rx="3.5" fill="#35507a" />
		<path d="M -40 20 Q -40 37 -18 37 L 18 37 Q 40 37 40 20 L 40 14 Q 30 26 14 26 L -14 26 Q -30 26 -40 14 Z" fill="#35507a" />
	</g>
{:else if id === 'beachball'}
	<g>
		<circle r="26" fill="#f6f2ea" />
		<path d="M 0 -26 A 26 26 0 0 1 22.5 13 L 0 0 Z" fill="#e8574b" />
		<path d="M 0 -26 A 26 26 0 0 0 -22.5 13 L 0 0 Z" fill="#3f88c5" />
		<path d="M -22.5 13 A 26 26 0 0 0 22.5 13 L 0 0 Z" fill="#f2c14e" />
		<circle r="26" fill="none" stroke="#dcd6ca" stroke-width="2" />
		<circle cx="-9" cy="-12" r="5" fill="#ffffff" opacity="0.8" />
	</g>
{:else if id === 'pig'}
	<g>
		<rect x="-40" y="-18" width="64" height="44" rx="18" fill="#f2a7b3" />
		<rect x="-34" y="18" width="10" height="8" rx="4" fill="#e08999" />
		<rect x="8" y="18" width="10" height="8" rx="4" fill="#e08999" />
		<path d="M -40 -6 Q -48 -2 -44 6 Q -38 8 -38 0" fill="none" stroke="#e08999" stroke-width="3" stroke-linecap="round" />
		<rect x="18" y="-21" width="24" height="26" rx="10" fill="#f2a7b3" />
		<path d="M 20 -21 L 24 -30 L 30 -22 Z" fill="#e08999" />
		<path d="M 34 -21 L 40 -29 L 42 -19 Z" fill="#e08999" />
		<rect x="34" y="-8" width="12" height="9" rx="4" fill="#e08999" />
		<circle cx="37.5" cy="-4" r="1.4" fill="#8f5561" />
		<circle cx="42.5" cy="-4" r="1.4" fill="#8f5561" />
		<circle cx="26" cy="-11" r="2.6" fill="#2b2024" />
		<circle cx="27" cy="-12" r="0.9" fill="#ffffff" />
		<line x1="22" y1="-16" x2="29" y2="-15" stroke="#c97f8e" stroke-width="2" stroke-linecap="round" />
	</g>
{:else if id === 'sink'}
	<g>
		<rect x="-37" y="-23" width="14" height="26" rx="5" fill="#aab9c2" stroke="#7e929e" stroke-width="2" />
		<rect x="23" y="-23" width="14" height="26" rx="5" fill="#aab9c2" stroke="#7e929e" stroke-width="2" />
		<path d="M -30 -20 Q -30 -32 0 -32 Q 30 -32 30 -20" fill="none" stroke="#8fa3ad" stroke-width="5" stroke-linecap="round" />
		<rect x="-38" y="2" width="76" height="20" rx="8" fill="#eef2f4" stroke="#9fb3bd" stroke-width="2.5" />
		<circle cx="0" cy="12" r="3.5" fill="#7e929e" />
	</g>
{/if}
