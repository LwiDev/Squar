<script lang="ts">
	import type { Block } from '$lib/types/models';
	import TextBlock from './TextBlock.svelte';
	import LinkBlock from './LinkBlock.svelte';
	import ImageBlock from './ImageBlock.svelte';
	import { Trash2, GripVertical } from 'lucide-svelte';

	interface Props {
		block: Block;
		isSelected?: boolean;
		gridCols: number;
		gridRows: number;
		onSelect?: () => void;
		onUpdate?: (block: Block) => void;
		onDelete?: () => void;
		onDragStart?: () => void;
		onDragEnd?: () => void;
	}

	let {
		block,
		isSelected = false,
		gridCols,
		gridRows,
		onSelect,
		onUpdate,
		onDelete,
		onDragStart,
		onDragEnd
	}: Props = $props();

	let isDragging = $state(false);
	let isResizing = $state(false);
	let dragStartPos = $state({ x: 0, y: 0 });
	let dragStartBlock = $state({ x: 0, y: 0, w: 0, h: 0 });

	function handleBlockUpdate(data: any) {
		onUpdate?.({ ...block, data: { ...block.data, ...data } });
	}

	function handleDragStart(e: MouseEvent) {
		if (!isSelected) return;
		e.stopPropagation();
		isDragging = true;
		dragStartPos = { x: e.clientX, y: e.clientY };
		dragStartBlock = { x: block.x, y: block.y, w: block.w, h: block.h };
		onDragStart?.();

		window.addEventListener('mousemove', handleDragMove);
		window.addEventListener('mouseup', handleDragEnd);
	}

	function handleDragMove(e: MouseEvent) {
		if (!isDragging) return;

		const gridElement = (e.target as HTMLElement).closest('[data-grid]');
		if (!gridElement) return;

		const rect = gridElement.getBoundingClientRect();
		const cellWidth = rect.width / gridCols;
		const cellHeight = 48; // 40px + 8px gap

		const deltaX = e.clientX - dragStartPos.x;
		const deltaY = e.clientY - dragStartPos.y;

		const cellsX = Math.round(deltaX / cellWidth);
		const cellsY = Math.round(deltaY / cellHeight);

		const newX = Math.max(0, Math.min(gridCols - block.w, dragStartBlock.x + cellsX));
		const newY = Math.max(0, Math.min(gridRows - block.h, dragStartBlock.y + cellsY));

		if (newX !== block.x || newY !== block.y) {
			onUpdate?.({ ...block, x: newX, y: newY });
		}
	}

	function handleDragEnd() {
		isDragging = false;
		onDragEnd?.();
		window.removeEventListener('mousemove', handleDragMove);
		window.removeEventListener('mouseup', handleDragEnd);
	}

	function handleResizeStart(e: MouseEvent, direction: string) {
		if (!isSelected) return;
		e.stopPropagation();
		isResizing = true;
		dragStartPos = { x: e.clientX, y: e.clientY };
		dragStartBlock = { x: block.x, y: block.y, w: block.w, h: block.h };
		onDragStart?.();

		const handleMove = (e: MouseEvent) => handleResizeMove(e, direction);
		const handleEnd = () => {
			isResizing = false;
			onDragEnd?.();
			window.removeEventListener('mousemove', handleMove);
			window.removeEventListener('mouseup', handleEnd);
		};

		window.addEventListener('mousemove', handleMove);
		window.addEventListener('mouseup', handleEnd);
	}

	function handleResizeMove(e: MouseEvent, direction: string) {
		const gridElement = (e.target as HTMLElement).closest('[data-grid]');
		if (!gridElement) return;

		const rect = gridElement.getBoundingClientRect();
		const cellWidth = rect.width / gridCols;
		const cellHeight = 48;

		const deltaX = e.clientX - dragStartPos.x;
		const deltaY = e.clientY - dragStartPos.y;

		const cellsX = Math.round(deltaX / cellWidth);
		const cellsY = Math.round(deltaY / cellHeight);

		let newX = dragStartBlock.x;
		let newY = dragStartBlock.y;
		let newW = dragStartBlock.w;
		let newH = dragStartBlock.h;

		if (direction.includes('e')) {
			newW = Math.max(2, Math.min(gridCols - newX, dragStartBlock.w + cellsX));
		}
		if (direction.includes('s')) {
			newH = Math.max(2, Math.min(gridRows - newY, dragStartBlock.h + cellsY));
		}
		if (direction.includes('w')) {
			const maxShift = dragStartBlock.w - 2;
			const shift = Math.max(-maxShift, Math.min(cellsX, dragStartBlock.x));
			newX = dragStartBlock.x + shift;
			newW = dragStartBlock.w - shift;
		}
		if (direction.includes('n')) {
			const maxShift = dragStartBlock.h - 2;
			const shift = Math.max(-maxShift, Math.min(cellsY, dragStartBlock.y));
			newY = dragStartBlock.y + shift;
			newH = dragStartBlock.h - shift;
		}

		if (newX !== block.x || newY !== block.y || newW !== block.w || newH !== block.h) {
			onUpdate?.({ ...block, x: newX, y: newY, w: newW, h: newH });
		}
	}

	const gridStyle = $derived(`
		grid-column: ${block.x + 1} / span ${block.w};
		grid-row: ${block.y + 1} / span ${block.h};
	`);
