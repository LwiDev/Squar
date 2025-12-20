<script lang="ts">
	import type { Block } from '$lib/types/models';
	import GridBlock from './GridBlock.svelte';
	import { nanoid } from 'nanoid';
	import { Plus, Type, Link as LinkIcon, Image as ImageIcon, Undo2, Redo2 } from 'lucide-svelte';
	import { Button } from '$lib/components/ui';
	import { HistoryManager } from '$lib/stores/history.svelte';
	import { onMount } from 'svelte';

	interface Props {
		blocks: Block[];
		onUpdate: (blocks: Block[]) => void;
	}

	let { blocks = [], onUpdate }: Props = $props();

	let selectedBlockId = $state<string | null>(null);
	let history: HistoryManager = new HistoryManager(blocks);
	let canUndo = $derived(history?.canUndo ?? false);
	let canRedo = $derived(history?.canRedo ?? false);
	let isUndoRedoing = false;

	onMount(() => {

		// Keyboard shortcuts
		function handleKeydown(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
				e.preventDefault();
				if (e.shiftKey) {
					handleRedo();
				} else {
					handleUndo();
				}
			}
		}

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});

	const GRID_COLS = 12;
	const GRID_ROWS = 20;

	// Check if two blocks overlap
	function blocksOverlap(block1: Block, block2: Block): boolean {
		return !(
			block1.x + block1.w <= block2.x ||
			block2.x + block2.w <= block1.x ||
			block1.y + block1.h <= block2.y ||
			block2.y + block2.h <= block1.y
		);
	}

	// Check if a block would collide with any other blocks
	function wouldCollide(updatedBlock: Block): boolean {
		return blocks.some(
			(block) => block.id !== updatedBlock.id && blocksOverlap(updatedBlock, block)
		);
	}

	function addBlock(type: 'text' | 'link' | 'image') {
		const newBlock: Block = {
			id: nanoid(),
			type,
			x: 0,
			y: blocks.length > 0 ? Math.max(...blocks.map((b) => b.y + b.h)) : 0,
			w: type === 'text' ? 6 : 4,
			h: type === 'text' ? 3 : 2,
			data: {}
		};

		const newBlocks = [...blocks, newBlock];
		onUpdate(newBlocks);
		if (!isUndoRedoing) {
			history?.push(newBlocks);
		}
		selectedBlockId = newBlock.id;
	}

	function updateBlock(updatedBlock: Block) {
		// Prevent update if it would cause a collision
		if (wouldCollide(updatedBlock)) {
			return;
		}
		const newBlocks = blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b));
		onUpdate(newBlocks);
		if (!isUndoRedoing) {
			history?.push(newBlocks);
		}
	}

	function deleteBlock(id: string) {
		const newBlocks = blocks.filter((b) => b.id !== id);
		onUpdate(newBlocks);
		if (!isUndoRedoing) {
			history?.push(newBlocks);
		}
		selectedBlockId = null;
	}

	function handleUndo() {
		const previousState = history?.undo();
		if (previousState) {
			isUndoRedoing = true;
			onUpdate(previousState);
			setTimeout(() => {
				isUndoRedoing = false;
			}, 0);
		}
	}

	function handleRedo() {
		const nextState = history?.redo();
		if (nextState) {
			isUndoRedoing = true;
			onUpdate(nextState);
			setTimeout(() => {
				isUndoRedoing = false;
			}, 0);
		}
	}
</script>

<div class="space-y-4">
	<!-- Toolbar -->
	<div class="flex items-center justify-between gap-2 p-4 bg-background border border-border rounded-md">
		<div class="flex gap-2">
			<Button size="sm" variant="secondary" onclick={() => addBlock('text')}>
				<Type size={16} class="mr-2" />
				Text
			</Button>
			<Button size="sm" variant="secondary" onclick={() => addBlock('link')}>
				<LinkIcon size={16} class="mr-2" />
				Link
			</Button>
			<Button size="sm" variant="secondary" onclick={() => addBlock('image')}>
				<ImageIcon size={16} class="mr-2" />
				Image
			</Button>
		</div>

		<div class="flex gap-2">
			<Button
				size="sm"
				variant="ghost"
				onclick={handleUndo}
				disabled={!canUndo}
				title="Undo (Cmd+Z)"
			>
				<Undo2 size={16} />
			</Button>
			<Button
				size="sm"
				variant="ghost"
				onclick={handleRedo}
				disabled={!canRedo}
				title="Redo (Cmd+Shift+Z)"
			>
				<Redo2 size={16} />
			</Button>
		</div>
	</div>

	<!-- Grid -->
	<div
		data-grid
		class="relative bg-background border border-border rounded-md p-8 min-h-[600px]"
		style="display: grid; grid-template-columns: repeat({GRID_COLS}, 1fr); grid-template-rows: repeat({GRID_ROWS}, 40px); gap: 8px;"
	>
		{#if blocks.length === 0}
			<div
				class="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
			>
				<Plus size={48} class="text-muted mb-4" />
				<h3 class="text-lg font-semibold text-text mb-2">Add your first block</h3>
				<p class="text-sm text-muted max-w-md">
					Click one of the buttons above to add a text, link, or image block to your page
				</p>
			</div>
		{/if}

		{#each blocks as block (block.id)}
			<GridBlock
				{block}
				gridCols={GRID_COLS}
				gridRows={GRID_ROWS}
				isSelected={selectedBlockId === block.id}
				onSelect={() => (selectedBlockId = block.id)}
				onUpdate={updateBlock}
				onDelete={() => deleteBlock(block.id)}
			/>
		{/each}
	</div>
</div>
