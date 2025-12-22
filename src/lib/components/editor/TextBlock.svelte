<script lang="ts">
	import type { Block } from '$lib/types/models';
	import { onMount } from 'svelte';

	interface Props {
		block: Block;
		editable?: boolean;
		onUpdate?: (data: any) => void;
		onDelete?: () => void;
	}

	let { block, editable = true, onUpdate, onDelete }: Props = $props();

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
		if (!editable) return;
		editing = true;
		if (editableRef) {
			initialText = editableRef.innerText;
		}
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

<div bind:this={containerRef} class="h-full w-full p-4">
	<div
		bind:this={editableRef}
		contenteditable={editable}
		onfocus={handleFocus}
		class="h-full w-full outline-none text-text"
	>
		{block.data.text || (editable ? 'Click to edit' : '')}
	</div>
</div>