</script>

<div
	style={gridStyle}
	class="relative border-2 transition-colors rounded-md overflow-visible bg-background group {isSelected
		? 'border-accent'
		: 'border-border hover:border-text'} {isDragging || isResizing ? 'opacity-70' : ''}"
	role="button"
	tabindex="0"
	onclick={onSelect}
	onkeydown={(e) => e.key === 'Enter' && onSelect?.()}
>
	<!-- Drag handle -->
	{#if isSelected}
		<button
			onmousedown={handleDragStart}
			class="absolute top-2 left-2 z-20 p-1 bg-background border border-border rounded cursor-move hover:bg-border transition-colors"
		>
			<GripVertical size={16} class="text-text" />
		</button>
	{/if}

	<!-- Delete button -->
	{#if isSelected}
		<button
			onclick={(e) => {
				e.stopPropagation();
				onDelete?.();
			}}
			class="absolute top-2 right-2 z-20 p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
		>
			<Trash2 size={14} />
		</button>
	{/if}

	<!-- Resize handles -->
	{#if isSelected}
		<!-- Corners -->
		<button
			onmousedown={(e) => handleResizeStart(e, 'se')}
			class="absolute -bottom-1 -right-1 w-3 h-3 bg-accent rounded-full cursor-se-resize z-20"
		></button>
		<button
			onmousedown={(e) => handleResizeStart(e, 'ne')}
			class="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full cursor-ne-resize z-20"
		></button>
		<button
			onmousedown={(e) => handleResizeStart(e, 'sw')}
			class="absolute -bottom-1 -left-1 w-3 h-3 bg-accent rounded-full cursor-sw-resize z-20"
		></button>
		<button
			onmousedown={(e) => handleResizeStart(e, 'nw')}
			class="absolute -top-1 -left-1 w-3 h-3 bg-accent rounded-full cursor-nw-resize z-20"
		></button>

		<!-- Edges -->
		<button
			onmousedown={(e) => handleResizeStart(e, 'e')}
			class="absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-8 bg-accent rounded-full cursor-e-resize z-20"
		></button>
		<button
			onmousedown={(e) => handleResizeStart(e, 's')}
			class="absolute left-1/2 -translate-x-1/2 -bottom-1 w-8 h-3 bg-accent rounded-full cursor-s-resize z-20"
		></button>
		<button
			onmousedown={(e) => handleResizeStart(e, 'w')}
			class="absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-8 bg-accent rounded-full cursor-w-resize z-20"
		></button>
		<button
			onmousedown={(e) => handleResizeStart(e, 'n')}
			class="absolute left-1/2 -translate-x-1/2 -top-1 w-8 h-3 bg-accent rounded-full cursor-n-resize z-20"
		></button>
	{/if}

	<!-- Block content -->
	<div class="h-full w-full overflow-hidden rounded-md">
		{#if block.type === 'text'}
			<TextBlock {block} onUpdate={handleBlockUpdate} />
		{:else if block.type === 'link'}
			<LinkBlock {block} onUpdate={handleBlockUpdate} />
		{:else if block.type === 'image'}
			<ImageBlock {block} onUpdate={handleBlockUpdate} />
		{:else}
			<div class="p-4 text-muted">Unknown block type</div>
		{/if}
	</div>
</div>
