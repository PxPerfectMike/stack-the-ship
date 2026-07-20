<script lang="ts">
	// Layered flat harbor diorama backdrop (guide 03). Pure scenery: themed by
	// tod-*/wx-* classes on the scene root, animated with transform/opacity only.
	import type { Ambience } from '$lib/game/ambience';
	import {
		CLOUD_DRIFT_MS,
		LAMP_BLINK_MS,
		RAIN_FAR_MS,
		RAIN_NEAR_MS,
		SHIMMER_MS,
		STAR_TWINKLE_MS,
		WAVE_FAR_MS,
		WAVE_NEAR_MS
	} from '$lib/game/timing';
	import { WORLD } from '$lib/game/rules';

	let { amb }: { amb: Ambience } = $props();

	const HORIZON = 612;

	// Seamless scalloped wave band: bump period divides the overdraw width, so
	// translating by exactly one period loops invisibly.
	function wavePath(y: number, amp: number, period: number): string {
		let d = `M -${period} ${y}`;
		for (let x = -period; x < WORLD.width + period; x += period) {
			d += ` Q ${x + period / 2} ${y - amp} ${x + period} ${y}`;
		}
		return `${d} L ${WORLD.width + period} ${y + 420} L -${period} ${y + 420} Z`;
	}

	const celestialX = $derived(amb.tod === 'dusk' ? 120 : 430);

	const stars = [
		{ x: 60, y: 90, r: 2 },
		{ x: 150, y: 200, r: 1.5 },
		{ x: 250, y: 70, r: 1.6 },
		{ x: 340, y: 150, r: 2 },
		{ x: 452, y: 60, r: 1.4 },
		{ x: 500, y: 230, r: 1.8 },
		{ x: 120, y: 320, r: 1.4 },
		{ x: 410, y: 330, r: 1.5 },
		{ x: 40, y: 420, r: 1.3 },
		{ x: 300, y: 400, r: 1.2 }
	];

	const rainLines = (count: number, seedStep: number): { x: number; y: number }[] =>
		Array.from({ length: count }, (_, i) => ({
			x: ((i * seedStep) % (WORLD.width + 80)) - 40,
			y: (i * 173) % 960
		}));
	const rainNear = rainLines(26, 97);
	const rainFar = rainLines(34, 61);
</script>

<g
	class="backdrop"
	pointer-events="none"
	style="--cloud-drift: {CLOUD_DRIFT_MS}ms; --shimmer-t: {SHIMMER_MS}ms; --lamp-t: {LAMP_BLINK_MS}ms; --rain-near-t: {RAIN_NEAR_MS}ms; --rain-far-t: {RAIN_FAR_MS}ms; --wave-near-t: {WAVE_NEAR_MS}ms; --wave-far-t: {WAVE_FAR_MS}ms; --twinkle-t: {STAR_TWINKLE_MS}ms"
