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
	const socialData = block.data.socialData;

	// Determine display mode based on block size
	const hasImages = socialData?.images && socialData.images.length > 0;
	const showPhotos = hasImages && block.h >= 4;
</script>

{#if showPhotos}
	<!-- With photos: Show icon + title + photo grid -->
	<a
		href={url}
		target="_blank"
		rel="noopener noreferrer"
		class="h-full w-full p-4 flex flex-col gap-3 bg-background border border-border rounded-md hover:border-text transition-colors group"
	>
		<div class="flex items-center gap-3">
			{#if iconSvg && iconHex}
				<div
					class="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-md"
					style="background-color: #{iconHex};"
				>
					{@html `<svg viewBox="0 0 24 24" class="w-6 h-6" fill="white">${iconSvg}</svg>`}
				</div>
			{/if}
			<div class="flex-1 min-w-0">
				<p class="font-semibold text-text truncate">{title}</p>
				{#if socialData?.username}
					<p class="text-xs text-muted">@{socialData.username}</p>
				{/if}
			</div>
			<ExternalLink size={18} class="text-muted group-hover:text-text transition-colors flex-shrink-0" />
		</div>

		<!-- Photo grid: 6 photos in 3x2 grid -->
		<div class="grid grid-cols-3 gap-1">
			{#each socialData.images.slice(0, 6) as image}
				<div class="aspect-square bg-secondary/50 rounded overflow-hidden">
					<img src={`/api/proxy-image?url=${encodeURIComponent(image)}`} alt="" class="w-full h-full object-cover" />
				</div>
			{/each}
		</div>
	</a>
{:else}
	<!-- Without photos: Just icon + title -->
	<a
		href={url}
		target="_blank"
		rel="noopener noreferrer"
		class="h-full w-full p-4 flex items-center gap-3 bg-background border border-border rounded-md hover:border-text transition-colors group"
	>
		{#if iconSvg && iconHex}
			<div
				class="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-md"
				style="background-color: #{iconHex};"
			>
				{@html `<svg viewBox="0 0 24 24" class="w-6 h-6" fill="white">${iconSvg}</svg>`}
			</div>
		{/if}
		<div class="flex-1 min-w-0">
			<p class="font-semibold text-text truncate">{title}</p>
			{#if socialData?.username}
				<p class="text-xs text-muted">@{socialData.username}</p>
			{/if}
		</div>
		<ExternalLink size={18} class="text-muted group-hover:text-text transition-colors flex-shrink-0" />
	</a>
{/if}
