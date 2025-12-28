<script lang="ts">
	import type { Block } from '$lib/types/models';
	import { onMount } from 'svelte';
    import { t } from 'svelte-i18n';

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
			// Properly blur the element
			editableRef.blur();
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
			if (currentText === $t('blocks.heading.placeholder') || !currentText) {
				editableRef.textContent = '';
				initialText = '';
			}
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		// Prevent Enter key from creating new lines in headings
		if (e.key === 'Enter') {
			e.preventDefault();
			saveAndClose();
			// Deselect the block by clicking on the grid background
			setTimeout(() => {
				const grid = document.querySelector('[data-grid]') as HTMLElement;
				if (grid) {
					grid.click();
					grid.blur(); // Remove focus to avoid dotted outline
				}
			}, 0);
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
		contenteditable={editable && editing}
		onclick={(e) => {
			if (editable && !editing) {
				e.stopPropagation();
				handleFocus();
				// Focus and place cursor at the end
				setTimeout(() => {
					if (editableRef) {
						editableRef.focus();
						const range = document.createRange();
						const sel = window.getSelection();
						range.selectNodeContents(editableRef);
						range.collapse(false);
						sel?.removeAllRanges();
						sel?.addRange(range);
					}
				}, 0);
			}
		}}
		onfocus={handleFocus}
		ondblclick={handleFocus}
		onkeydown={editing ? handleKeydown : undefined}
		class="w-full outline-none text-text text-2xl font-bold {editable && !editing ? 'cursor-grab' : editing ? 'cursor-text' : ''}"
	>
		{block.data.text || (editable ? $t('blocks.heading.placeholder') : '')}
	</div>
</div>
