<script lang="ts">
	import type { Block } from '$lib/types/models';
	import { ExternalLink } from 'lucide-svelte';

	interface Props {
		block: Block;
	}

	let { block }: Props = $props();

	const title = block.data.title || 'Link';
	const url = block.data.url || '#';
	const iconSvg = block.data.iconSvg;
	const iconHex = block.data.iconHex;
</script>

<a
	href={url}
	target="_blank"
	rel="noopener noreferrer"
	class="h-full w-full p-4 flex items-center justify-between bg-background border border-border rounded-md hover:border-text transition-colors group"
>
	<div class="flex items-center gap-3">
		{#if iconSvg && iconHex}
			<div
				class="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-md"
				style="background-color: #{iconHex};"
			>
				{@html `<svg viewBox="0 0 24 24" class="w-5 h-5" fill="white">${iconSvg}</svg>`}
			</div>
		{/if}
		<span class="font-medium text-text">{title}</span>
	</div>
	<ExternalLink size={18} class="text-muted group-hover:text-text transition-colors flex-shrink-0" />
</a>
