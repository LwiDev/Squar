<script lang="ts">
	import type { Block } from '$lib/types/models';
	import { ExternalLink } from 'lucide-svelte';
	import { onMount } from 'svelte';

	interface Props {
		block: Block;
		editable?: boolean;
		onUpdate?: (data: any) => void;
	}

	let { block, editable = true, onUpdate }: Props = $props();

	let editTitle = $state('');
	let editUrl = $state('');
	let editing = $state(false);
	let containerRef: HTMLDivElement;
	let initialTitle = $state('');
	let initialUrl = $state('');

	// Use block data directly when not editing
	const title = $derived(editing ? editTitle : (block.data.title || 'Link Title'));
	const url = $derived(editing ? editUrl : (block.data.url || 'https://'));
	const iconSvg = $derived(block.data.iconSvg);
	const iconHex = $derived(block.data.iconHex);

	// Determine display mode based on block size
	const socialData = $derived(block.data.socialData);
	const hasImages = $derived(socialData?.images && socialData.images.length > 0);

	// Display modes (like Bento):
	// - Small rectangles (any width x 2): Icon + title (NO photos)
	// - Medium/Large squares (4x4+, 6x4+): Icon + title + photos
	const showPhotos = $derived(hasImages && block.h >= 4);

	function startEditing() {
		if (!editable) return;
		editing = true;
		editTitle = block.data.title || 'Link Title';
		editUrl = block.data.url || 'https://';
		initialTitle = editTitle;
		initialUrl = editUrl;
	}

	function saveAndClose() {
		// Only update if something actually changed
		if (editTitle !== initialTitle || editUrl !== initialUrl) {
			onUpdate?.({ title: editTitle, url: editUrl });
		}
		editing = false;
	}

	onMount(() => {
		if (!editable) return;

		function handleClickOutside(e: MouseEvent) {
			if (editing && containerRef && !containerRef.contains(e.target as Node)) {
				saveAndClose();
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	});
</script>

{#if editing}
	<div bind:this={containerRef} class="h-full w-full p-4 space-y-2">
		<input
			type="text"
			value={editTitle}
			oninput={(e) => {
				editTitle = e.currentTarget.value;
			}}
			placeholder="Link title"
			class="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
			autofocus
		/>
		<input
			type="url"
			value={editUrl}
			oninput={(e) => {
				editUrl = e.currentTarget.value;
			}}
			placeholder="https://example.com"
			class="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
		/>
	</div>
{:else}
	{#if showPhotos}
		<!-- With photos: Show icon + title + photo grid -->
		<a
			href={editable ? undefined : url}
			target={editable ? undefined : '_blank'}
			rel={editable ? undefined : 'noopener noreferrer'}
			onclick={editable ? startEditing : undefined}
			class="h-full w-full p-4 flex flex-col gap-3 {editable ? 'hover:bg-border/50 cursor-pointer' : 'cursor-default'} transition-colors text-left block"
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
				<ExternalLink size={18} class="text-muted flex-shrink-0" />
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
			href={editable ? undefined : url}
			target={editable ? undefined : '_blank'}
			rel={editable ? undefined : 'noopener noreferrer'}
			onclick={editable ? startEditing : undefined}
			class="h-full w-full p-4 flex items-center gap-3 {editable ? 'hover:bg-border/50 cursor-pointer' : 'cursor-default'} transition-colors text-left block"
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
			<ExternalLink size={18} class="text-muted flex-shrink-0" />
		</a>
	{/if}
{/if}
