<script lang="ts">
	import GameScene from '$lib/scenes/GameScene.svelte';
	import TitleScene from '$lib/scenes/TitleScene.svelte';

	// QA URLs that stage gameplay state (?phase=, ?screen=game) skip the title.
	const params = new URLSearchParams(location.search);
	let screen = $state<'title' | 'game'>(
		params.has('phase') || params.get('screen') === 'game' ? 'game' : 'title'
	);
	// Returning to the title mid-session gets the "crane hauls out a fresh
	// sign" entrance instead of everything teleporting into place.
	let visitedGame = $state(screen === 'game');
</script>

{#if screen === 'title'}
	<TitleScene
		entering={visitedGame}
		onstart={() => {
			visitedGame = true;
			screen = 'game';
		}}
	/>
{:else}
	<GameScene onmenu={() => (screen = 'title')} />
{/if}
