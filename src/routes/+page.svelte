<script lang="ts">
	import GameScene from '$lib/scenes/GameScene.svelte';
	import TitleScene from '$lib/scenes/TitleScene.svelte';

	// QA URLs that stage gameplay state (?phase=, ?screen=game) skip the title.
	const params = new URLSearchParams(location.search);
	let screen = $state<'title' | 'game'>(
		params.has('phase') || params.get('screen') === 'game' ? 'game' : 'title'
	);
</script>

{#if screen === 'title'}
	<TitleScene onstart={() => (screen = 'game')} />
{:else}
	<GameScene />
{/if}
