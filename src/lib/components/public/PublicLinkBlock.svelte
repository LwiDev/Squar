<script lang="ts">
	import type { Block } from '$lib/types/models';
	import { ExternalLink } from 'lucide-svelte';

	interface Props {
		block: Block;
	}

	let { block }: Props = $props();

	const title = block.data.title || 'Link';
	const url = block.data.url || '#';
</script>

<a
	href={url}
	target="_blank"
	rel="noopener noreferrer"
	class="h-full w-full p-4 flex items-center justify-between bg-background border border-border rounded-md hover:border-text transition-colors group"
>
	<span class="font-medium text-text">{title}</span>
	<ExternalLink size={18} class="text-muted group-hover:text-text transition-colors" />
</a>
