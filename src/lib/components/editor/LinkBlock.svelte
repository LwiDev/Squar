<script lang="ts">
	import type { Block } from '$lib/types/models';
	import { ExternalLink } from 'lucide-svelte';
	import { onMount } from 'svelte';

	interface Props {
		block: Block;
		onUpdate?: (data: any) => void;
	}

	let { block, onUpdate }: Props = $props();

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

	function startEditing() {
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
	<button
		onclick={startEditing}
		class="h-full w-full p-4 flex items-center justify-between hover:bg-border/50 transition-colors text-left"
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
		<ExternalLink size={18} class="text-muted flex-shrink-0" />
	</button>
{/if}
