<script lang="ts">
	import type { Block } from '$lib/types/models';
	import { onMount } from 'svelte';

	interface Props {
		block: Block;
		onUpdate?: (data: any) => void;
		onDelete?: () => void;
	}

	let { block, onUpdate, onDelete }: Props = $props();

	let editing = $state(false);
	let containerRef: HTMLDivElement;
	let editableRef: HTMLDivElement;
	let initialText = $state('');

	function handleInput(e: Event) {
		// Just let contenteditable do its thing, don't update yet
	}

	function saveAndClose() {
		if (editableRef) {
			const newText = editableRef.innerText;
			// Only update if text actually changed
			if (newText !== initialText) {
				onUpdate?.({ text: newText });
			}
		}
		editing = false;
	}

	function handleFocus() {
		editing = true;
		if (editableRef) {
			initialText = editableRef.innerText;
		}
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

<div bind:this={containerRef} class="h-full w-full p-4 flex items-center">
	<div
		bind:this={editableRef}
		contenteditable="true"
		onfocus={handleFocus}
		class="w-full outline-none text-text text-2xl font-bold"
	>
		{block.data.text || 'Heading'}
	</div>
</div>
