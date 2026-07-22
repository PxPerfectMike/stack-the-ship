<script lang="ts">
	// Flat DWTD-style cargo art, drawn in def-local coordinates (origin = def
	// centre, matching src/lib/game/cargo.ts physics silhouettes). Deadpan
	// objects; a chosen few are alive (pig, moai, duck, gnome) — spec §1.
	// `overlay` renders an item's FRONT layer only (drawn after all cargo so
	// contents nest behind it) — currently just the bathtub's front wall.
	let { id, overlay = false }: { id: string; overlay?: boolean } = $props();
</script>

{#if overlay}
	{#if id === 'bathtub'}
		<g>
			<path
				d="M -55 -14 Q -55 -20 -49 -20 L 49 -20 Q 55 -20 55 -14 L 51 12 Q 49 25 36 25 L -36 25 Q -49 25 -51 12 Z"
				fill="#eef2f4"
				stroke="#9fb3bd"
				stroke-width="2.5"
			/>
			<rect x="-52" y="-18" width="104" height="5" rx="2.5" fill="#ffffff" />
			<circle cx="0" cy="-4" r="3" fill="#bfd0d8" />
		</g>
	{/if}
{:else if id === 'crate'}
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
		<rect x="-80" y="-9" width="160" height="18" rx="6" fill="#dda15e" />
		<rect x="-80" y="-9" width="160" height="5.5" rx="2.75" fill="#edbf82" />
		<rect x="-80" y="4.5" width="160" height="4.5" rx="2.25" fill="#c68b4b" />
		<rect x="-80" y="-9" width="6" height="18" rx="3" fill="#b97f42" />
		<rect x="74" y="-9" width="6" height="18" rx="3" fill="#b97f42" />
		<path d="M -62 -2 q 10 -3 20 0 q 10 3 20 0" fill="none" stroke="#c68b4b" stroke-width="2" stroke-linecap="round" />
		<path d="M 8 1 q 12 -3 24 0 q 10 2.5 20 0" fill="none" stroke="#c68b4b" stroke-width="2" stroke-linecap="round" />
		<circle cx="-30" cy="0" r="3.5" fill="#b97f42" />
		<circle cx="-30" cy="0" r="1.4" fill="#9a6631" />
		<circle cx="52" cy="-3" r="2.2" fill="#b97f42" />
	</g>
{:else if id === 'piano'}
	<g>
		<rect x="-56" y="13" width="12" height="30" rx="2" fill="#16181c" />
		<rect x="44" y="13" width="12" height="30" rx="2" fill="#16181c" />
		<circle cx="-50" cy="42" r="3.5" fill="#3d424a" />
		<circle cx="50" cy="42" r="3.5" fill="#3d424a" />
		<rect x="-7" y="15" width="4" height="14" fill="#16181c" />
		<rect x="3" y="15" width="4" height="14" fill="#16181c" />
		<rect x="-13" y="27" width="26" height="5" rx="2.5" fill="#16181c" />
		{#each [-7, 0, 7] as px (px)}
			<rect x={px - 2} y="23" width="4" height="6" rx="2" fill="#c9a53f" />
		{/each}
		<rect x="-60" y="-45" width="120" height="60" rx="7" fill="#23262b" />
		<rect x="-52" y="-41" width="96" height="6" rx="3" fill="#383d45" />
		<line x1="-58" y1="-20" x2="58" y2="-20" stroke="#16181c" stroke-width="2" />
		<rect x="-7" y="-26" width="14" height="3" rx="1.5" fill="#c9a53f" opacity="0.9" />
		<rect x="-60" y="-1" width="120" height="2" fill="#c9a53f" />
		<rect x="-60" y="1" width="120" height="14" fill="#16181c" />
		<rect x="-54" y="1" width="108" height="3" fill="#b03a48" />
		<rect x="-54" y="4" width="108" height="10" rx="2" fill="#f4f1e8" />
		{#each [-49, -43, -31, -25, -19, -7, -1, 11, 17, 23, 35, 41] as kx (kx)}
			<rect x={kx} y="4" width="4.5" height="6" fill="#23262b" />
		{/each}
		<rect x="-60" y="1" width="6" height="14" fill="#23262b" />
		<rect x="54" y="1" width="6" height="14" fill="#23262b" />
	</g>
{:else if id === 'moai'}
	<g>
		<path d="M -25 -30 L -25 -42 Q -25 -50 -16 -50 L 16 -50 Q 25 -50 25 -42 L 25 -30 Z" fill="#a5685c" />
		<rect x="-25" y="-35" width="50" height="5" fill="#8d564c" />
		<rect x="-35" y="-30" width="70" height="80" rx="12" fill="#8e9ba6" />
		<rect x="14" y="-28" width="19" height="76" rx="9" fill="#7c8994" />
		<rect x="-35" y="0" width="6" height="20" rx="3" fill="#7c8994" />
		<rect x="27" y="0" width="6" height="20" rx="3" fill="#6d7a85" />
		<rect x="-33" y="44" width="66" height="5" rx="2.5" fill="#7c8994" />
		<path d="M -26 6 L -26 20" stroke="#7c8994" stroke-width="2" stroke-linecap="round" />
		<rect x="-29" y="-16" width="58" height="10" rx="5" fill="#6d7a85" />
		<path d="M -5 -10 L 5 -10 L 11 20 Q 11 24 6 24 L -6 24 Q -11 24 -11 20 Z" fill="#7c8994" />
		<rect x="-11" y="20" width="22" height="4" rx="2" fill="#6d7a85" />
		<circle cx="-3.5" cy="17" r="1.3" fill="#5f6c77" />
		<circle cx="3.5" cy="17" r="1.3" fill="#5f6c77" />
		<rect x="-26" y="-7" width="14" height="7" rx="3.5" fill="#5f6c77" />
		<rect x="12" y="-7" width="14" height="7" rx="3.5" fill="#5f6c77" />
		<circle cx="-22" cy="-3.5" r="1.6" fill="#2b3138" />
		<circle cx="14.5" cy="-3.5" r="1.6" fill="#2b3138" />
		<rect x="-13" y="32" width="26" height="4.5" rx="2.25" fill="#6d7a85" />
	</g>
{:else if id === 'bathtub'}
	<g>
		<rect x="-48" y="-36" width="4.5" height="15" rx="2" fill="#8fa3ad" />
		<path d="M -45.8 -34 Q -45.8 -40 -40 -40 Q -34.5 -40 -34.5 -33" fill="none" stroke="#8fa3ad" stroke-width="4.5" stroke-linecap="round" />
		<circle cx="-51" cy="-28" r="2.6" fill="#7e929e" />
		<path d="M -34.5 -29 q 1.8 2.6 0 4 q -1.8 -1.4 0 -4 Z" fill="#7ec3d8" />
		<!-- interior/back — the front wall arrives as a separate overlay pass -->
		<path
			d="M -55 -19 Q -55 -25 -49 -25 L 49 -25 Q 55 -25 55 -19 L 51 12 Q 49 25 36 25 L -36 25 Q -49 25 -51 12 Z"
			fill="#c9d6db"
			stroke="#9fb3bd"
			stroke-width="2.5"
		/>
		<rect x="-52" y="-23" width="104" height="5" rx="2.5" fill="#e4ebee" />
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
{:else if id === 'anvil'}
	<g>
		<path
			d="M -8 -32 L 45 -32 L 45 -12 L -8 -12 Q -34 -12 -43 -24 Q -45 -28 -40 -29.5 Q -26 -32 -8 -32 Z"
			fill="#4a5158"
		/>
		<rect x="-36" y="-32" width="81" height="5" rx="2.5" fill="#5c646c" />
		<rect x="38" y="-30" width="7" height="18" rx="2" fill="#3d444b" />
		<rect x="26" y="-24" width="7" height="7" rx="1.5" fill="#2b3138" />
		<path d="M -17 -12 L 17 -12 Q 12 0 17 12 L -17 12 Q -12 0 -17 -12 Z" fill="#42484f" />
		<path d="M -26 12 L 26 12 L 31 20 L 32 24 L 32 32 L -32 32 L -32 24 L -31 20 Z" fill="#4a5158" />
		<rect x="-32" y="27" width="64" height="5" fill="#363c42" />
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
		{#each [-1, 1] as side (side)}
			<g transform="scale({side} 1)">
				<rect x="-29" y="-6" width="12" height="9" rx="3" fill="#aab9c2" />
				<rect x="-26" y="-17" width="6" height="12" fill="#aab9c2" />
				<path d="M -23 -10 q 8 0 8 7" fill="none" stroke="#aab9c2" stroke-width="4" stroke-linecap="round" />
				<circle cx="-23" cy="-19" r="3.4" fill="#8fa3ad" />
				{#each [[0, -4.2], [0, 4.2], [-4.2, 0], [4.2, 0]] as [dx, dy], i (i)}
					<circle cx={-23 + dx} cy={-19 + dy} r="1.7" fill="#8fa3ad" />
				{/each}
			</g>
		{/each}
		<circle cx="-23" cy="-19" r="1.5" fill="#d64545" />
		<circle cx="23" cy="-19" r="1.5" fill="#3f88c5" />
		<rect x="-38" y="2" width="76" height="20" rx="8" fill="#eef2f4" stroke="#9fb3bd" stroke-width="2.5" />
		<rect x="-32" y="5" width="64" height="6" rx="3" fill="#bfd0d8" />
		<circle cx="0" cy="15" r="3.2" fill="#7e929e" />
	</g>
{:else if id === 'gnome'}
	<g>
		<rect x="-23" y="10" width="46" height="28" rx="9" fill="#4a7fb5" />
		<circle cx="-19" cy="19" r="4.5" fill="#3a6a9c" />
		<circle cx="19" cy="19" r="4.5" fill="#3a6a9c" />
		<rect x="-23" y="26" width="46" height="7" fill="#3a3630" />
		<rect x="-5" y="24.5" width="10" height="10" rx="2" fill="#c9a53f" />
		<rect x="-2.5" y="27" width="5" height="5" rx="1" fill="#3a3630" />
		<rect x="-21" y="38" width="17" height="6" rx="3" fill="#3a3630" />
		<rect x="4" y="38" width="17" height="6" rx="3" fill="#3a3630" />
		<path
			d="M -15 -8 Q -19 4 -15 14 Q -9 22 0 23 Q 9 22 15 14 Q 19 4 15 -8 Q 7 -3 0 -3 Q -7 -3 -15 -8 Z"
			fill="#f4f1e8"
		/>
		<path d="M -8 8 q 2 6 8 7" fill="none" stroke="#e3ded0" stroke-width="1.8" stroke-linecap="round" />
		<path d="M 8 6 q -1 5 -5 8" fill="none" stroke="#e3ded0" stroke-width="1.8" stroke-linecap="round" />
		<rect x="-11" y="-13" width="22" height="9" rx="4.5" fill="#f0c9a8" />
		<ellipse cx="-5" cy="-9" rx="1.5" ry="2.1" fill="#2b2024" />
		<ellipse cx="5" cy="-9" rx="1.5" ry="2.1" fill="#2b2024" />
		<circle cx="0" cy="-4" r="5" fill="#e8a987" />
		<path d="M -13 -15 Q -8 -36 0 -44 Q 8 -36 13 -15 Z" fill="#d64545" />
		<rect x="-13" y="-17" width="26" height="5.5" rx="2.75" fill="#b93a3a" />
		<circle cx="0" cy="-42.5" r="3" fill="#b93a3a" />
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
		<rect x="-33.8" y="31.8" width="67.6" height="7.5" rx="3.5" fill="#d7dfe3" />
		<circle cx="0" cy="8" r="19" fill="#aab9c2" />
		<circle cx="0" cy="8" r="14" fill="#5f8ba3" />
		<path d="M 0 3 L 5 3 L 5 10 Q 5 14 1 14 L -2 14 Q -5 14 -5 11 Q -5 9 -2 9 L 0 9 Z" fill="#f4f1e8" />
		<rect x="0" y="3" width="5" height="2.5" fill="#d64545" />
		<circle cx="-7" cy="1" r="2.2" fill="#a5d8e8" />
		<circle cx="8" cy="14" r="1.7" fill="#a5d8e8" />
		<rect x="-35" y="-41" width="70" height="82" rx="8" fill="none" stroke="#b9c6cd" stroke-width="2.5" />
	</g>
{:else if id === 'sofa'}
	<g>
		<rect x="-70" y="-31" width="140" height="62" rx="10" fill="#2f8c76" />
		<rect x="-63" y="-27" width="60" height="26" rx="9" fill="#52b598" />
		<rect x="3" y="-27" width="60" height="26" rx="9" fill="#52b598" />
		<rect x="-54" y="-4" width="52" height="19" rx="8" fill="#46a689" />
		<rect x="2" y="-4" width="52" height="19" rx="8" fill="#46a689" />
		<rect x="-70" y="-14" width="15" height="38" rx="7" fill="#3a9a81" />
		<rect x="55" y="-14" width="15" height="38" rx="7" fill="#3a9a81" />
		<rect x="-70" y="-14" width="15" height="7" rx="3.5" fill="#52b598" />
		<rect x="55" y="-14" width="15" height="7" rx="3.5" fill="#52b598" />
		<rect x="-70" y="20" width="140" height="11" rx="4" fill="#256e5c" />
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
{:else if id === 'delorean'}
	<g>
		<path
			d="M -65 4 L -65 -8 L -36 -16 L 4 -16 L 24 -8 L 62 -5 Q 65 -5 65 -2 L 65 5 Q 65 8 62 8 L -62 8 Q -65 8 -65 4 Z"
			fill="#c9ced2"
		/>
		<line x1="-58" y1="-9" x2="-42" y2="-13.5" stroke="#9aa4ab" stroke-width="1.5" />
		<line x1="-56" y1="-7" x2="-40" y2="-11.5" stroke="#9aa4ab" stroke-width="1.5" />
		<path d="M -33 -14 L 1 -14 L 16 -8 L -33 -8 Z" fill="#2b3138" />
		<line x1="1" y1="-8" x2="5" y2="7" stroke="#aab3ba" stroke-width="1.5" />
		<rect x="-65" y="0" width="130" height="2" fill="#b3bac0" />
		<rect x="-62" y="-6" width="5" height="4" rx="1" fill="#7ee0e8" />
		<rect x="59" y="-4" width="6" height="2.5" rx="1" fill="#2b3138" />
		<rect x="-65" y="4" width="130" height="4" rx="2" fill="#aab3ba" />
		<circle cx="-38" cy="9" r="10" fill="#7e8890" />
		<circle cx="38" cy="9" r="10" fill="#7e8890" />
		<circle cx="-38" cy="10" r="8" fill="#2b3138" />
		<circle cx="38" cy="10" r="8" fill="#2b3138" />
		<circle cx="-38" cy="10" r="3.2" fill="#c9ced2" />
		<circle cx="38" cy="10" r="3.2" fill="#c9ced2" />
	</g>
{:else if id === 'cake'}
	<g>
		<rect x="-45" y="17" width="90" height="26" rx="5" fill="#f7f0e6" />
		<path d="M -45 17 q 5 9 10 0 q 5 9 10 0 q 5 9 10 0 q 5 9 10 0 q 5 9 10 0 q 5 9 10 0 q 5 9 10 0 q 5 9 10 0 q 5 9 10 0 L 45 17 Z" fill="#e8a0b4" />
		<rect x="-45" y="38" width="90" height="5" rx="2.5" fill="#e8a0b4" />
		<rect x="-32" y="-9" width="64" height="26" rx="5" fill="#fdf7ee" />
		<path d="M -32 -9 q 4 8 8 0 q 4 8 8 0 q 4 8 8 0 q 4 8 8 0 q 4 8 8 0 q 4 8 8 0 q 4 8 8 0 q 4 8 8 0 L 32 -9 Z" fill="#e8a0b4" />
		<rect x="-20" y="-31" width="40" height="22" rx="5" fill="#f7f0e6" />
		<path d="M -20 -31 q 4 8 8 0 q 4 8 8 0 q 4 8 8 0 q 4 8 8 0 q 4 8 8 0 L 20 -31 Z" fill="#e8a0b4" />
		{#each [[-28, 32], [0, 36], [28, 32], [-14, 2], [14, 2], [0, -22]] as [dx, dy], i (i)}
			<circle cx={dx} cy={dy} r="1.8" fill="#e8a0b4" />
		{/each}
		<path d="M -9 -31 L -5 -41 L -1 -31 Z" fill="#f4f1e8" />
		<circle cx="-5" cy="-42" r="2.5" fill="#f0c9a8" />
		<rect x="2" y="-40" width="6" height="9" rx="2" fill="#2b3138" />
		<circle cx="5" cy="-42" r="2.5" fill="#f0c9a8" />
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
{:else if id === 'bball'}
	<g>
		<circle r="25" fill="#e8752a" />
		<path d="M -25 0 A 25 25 0 1 0 25 0 A 32 32 0 0 1 -25 0 Z" fill="#d2611e" />
		<line x1="0" y1="-25" x2="0" y2="25" stroke="#2b2024" stroke-width="2" />
		<line x1="-25" y1="0" x2="25" y2="0" stroke="#2b2024" stroke-width="2" />
		<path d="M -13 -21.3 Q -3 0 -13 21.3" fill="none" stroke="#2b2024" stroke-width="2" />
		<path d="M 13 -21.3 Q 3 0 13 21.3" fill="none" stroke="#2b2024" stroke-width="2" />
	</g>
{/if}
