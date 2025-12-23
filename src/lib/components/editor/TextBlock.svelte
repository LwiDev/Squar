<script lang="ts">
	import type { Block } from '$lib/types/models';
	import { onMount } from 'svelte';

	interface Props {
		block: Block;
		editable?: boolean;
		onUpdate?: (data: any) => void;
		onDelete?: () => void;
		onResize?: (w: number, h: number) => void;
	}

	let { block, editable = true, onUpdate, onDelete, onResize }: Props = $props();

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
		if (!editable || !editableRef || !onResize) return;

		const contentHeight = editableRef.scrollHeight;
		// 32px padding (16px top + 16px bottom)
		const totalHeight = contentHeight + 32;
		const rowHeight = 48; // Approx row height in grid
		const requiredRows = Math.ceil(totalHeight / rowHeight);

		// Minimum 2 rows to look good, or match preset sizes
		const newH = Math.max(2, requiredRows);

		if (newH !== block.h) {
			onResize(block.w, newH);
		}
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
			if (currentText === 'Click to edit' || !currentText) {
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

<div bind:this={containerRef} class="h-full w-full p-4">
	<div
		bind:this={editableRef}
		contenteditable={editable}
		onfocus={handleFocus}
		oninput={handleInput}
		class="h-full w-full outline-none text-text"
	>
		{block.data.text || (editable ? 'Click to edit' : '')}
	</div>
</div>