>
	<defs>
		<linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" style="stop-color: var(--sky-top)" />
			<stop offset="1" style="stop-color: var(--sky-bottom)" />
		</linearGradient>
	</defs>

	<!-- sky -->
	<rect width={WORLD.width} height={HORIZON} fill="url(#skyGrad)" />

	<!-- celestial body -->
	{#if amb.tod === 'night'}
		<g>
			{#each stars as s, i (i)}
				<circle
					class="star"
					cx={s.x}
					cy={s.y}
					r={s.r}
					fill="#f4f1e8"
					style="animation-delay: calc(var(--twinkle-t) / -10 * {i})"
				/>
			{/each}
		</g>
		<circle cx="422" cy="100" r="42" fill="#f4f1e8" opacity="0.08" />
		<path d="M 452 118 A 34 34 0 1 1 421 68 A 27 27 0 0 0 452 118 Z" fill="var(--celestial)" />
	{:else if amb.tod === 'dusk'}
		<circle cx="120" cy="540" r="64" fill="var(--celestial)" opacity="0.25" />
		<circle cx="120" cy="540" r="46" fill="var(--celestial)" />
	{:else}
		<circle cx="430" cy="110" r="48" fill="var(--celestial)" opacity="0.3" />
		<circle cx="430" cy="110" r="34" fill="var(--celestial)" />
	{/if}

	<!-- drifting clouds: puffy multi-lobe blobs with a shaded underside -->
	<g class="clouds">
		<g class="cloud cloud-a">
			<path
				d="M -56 10 Q -58 -8 -40 -10 Q -36 -26 -16 -24 Q -8 -38 12 -32 Q 30 -36 36 -20 Q 54 -20 54 -2 Q 54 10 42 10 Z"
				fill="var(--cloud)"
			/>
			<path d="M -56 10 Q -20 4 54 10 Q 54 10 42 10 L -44 10 Z" fill="#000000" opacity="0.06" />
		</g>
		<g class="cloud cloud-b">
			<path
				d="M -40 8 Q -42 -6 -28 -8 Q -24 -20 -8 -18 Q 0 -26 12 -20 Q 26 -22 30 -10 Q 40 -8 38 4 Q 38 8 30 8 Z"
				fill="var(--cloud)"
			/>
		</g>
		<g class="cloud cloud-c">
			<path
				d="M -30 6 Q -32 -4 -20 -6 Q -16 -14 -4 -12 Q 4 -18 12 -12 Q 22 -12 22 -2 Q 22 6 16 6 Z"
				fill="var(--cloud)"
				opacity="0.85"
			/>
		</g>
	</g>

	<!-- distant harbor: hazy far skyline, then the working waterfront -->
	<g fill="var(--silhouette-far)">
		<rect x="-10" y={HORIZON - 22} width="120" height="22" />
		<rect x="96" y={HORIZON - 34} width="10" height="34" />
		<rect x="130" y={HORIZON - 18} width="90" height="18" />
		<rect x="240" y={HORIZON - 28} width="16" height="28" />
		<rect x="270" y={HORIZON - 16} width="110" height="16" />
		<rect x="396" y={HORIZON - 24} width="60" height="24" />
		<rect x="470" y={HORIZON - 36} width="12" height="36" />
		<rect x="486" y={HORIZON - 20} width="70" height="20" />
	</g>
	<g fill="var(--silhouette)">
		<rect x="-10" y={HORIZON - 38} width="90" height="38" rx="2" />
		<rect x="60" y={HORIZON - 58} width="12" height="58" />
		<rect x="64" y={HORIZON - 58} width="52" height="6" />
		<rect x="106" y={HORIZON - 46} width="4" height="8" />
		<rect x="150" y={HORIZON - 26} width="70" height="26" rx="2" />
		<rect x="158" y={HORIZON - 32} width="22" height="6" rx="1" />
		<rect x="184" y={HORIZON - 32} width="22" height="6" rx="1" />
		<rect x="350" y={HORIZON - 30} width="80" height="30" rx="2" />
		<rect x="452" y={HORIZON - 64} width="12" height="64" />
		<rect x="406" y={HORIZON - 64} width="58" height="6" />
		<rect x="412" y={HORIZON - 58} width="4" height="10" />
		<rect x="490" y={HORIZON - 40} width="70" height="40" rx="2" />
		<!-- tiny moored sailboat -->
		<path d="M 300 {HORIZON - 4} L 336 {HORIZON - 4} L 330 {HORIZON + 4} L 306 {HORIZON + 4} Z" />
		<rect x="316" y={HORIZON - 34} width="3" height="30" />
		<path d="M 319 {HORIZON - 32} L 334 {HORIZON - 8} L 319 {HORIZON - 8} Z" />
	</g>
	{#if amb.tod !== 'day'}
		<circle class="harbor-lamp" cx="66" cy={HORIZON - 62} r="3" fill="var(--lamp)" />
		<circle cx="458" cy={HORIZON - 68} r="3" fill="#e8574b" opacity="0.9" />
	{/if}

	<!-- water: light horizon band, drifting scalloped wave layers, deep band -->
	<rect y={HORIZON} width={WORLD.width} height={WORLD.height - HORIZON} fill="var(--water-light)" />
	<g class="wave wave-far">
		<path d={wavePath(HORIZON + 26, 5, 90)} fill="var(--water)" opacity="0.85" />
	</g>
	<g class="wave wave-near">
		<path d={wavePath(HORIZON + 58, 7, 60)} fill="var(--water)" />
	</g>
	<!-- celestial reflection column -->
	<rect
		x={celestialX - 26}
		y={HORIZON + 4}
		width="52"
		height="150"
		fill="var(--celestial)"
		opacity="0.1"
	/>
	<g class="shimmer" stroke-linecap="round">
		<line x1="60" y1={HORIZON + 84} x2="150" y2={HORIZON + 84} class="shim shim-a" />
		<line x1="330" y1={HORIZON + 108} x2="450" y2={HORIZON + 108} class="shim shim-b" />
		<line x1="180" y1={HORIZON + 46} x2="240" y2={HORIZON + 46} class="shim shim-c" />
		<line x1={celestialX - 14} y1={HORIZON + 70} x2={celestialX + 20} y2={HORIZON + 70} class="shim shim-b" />
	</g>
	<g class="wave wave-deep">
		<path d={wavePath(WORLD.waterlineY, 6, 66)} fill="var(--water-deep)" />
	</g>
	<!-- foam ticks riding the deep band crest -->
	<g class="wave wave-deep" stroke="var(--foam)" stroke-width="3" stroke-linecap="round" opacity="0.35">
		<line x1="70" y1={WORLD.waterlineY - 4} x2="86" y2={WORLD.waterlineY - 4} />
		<line x1="238" y1={WORLD.waterlineY - 6} x2="250" y2={WORLD.waterlineY - 6} />
		<line x1="410" y1={WORLD.waterlineY - 4} x2="428" y2={WORLD.waterlineY - 4} />
	</g>

	<!-- rain -->
	{#if amb.wx === 'rain'}
		<g class="rain rain-far">
			{#each rainFar as d, i (i)}
				<line x1={d.x} y1={d.y} x2={d.x - 4} y2={d.y + 14} />
				<line x1={d.x} y1={d.y - 960} x2={d.x - 4} y2={d.y - 946} />
			{/each}
		</g>
		<g class="rain rain-near">
			{#each rainNear as d, i (i)}
				<line x1={d.x} y1={d.y} x2={d.x - 6} y2={d.y + 22} />
				<line x1={d.x} y1={d.y - 960} x2={d.x - 6} y2={d.y - 938} />
			{/each}
		</g>
	{/if}
</g>

<style>
	.backdrop {
		pointer-events: none;
	}
	.cloud-a {
		animation: drift-a var(--cloud-drift) linear infinite;
	}
	.cloud-b {
		animation: drift-b var(--cloud-drift) linear infinite;
		animation-delay: calc(var(--cloud-drift) / -2);
	}
	.cloud-c {
		animation: drift-c calc(var(--cloud-drift) * 1.6) linear infinite;
		animation-delay: calc(var(--cloud-drift) / -3);
	}
	@keyframes drift-a {
		from {
			transform: translate(-120px, 140px);
		}
		to {
			transform: translate(620px, 140px);
		}
	}
	@keyframes drift-b {
		from {
			transform: translate(-100px, 255px);
		}
		to {
			transform: translate(640px, 255px);
		}
	}
	@keyframes drift-c {
		from {
			transform: translate(-80px, 380px) scale(0.8);
		}
		to {
			transform: translate(620px, 380px) scale(0.8);
		}
	}
	.wave-far {
		animation: waveslide-far var(--wave-far-t) linear infinite;
	}
	.wave-near {
		animation: waveslide-near var(--wave-near-t) linear infinite;
	}
	.wave-deep {
		animation: waveslide-near calc(var(--wave-near-t) * 1.35) linear infinite reverse;
	}
	@keyframes waveslide-far {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-90px);
		}
	}
	@keyframes waveslide-near {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-60px);
		}
	}
	.star {
		animation: twinkle var(--twinkle-t) ease-in-out infinite alternate;
	}
	@keyframes twinkle {
		from {
			opacity: 1;
		}
		to {
			opacity: 0.25;
		}
	}
	.shim {
		stroke: #ffffff;
		stroke-width: 3;
		opacity: 0.18;
	}
	.shim-a {
		animation: shimmer var(--shimmer-t) ease-in-out infinite;
	}
	.shim-b {
		animation: shimmer var(--shimmer-t) ease-in-out infinite;
		animation-delay: calc(var(--shimmer-t) / -3);
	}
	.shim-c {
		animation: shimmer var(--shimmer-t) ease-in-out infinite;
		animation-delay: calc(var(--shimmer-t) / -1.5);
	}
	@keyframes shimmer {
		0%,
		100% {
			opacity: 0.06;
		}
		50% {
			opacity: 0.26;
		}
	}
	.harbor-lamp {
		animation: lampblink var(--lamp-t) steps(1) infinite;
	}
	@keyframes lampblink {
		0%,
		92% {
			opacity: 1;
		}
		93%,
		96% {
			opacity: 0.15;
		}
		97%,
		100% {
			opacity: 1;
		}
	}
	.rain line {
		stroke: #cfe6f2;
		stroke-linecap: round;
	}
	.rain-near line {
		stroke-width: 2.4;
		opacity: 0.5;
	}
	.rain-far line {
		stroke-width: 1.4;
		opacity: 0.3;
	}
	.rain-near {
		animation: rainfall var(--rain-near-t) linear infinite;
	}
	.rain-far {
		animation: rainfall var(--rain-far-t) linear infinite;
	}
	@keyframes rainfall {
		from {
			transform: translateY(0);
		}
		to {
			transform: translateY(960px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.cloud-a,
		.cloud-b,
		.cloud-c,
		.wave-far,
		.wave-near,
		.wave-deep,
		.star,
		.shim,
		.harbor-lamp,
		.rain-near,
		.rain-far {
			animation: none;
		}
	}
</style>
