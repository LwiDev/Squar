<script lang="ts">
	import type { Block } from '$lib/types/models';

	interface Props {
		block: Block;
	}

	let { block }: Props = $props();

	const embedUrl = block.data.embedUrl;
	const videoUrl = block.data.videoUrl;
	const sourceType = block.data.sourceType || 'link';
</script>

<div class="h-full w-full p-4">
	{#if sourceType === 'upload' && videoUrl}
		<!-- Uploaded video -->
		<video src={videoUrl} class="w-full h-full rounded object-contain" controls loop muted autoplay />
	{:else if embedUrl}
		<!-- External video embed -->
		<iframe
			src={embedUrl}
			title="Video"
			frameborder="0"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
			allowfullscreen
			class="w-full h-full rounded"
		></iframe>
	{/if}
</div>
