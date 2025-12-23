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

	// Sync content when block data changes
	$effect(() => {
		if (editableRef && !editing && block.data.text !== undefined) {
			editableRef.textContent = block.data.text;
		}
	});

	function handleInput(e: Event) {
		// Just let contenteditable do its thing, don't update yet
	}

	function saveAndClose() {
		if (editableRef) {
			const newText = editableRef.textContent?.trim() || '';
			// Only update if text actually changed and is not empty
			if (newText && newText !== initialText) {
				onUpdate?.({ text: newText });
			}
		}
		editing = false;
	}

	function handleFocus() {
		if (!editable) return;
		editing = true;
		if (editableRef) {
			const currentText = editableRef.textContent?.trim() || '';
			initialText = currentText;
			// If it's the placeholder text or empty, clear it
			if (currentText === 'Heading' || !currentText) {
				editableRef.textContent = '';
				initialText = '';
			}
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

<div bind:this={containerRef} class="h-full w-full p-4 flex items-center">
	<div
		bind:this={editableRef}
		contenteditable={editable}
		onfocus={handleFocus}
		class="w-full outline-none text-text text-2xl font-bold"
	>
		{block.data.text || (editable ? 'Heading' : '')}
	</div>
</div>
