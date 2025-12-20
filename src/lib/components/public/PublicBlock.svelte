<script lang="ts">
	import type { Block } from '$lib/types/models';
	import PublicTextBlock from './PublicTextBlock.svelte';
	import PublicLinkBlock from './PublicLinkBlock.svelte';
	import PublicImageBlock from './PublicImageBlock.svelte';

	interface Props {
		block: Block;
	}

	let { block }: Props = $props();

	const gridStyle = $derived(`
		grid-column: ${block.x + 1} / span ${block.w};
		grid-row: ${block.y + 1} / span ${block.h};
	`);
</script>

<div style={gridStyle} class="relative">
	{#if block.type === 'text'}
		<PublicTextBlock {block} />
	{:else if block.type === 'link'}
		<PublicLinkBlock {block} />
	{:else if block.type === 'image'}
		<PublicImageBlock {block} />
	{/if}
</div>
