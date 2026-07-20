<script lang="ts">
	// Layered flat harbor diorama backdrop (guide 03). Pure scenery: themed by
	// tod-*/wx-* classes on the scene root, animated with transform/opacity only.
	import type { Ambience } from '$lib/game/ambience';
	import {
		CLOUD_DRIFT_MS,
		LAMP_BLINK_MS,
		RAIN_FAR_MS,
		RAIN_NEAR_MS,
		SHIMMER_MS
	} from '$lib/game/timing';
	import { WORLD } from '$lib/game/rules';

	let { amb }: { amb: Ambience } = $props();

	const HORIZON = 612;
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
	style="--cloud-drift: {CLOUD_DRIFT_MS}ms; --shimmer-t: {SHIMMER_MS}ms; --lamp-t: {LAMP_BLINK_MS}ms; --rain-near-t: {RAIN_NEAR_MS}ms; --rain-far-t: {RAIN_FAR_MS}ms"
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
		<g class="stars">
			<circle cx="60" cy="90" r="2" fill="#f4f1e8" />
			<circle cx="150" cy="200" r="1.5" fill="#f4f1e8" />
			<circle cx="250" cy="70" r="1.6" fill="#f4f1e8" />
			<circle cx="340" cy="150" r="2" fill="#f4f1e8" />
			<circle cx="452" cy="60" r="1.4" fill="#f4f1e8" />
			<circle cx="500" cy="230" r="1.8" fill="#f4f1e8" />
			<circle cx="120" cy="320" r="1.4" fill="#f4f1e8" />
			<circle cx="410" cy="330" r="1.5" fill="#f4f1e8" />
		</g>
		<path d="M 452 118 A 34 34 0 1 1 421 68 A 27 27 0 0 0 452 118 Z" fill="var(--celestial)" />
	{:else if amb.tod === 'dusk'}
		<circle cx="120" cy="540" r="46" fill="var(--celestial)" />
	{:else}
		<circle cx="430" cy="110" r="34" fill="var(--celestial)" />
	{/if}

	<!-- drifting clouds -->
	<g class="clouds">
		<g class="cloud cloud-a">
			<ellipse cx="0" cy="0" rx="46" ry="16" fill="var(--cloud)" />
			<ellipse cx="30" cy="-8" rx="28" ry="12" fill="var(--cloud)" />
		</g>
		<g class="cloud cloud-b">
			<ellipse cx="0" cy="0" rx="36" ry="12" fill="var(--cloud)" />
			<ellipse cx="-24" cy="-6" rx="22" ry="10" fill="var(--cloud)" />
		</g>
	</g>

	<!-- distant harbor silhouettes on the horizon -->
	<g fill="var(--silhouette)">
		<rect x="-10" y={HORIZON - 38} width="90" height="38" />
		<rect x="60" y={HORIZON - 58} width="14" height="58" />
		<rect x="64" y={HORIZON - 58} width="52" height="7" />
		<rect x="150" y={HORIZON - 26} width="70" height="26" />
		<rect x="350" y={HORIZON - 30} width="80" height="30" />
		<rect x="452" y={HORIZON - 64} width="14" height="64" />
		<rect x="404" y={HORIZON - 64} width="62" height="7" />
		<rect x="490" y={HORIZON - 40} width="70" height="40" />
	</g>
	{#if amb.tod !== 'day'}
		<circle class="harbor-lamp" cx="67" cy={HORIZON - 62} r="3" fill="var(--lamp)" />
		<circle cx="459" cy={HORIZON - 68} r="3" fill="#e8574b" opacity="0.9" />
	{/if}

	<!-- water -->
	<rect y={HORIZON} width={WORLD.width} height={WORLD.height - HORIZON} fill="var(--water)" />
	<rect y={WORLD.waterlineY} width={WORLD.width} height={WORLD.height - WORLD.waterlineY} fill="var(--water-deep)" />
	<g class="shimmer" stroke-linecap="round">
		<line x1="60" y1={HORIZON + 40} x2="150" y2={HORIZON + 40} class="shim shim-a" />
		<line x1="330" y1={HORIZON + 70} x2="450" y2={HORIZON + 70} class="shim shim-b" />
		<line x1="180" y1={HORIZON + 24} x2="240" y2={HORIZON + 24} class="shim shim-c" />
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
		transform: translate(-80px, 140px);
		animation: drift-a var(--cloud-drift, 42s) linear infinite;
	}
	.cloud-b {
		transform: translate(300px, 250px);
		animation: drift-b var(--cloud-drift, 42s) linear infinite;
		animation-delay: calc(var(--cloud-drift, 42s) / -2);
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
			transform: translate(-100px, 250px);
		}
		to {
			transform: translate(640px, 250px);
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
		.shim,
		.harbor-lamp,
		.rain-near,
		.rain-far {
			animation: none;
		}
	}
</style>
