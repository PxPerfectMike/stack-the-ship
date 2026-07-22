<script lang="ts">
	// Flat DWTD-style cargo art, drawn in def-local coordinates (origin = def
	// centre, matching src/lib/game/cargo.ts physics silhouettes). Deadpan
	// objects; a chosen few are alive (pig, moai, duck, gnome) — spec §1.
	let { id }: { id: string } = $props();

	// disco ball facet grid (clipped to the sphere)
	const DISCO_ROWS = [-25, -16.5, -8, 0.5, 9, 17.5];
	const DISCO_COLS = [-25.5, -17, -8.5, 0, 8.5, 17];
	const DISCO_SHADES = ['#c3d2e0', '#8b9cb0', '#a9bccd'];
</script>

{#if id === 'crate'}
	<g>
		<rect x="-30" y="-30" width="60" height="60" rx="3" fill="#e3a857" />
		<line x1="-25" y1="-25" x2="25" y2="25" stroke="#f0bc6e" stroke-width="11" />
		<line x1="25" y1="-25" x2="-25" y2="25" stroke="#f0bc6e" stroke-width="11" />
		<rect x="-30" y="-30" width="60" height="60" rx="3" fill="none" stroke="#c98c3f" stroke-width="6" />
		{#each [-24, 24] as nx (nx)}
			{#each [-24, 24] as ny (ny)}
				<circle cx={nx} cy={ny} r="1.8" fill="#8a5a24" />
			{/each}
		{/each}
	</g>
{:else if id === 'barrel'}
	<g>
		<rect x="-25" y="-33" width="50" height="66" rx="10" fill="#5b8dbe" />
		<rect x="-25" y="-33" width="50" height="9" rx="4.5" fill="#74a3cd" />
		<rect x="-25" y="-16" width="50" height="7" fill="#47709a" />
		<rect x="-25" y="9" width="50" height="7" fill="#47709a" />
		<rect x="-25" y="27" width="50" height="6" rx="3" fill="#3f6489" />
		<rect x="-17" y="-27" width="8" height="54" rx="4" fill="#79a8d2" />
		<rect x="-9" y="-7" width="18" height="13" rx="2" fill="#f4f1e8" />
		<line x1="-5" y1="-3" x2="5" y2="-3" stroke="#9fb3bd" stroke-width="1.6" stroke-linecap="round" />
		<line x1="-5" y1="1" x2="3" y2="1" stroke="#9fb3bd" stroke-width="1.6" stroke-linecap="round" />
	</g>
{:else if id === 'tire'}
	<g>
		<circle r="28" fill="#3a3f47" />
		<circle r="24.5" fill="none" stroke="#22262c" stroke-width="7" stroke-dasharray="7 6" />
		<circle r="17" fill="#4a5563" />
		<circle r="17" fill="none" stroke="#343c46" stroke-width="2" />
		<circle r="9" fill="#8a95a3" />
		<circle r="3" fill="#545e6b" />
		{#each [[0, -5.5], [5.2, -1.7], [3.2, 4.4], [-3.2, 4.4], [-5.2, -1.7]] as [bx, by], i (i)}
			<circle cx={bx} cy={by} r="1.5" fill="#545e6b" />
		{/each}
	</g>
{:else if id === 'plank'}
	<g>
		<rect x="-80" y="-9" width="160" height="18" rx="5" fill="#d9a066" />
		<rect x="-80" y="-9" width="160" height="6" rx="3" fill="#e4b078" />
		<rect x="-80" y="-9" width="5" height="18" rx="2.5" fill="#c08a52" />
		<rect x="75" y="-9" width="5" height="18" rx="2.5" fill="#c08a52" />
		<line x1="-64" y1="1" x2="-18" y2="1" stroke="#c08a52" stroke-width="2" stroke-linecap="round" />
		<line x1="2" y1="4" x2="52" y2="4" stroke="#c08a52" stroke-width="2" stroke-linecap="round" />
		<line x1="28" y1="-3" x2="64" y2="-3" stroke="#c08a52" stroke-width="2" stroke-linecap="round" />
		<circle cx="-38" cy="3" r="3" fill="#b47a45" />
		<circle cx="-38" cy="3" r="1.2" fill="#96612f" />
	</g>
{:else if id === 'piano'}
	<g>
		<rect x="-56" y="13" width="12" height="30" rx="2" fill="#16181c" />
		<rect x="44" y="13" width="12" height="30" rx="2" fill="#16181c" />
		<circle cx="-50" cy="42" r="3.5" fill="#3d424a" />
		<circle cx="50" cy="42" r="3.5" fill="#3d424a" />
		<rect x="-6" y="15" width="12" height="16" fill="#16181c" />
		<rect x="-13" y="28" width="26" height="5" rx="2.5" fill="#16181c" />
		{#each [-7, 0, 7] as px (px)}
			<rect x={px - 2} y="24" width="4" height="6" rx="2" fill="#c9a53f" />
		{/each}
		<rect x="-60" y="-45" width="120" height="60" rx="7" fill="#23262b" />
		<rect x="-52" y="-41" width="96" height="6" rx="3" fill="#383d45" />
		<rect x="-60" y="1" width="120" height="14" fill="#16181c" />
		<rect x="-54" y="1" width="108" height="3" fill="#b03a48" />
		<rect x="-54" y="4" width="108" height="10" rx="2" fill="#f4f1e8" />
		{#each [-48, -42, -30, -24, -18, -6, 0, 12, 18, 24, 36, 42] as kx (kx)}
			<rect x={kx} y="4" width="4" height="6" fill="#23262b" />
		{/each}
	</g>
{:else if id === 'moai'}
	<g>
		<path d="M -25 -30 L -25 -42 Q -25 -50 -16 -50 L 16 -50 Q 25 -50 25 -42 L 25 -30 Z" fill="#a5685c" />
		<rect x="-25" y="-35" width="50" height="5" fill="#8d564c" />
		<rect x="-35" y="-30" width="70" height="80" rx="12" fill="#8e9ba6" />
		<rect x="14" y="-28" width="19" height="76" rx="9" fill="#7c8994" />
		<rect x="-29" y="-16" width="58" height="10" rx="5" fill="#6d7a85" />
		<path d="M -5 -10 L 5 -10 L 11 20 Q 11 24 6 24 L -6 24 Q -11 24 -11 20 Z" fill="#7c8994" />
		<rect x="-11" y="20" width="22" height="4" rx="2" fill="#6d7a85" />
		<rect x="-26" y="-7" width="14" height="7" rx="3.5" fill="#5f6c77" />
		<rect x="12" y="-7" width="14" height="7" rx="3.5" fill="#5f6c77" />
		<circle cx="-22" cy="-3.5" r="1.6" fill="#2b3138" />
		<circle cx="14.5" cy="-3.5" r="1.6" fill="#2b3138" />
		<rect x="-13" y="32" width="26" height="4.5" rx="2.25" fill="#6d7a85" />
	</g>
{:else if id === 'bathtub'}
	<g>
		<rect x="-43" y="-5" width="86" height="20" fill="#7ec3d8" />
		<path d="M -43 -5 Q -36 -10 -29 -5 T -15 -5 T -1 -5 T 13 -5 T 27 -5 T 41 -5 L 43 -5"
			fill="none" stroke="#a5d8e8" stroke-width="3" stroke-linecap="round" />
		<circle cx="20" cy="-12" r="2.6" fill="#a5d8e8" />
		<circle cx="27" cy="-16" r="1.8" fill="#a5d8e8" />
		<rect x="-55" y="9" width="110" height="16" rx="7" fill="#eef2f4" stroke="#9fb3bd" stroke-width="2.5" />
		<rect x="-55" y="-25" width="12" height="40" rx="5" fill="#eef2f4" stroke="#9fb3bd" stroke-width="2.5" />
		<rect x="43" y="-25" width="12" height="40" rx="5" fill="#eef2f4" stroke="#9fb3bd" stroke-width="2.5" />
		<rect x="-54" y="-24" width="10" height="6" rx="3" fill="#ffffff" />
		<rect x="44" y="-24" width="10" height="6" rx="3" fill="#ffffff" />
		<circle cx="-49" cy="-18" r="4.5" fill="#8fa3ad" />
		<rect x="-45" y="-20" width="8" height="5" rx="2" fill="#8fa3ad" />
	</g>
{:else if id === 'wardrobe'}
	<g>
		<rect x="-35" y="-65" width="70" height="130" rx="5" fill="#9c6b4f" />
		<rect x="-35" y="-65" width="70" height="10" rx="5" fill="#b07e5f" />
		<rect x="-33" y="-56" width="66" height="4" fill="#7f5540" />
		<rect x="-35" y="55" width="70" height="10" rx="4" fill="#7f5540" />
		<path d="M -29 -38 Q -29 -50 -16 -50 Q -3 -50 -3 -38 L -3 50 L -29 50 Z" fill="#b07e5f" />
		<path d="M 29 -38 Q 29 -50 16 -50 Q 3 -50 3 -38 L 3 50 L 29 50 Z" fill="#b07e5f" />
		<circle cx="-7" cy="4" r="2.6" fill="#5e3f2e" />
		<circle cx="7" cy="4" r="2.6" fill="#5e3f2e" />
		<circle cx="7" cy="15" r="1.6" fill="#5e3f2e" />
		<rect x="6.2" y="15" width="1.6" height="5" fill="#5e3f2e" />
	</g>
{:else if id === 'anchor'}
	<g>
		<circle cx="0" cy="-38" r="7" fill="none" stroke="#35507a" stroke-width="5" />
		<rect x="-8" y="-45" width="16" height="60" rx="6" fill="#35507a" />
		<path d="M -8 -20 L 8 -16 M -8 -13 L 8 -9 M -8 -6 L 8 -2" stroke="#d9a066" stroke-width="4" stroke-linecap="round" />
		<rect x="-22" y="-26" width="44" height="7" rx="3.5" fill="#2c4265" />
		<path d="M -40 20 Q -40 37 -18 37 L 18 37 Q 40 37 40 20 L 40 14 Q 30 26 14 26 L -14 26 Q -30 26 -40 14 Z" fill="#35507a" />
		<path d="M -40 14 L -33 5 L -30 15 Z" fill="#35507a" />
		<path d="M 40 14 L 33 5 L 30 15 Z" fill="#35507a" />
	</g>
{:else if id === 'beachball'}
	<g>
		<circle r="26" fill="#f6f2ea" />
		<path d="M 0 -26 A 26 26 0 0 0 0 26 A 13 26 0 0 1 0 -26 Z" fill="#e8574b" />
		<path d="M 0 -26 A 26 26 0 0 1 0 26 A 13 26 0 0 0 0 -26 Z" fill="#3f88c5" />
		<path d="M 0 -26 A 15 26 0 0 1 0 26 A 15 26 0 0 1 0 -26 Z" fill="#f2c14e" />
		<circle r="26" fill="none" stroke="#dcd6ca" stroke-width="2" />
		<circle cx="-9" cy="-12" r="5" fill="#ffffff" opacity="0.85" />
	</g>
{:else if id === 'pig'}
	<g>
		<path d="M -39 -2 q -7 -5 -3 -9 q 4 -3 4 1 q 0 3 -3 2" fill="none" stroke="#e894a6" stroke-width="2.5" stroke-linecap="round" />
		<path
			d="M -40 8 Q -40 -18 -16 -18 L 10 -18 Q 14 -20.5 20 -21 Q 36 -21 40 -14 Q 42 -10 42 -4 Q 42 4 34 8 Q 26 12 18 14 Q 2 18 -10 18 Q -34 18 -39 12 Q -40 10 -40 8 Z"
			fill="#f4b3be"
		/>
		{#each [-35, -17, 1, 13] as lx (lx)}
			<rect x={lx} y="15" width="9" height="11" rx="4" fill="#f4b3be" />
		{/each}
		<path d="M 19 -19 Q 20 -27 25 -29 Q 28 -25 26 -18 Z" fill="#e894a6" />
		<path d="M 31 -18 Q 33 -27 38 -28 Q 40 -23 37 -16 Z" fill="#e894a6" />
		<ellipse cx="26" cy="-12" rx="1.9" ry="2.7" fill="#2b2024" />
		<ellipse cx="38" cy="-12" rx="1.9" ry="2.7" fill="#2b2024" />
		<rect x="29" y="-7" width="12" height="9" rx="4" fill="#e894a6" />
		<ellipse cx="33" cy="-2.5" rx="1.2" ry="2" fill="#c96b80" />
		<ellipse cx="37" cy="-2.5" rx="1.2" ry="2" fill="#c96b80" />
		<path d="M 14 -27 q 2.6 3.5 0 5.2 q -2.6 -1.7 0 -5.2 Z" fill="#7ec3d8" />
	</g>
{:else if id === 'sink'}
	<g>
		<rect x="-34" y="-23" width="8" height="26" rx="3" fill="#aab9c2" />
		<path d="M -30 -20 Q -30 -28 -21 -28 Q -13 -28 -13 -21" fill="none" stroke="#aab9c2" stroke-width="6" stroke-linecap="round" />
		<rect x="-16.5" y="-20" width="7" height="5" rx="2" fill="#8fa3ad" />
		<rect x="-38" y="-13" width="6" height="7" rx="2.5" fill="#8fa3ad" />
		<path d="M 23.5 -23 L 36.5 -23 Q 36.5 -17.5 30 -17.5 Q 23.5 -17.5 23.5 -23 Z" fill="#a8cfe0" />
		<rect x="23.5" y="-17.5" width="13" height="4" rx="2" fill="#e6e0d2" />
		<rect x="24.5" y="-13.5" width="12" height="4" rx="2" fill="#f4f1e8" />
		<rect x="23" y="-9.5" width="14" height="4" rx="2" fill="#e6e0d2" />
		<rect x="24" y="-5.5" width="13" height="4.5" rx="2" fill="#f4f1e8" />
		<g transform="rotate(10 10 0)">
			<rect x="8" y="-12" width="2.5" height="16" rx="1.2" fill="#8fa3ad" />
			<rect x="6.8" y="-16" width="1.5" height="5" rx="0.75" fill="#8fa3ad" />
			<rect x="8.8" y="-16" width="1.5" height="5" rx="0.75" fill="#8fa3ad" />
			<rect x="10.8" y="-16" width="1.5" height="5" rx="0.75" fill="#8fa3ad" />
		</g>
		<rect x="-38" y="2" width="76" height="20" rx="8" fill="#eef2f4" stroke="#9fb3bd" stroke-width="2.5" />
		<rect x="-32" y="5" width="64" height="6" rx="3" fill="#bfd0d8" />
		<circle cx="0" cy="15" r="3.2" fill="#7e929e" />
		<rect x="-26" y="-3" width="12" height="7" rx="2" fill="#f2c14e" />
		<rect x="-26" y="-3" width="12" height="3" rx="1.5" fill="#7bb661" />
	</g>
{:else if id === 'gnome'}
	<g>
		<path d="M -14 -10 Q -23 6 -23 26 L -23 38 L 23 38 L 23 26 Q 23 6 14 -10 Z" fill="#4a7fb5" />
		<rect x="-23" y="36" width="46" height="8" rx="3" fill="#3a3630" />
		<rect x="-20" y="20" width="40" height="7" fill="#3a3630" />
		<rect x="-4" y="19" width="8" height="9" rx="2" fill="#c9a53f" />
		<path d="M -16 -12 Q -20 8 0 14 Q 20 8 16 -12 Q 8 -6 0 -6 Q -8 -6 -16 -12 Z" fill="#f4f1e8" />
		<rect x="-11" y="-21" width="22" height="12" rx="6" fill="#f0c9a8" />
		<path d="M -8 -16.5 q 3 2.5 6 0" fill="none" stroke="#5a4632" stroke-width="1.8" stroke-linecap="round" />
		<path d="M 2 -16.5 q 3 2.5 6 0" fill="none" stroke="#5a4632" stroke-width="1.8" stroke-linecap="round" />
		<circle cx="0" cy="-10" r="4.5" fill="#e8a987" />
		<path d="M -13 -16 Q -6 -40 0 -44 Q 6 -40 13 -16 Z" fill="#d64545" />
		<rect x="-13" y="-18" width="26" height="5" rx="2.5" fill="#b93a3a" />
	</g>
{:else if id === 'duck'}
	<g>
		<rect x="-45" y="-13" width="90" height="52" rx="22" fill="#f7c948" />
		<ellipse cx="-8" cy="14" rx="17" ry="11" fill="#eab63a" />
		<circle cx="22" cy="-24" r="15" fill="#f7c948" />
		<rect x="36" y="-27" width="9" height="7" rx="3.5" fill="#f08c00" />
		<rect x="36" y="-21" width="6" height="4" rx="2" fill="#d87a00" />
		<circle cx="25" cy="-30" r="2.8" fill="#2b2024" />
		<circle cx="25.9" cy="-30.9" r="0.9" fill="#ffffff" />
	</g>
{:else if id === 'cone'}
	<g>
		<path d="M -9 -33 Q -9 -35 -7 -35 L 7 -35 Q 9 -35 9 -33 L 17 21 L -17 21 Z" fill="#f07818" />
		<polygon points="-12.7,-9 12.7,-9 14.3,2 -14.3,2" fill="#f4f1e8" />
		<polygon points="-15.1,8 15.1,8 16.3,16 -16.3,16" fill="#f4f1e8" />
		<rect x="-30" y="21" width="60" height="14" rx="4" fill="#d86510" />
		<rect x="-30" y="21" width="60" height="5" rx="2.5" fill="#f07818" />
	</g>
{:else if id === 'washer'}
	<g>
		<rect x="-35" y="-41" width="70" height="82" rx="8" fill="#eef2f4" stroke="#b9c6cd" stroke-width="2.5" />
		<rect x="-35" y="-41" width="70" height="14" rx="8" fill="#d7dfe3" />
		<rect x="-35" y="-34" width="70" height="7" fill="#d7dfe3" />
		<circle cx="-23" cy="-34" r="4" fill="#8fa3ad" />
		<line x1="-23" y1="-37.5" x2="-23" y2="-34" stroke="#5f7078" stroke-width="1.5" />
		<rect x="-10" y="-36" width="6" height="4" rx="1" fill="#8fa3ad" />
		<rect x="-1" y="-36" width="6" height="4" rx="1" fill="#8fa3ad" />
		<rect x="20" y="-37" width="12" height="6" rx="2" fill="#8fa3ad" />
		<rect x="-35" y="33" width="70" height="8" rx="4" fill="#d7dfe3" />
		<circle cx="0" cy="8" r="19" fill="#aab9c2" />
		<circle cx="0" cy="8" r="14" fill="#5f8ba3" />
		<path d="M 0 3 L 5 3 L 5 10 Q 5 14 1 14 L -2 14 Q -5 14 -5 11 Q -5 9 -2 9 L 0 9 Z" fill="#f4f1e8" />
		<rect x="0" y="3" width="5" height="2.5" fill="#d64545" />
		<circle cx="-7" cy="1" r="2.2" fill="#a5d8e8" />
		<circle cx="8" cy="14" r="1.7" fill="#a5d8e8" />
	</g>
{:else if id === 'sofa'}
	<g>
		<rect x="-70" y="-31" width="70" height="42" rx="12" fill="#d9a441" />
		<rect x="-70" y="-1" width="140" height="32" rx="10" fill="#d9a441" />
		<rect x="-64" y="-26" width="58" height="22" rx="10" fill="#e2b45c" />
		<rect x="-66" y="-1" width="64" height="16" rx="8" fill="#e2b45c" />
		<rect x="2" y="-1" width="64" height="16" rx="8" fill="#e2b45c" />
		<rect x="-70" y="24" width="140" height="7" rx="3.5" fill="#b8862e" />
		<rect x="-62" y="27" width="9" height="4" rx="2" fill="#8a6420" />
		<rect x="53" y="27" width="9" height="4" rx="2" fill="#8a6420" />
	</g>
{:else if id === 'safe'}
	<g>
		<rect x="-35" y="-37" width="70" height="74" rx="6" fill="#3d5a4c" />
		<rect x="-29" y="-31" width="58" height="62" rx="4" fill="#49695a" />
		<rect x="-35" y="30" width="70" height="7" rx="3" fill="#324b40" />
		{#each [-31.5, 29.5] as hx (hx)}
			<rect x={hx} y="-24" width="5" height="10" rx="2" fill="#2c443a" />
			<rect x={hx} y="12" width="5" height="10" rx="2" fill="#2c443a" />
		{/each}
		<circle cx="-8" cy="0" r="10" fill="#c9ced2" />
		<circle cx="-8" cy="0" r="6.5" fill="#9aa4ab" />
		{#each [[-8, -8.5], [-8, 8.5], [-16.5, 0], [0.5, 0]] as [tx, ty], i (i)}
			<circle cx={tx} cy={ty} r="1.2" fill="#5f6b64" />
		{/each}
		<rect x="10" y="-2" width="16" height="4" rx="2" fill="#c9ced2" />
		<circle cx="13" cy="0" r="3" fill="#9aa4ab" />
	</g>
{:else if id === 'mattress'}
	<g>
		<rect x="-65" y="-15" width="130" height="30" rx="12" fill="#f4f1e8" />
		<rect x="-63" y="-3" width="126" height="6" rx="3" fill="#bcd3e8" />
		<rect x="-65" y="-15" width="130" height="30" rx="12" fill="none" stroke="#d8d2c2" stroke-width="2.5" />
		{#each [-40, -13, 13, 40] as bx (bx)}
			<circle cx={bx} cy="-8.5" r="1.6" fill="#c9c2b2" />
			<circle cx={bx} cy="8.5" r="1.6" fill="#c9c2b2" />
		{/each}
	</g>
{:else if id === 'cake'}
	<g>
		<rect x="-45" y="13" width="90" height="30" rx="5" fill="#f7f0e6" />
		<path d="M -45 13 q 5 9 10 0 q 5 9 10 0 q 5 9 10 0 q 5 9 10 0 q 5 9 10 0 q 5 9 10 0 q 5 9 10 0 q 5 9 10 0 q 5 9 10 0 L 45 13 Z" fill="#e8a0b4" />
		<rect x="-45" y="37" width="90" height="6" rx="3" fill="#e8a0b4" />
		<rect x="-32" y="-15" width="64" height="28" rx="5" fill="#fdf7ee" />
		<path d="M -32 -15 q 4 8 8 0 q 4 8 8 0 q 4 8 8 0 q 4 8 8 0 q 4 8 8 0 q 4 8 8 0 q 4 8 8 0 q 4 8 8 0 L 32 -15 Z" fill="#e8a0b4" />
		<rect x="-20" y="-43" width="40" height="28" rx="5" fill="#f7f0e6" />
		<path d="M -20 -43 q 4 8 8 0 q 4 8 8 0 q 4 8 8 0 q 4 8 8 0 q 4 8 8 0 L 20 -43 Z" fill="#e8a0b4" />
		{#each [[-28, 28], [0, 32], [28, 28], [-14, -6], [14, -6], [0, -26]] as [dx, dy], i (i)}
			<circle cx={dx} cy={dy} r="1.8" fill="#e8a0b4" />
		{/each}
	</g>
{:else if id === 'potty'}
	<g>
		<rect x="-32" y="-55" width="64" height="110" rx="7" fill="#3f7fa6" />
		<rect x="-32" y="-55" width="64" height="9" rx="4.5" fill="#e8edf0" />
		<rect x="-32" y="-50" width="64" height="4" fill="#e8edf0" />
		<rect x="-32" y="49" width="64" height="6" rx="3" fill="#2f6485" />
		<rect x="-24" y="-42" width="48" height="88" rx="5" fill="#4f93bc" />
		<path d="M 2 -35 A 8 8 0 1 0 2 -19 A 11 11 0 0 1 2 -35 Z" fill="#2f6485" />
		<rect x="-6" y="-12" width="12" height="10" rx="2" fill="#e8edf0" />
		<circle cx="0" cy="-7" r="3" fill="#d64545" />
		<rect x="14" y="6" width="7" height="3.5" rx="1.75" fill="#2f6485" />
		<line x1="-10" y1="38" x2="10" y2="38" stroke="#2f6485" stroke-width="2.5" stroke-linecap="round" />
		<line x1="-10" y1="43" x2="10" y2="43" stroke="#2f6485" stroke-width="2.5" stroke-linecap="round" />
	</g>
{:else if id === 'disco'}
	<g>
		<defs>
			<clipPath id="disco-clip"><circle r="25" /></clipPath>
		</defs>
		<circle r="25" fill="#9fb0c2" />
		<g clip-path="url(#disco-clip)">
			{#each DISCO_ROWS as ty, i (ty)}
				{#each DISCO_COLS as tx, j (tx)}
					<rect x={tx} y={ty} width="7" height="7" rx="1" fill={DISCO_SHADES[(i + j) % 3]} />
				{/each}
			{/each}
		</g>
		<path d="M -9 -13 l 1.5 3.5 l 3.5 1.5 l -3.5 1.5 l -1.5 3.5 l -1.5 -3.5 l -3.5 -1.5 l 3.5 -1.5 Z" fill="#ffffff" opacity="0.9" />
		<path d="M 10 6 l 1.2 2.8 l 2.8 1.2 l -2.8 1.2 l -1.2 2.8 l -1.2 -2.8 l -2.8 -1.2 l 2.8 -1.2 Z" fill="#ffffff" opacity="0.85" />
	</g>
{/if}
