<script lang="ts">
	import type { Block } from '$lib/types/models';
	import TextBlock from '../editor/TextBlock.svelte';
	import LinkBlock from '../editor/LinkBlock.svelte';
	import ImageBlock from '../editor/ImageBlock.svelte';
	import HeadingBlock from '../editor/HeadingBlock.svelte';
	import VideoBlock from '../editor/VideoBlock.svelte';
	import { Trash2, GripVertical } from 'lucide-svelte';

	interface Props {
		block: Block;
		editable: boolean;
		isSelected?: boolean;
		gridCols: number;
		gridRows: number;
		onSelect?: () => void;
		onUpdate?: (block: Block) => void;
		onUpdateAndCompact?: (block: Block) => void;
		onDelete?: () => void;
		onDragStart?: () => void;
		onDragEnd?: () => void;
	}

	let {
		block,
		editable = false,
		isSelected = false,
		gridCols,
		gridRows,
		onSelect,
		onUpdate,
		onUpdateAndCompact,
		onDelete,
		onDragStart,
		onDragEnd
	}: Props = $props();

	let isDragging = $state(false);
	let isResizing = $state(false);
	let dragStartPos = $state({ x: 0, y: 0 });
	let dragStartBlock = $state({ x: 0, y: 0, w: 0, h: 0 });

	// Predefined sizes for headings (only width matters, height always 2)
	const headingSizes = [
		{ w: 8, h: 2, label: 'Middle' },
		{ w: 16, h: 2, label: 'Full' }
	];

	// Predefined sizes for other blocks (matching Bento exact dimensions)
	const normalSizes = [
		{ w: 4, h: 4, label: 'Carré' },
		{ w: 8, h: 2, label: 'Rectangle' },
		{ w: 8, h: 4, label: 'Rectangle allongé' },
		{ w: 4, h: 8, label: 'Sur le long' },
		{ w: 8, h: 8, label: 'Gros carré' }
	];

	// Choose preset sizes based on block type
	const presetSizes = $derived(block.type === 'heading' ? headingSizes : normalSizes);

	function changeSize(w: number, h: number) {
		// Use compact version for size changes
		onUpdateAndCompact?.({ ...block, w, h });
	}

	// Find closest preset size
	function findClosestPreset(w: number, h: number): { w: number; h: number } {
		let closest = presetSizes[0];
		let minDistance = Infinity;

		for (const preset of presetSizes) {
			// Calculate distance (Euclidean distance)
			const distance = Math.sqrt(Math.pow(preset.w - w, 2) + Math.pow(preset.h - h, 2));
			if (distance < minDistance) {
				minDistance = distance;
				closest = preset;
			}
		}

		return { w: closest.w, h: closest.h };
	}

	function handleBlockUpdate(data: any) {
		onUpdate?.({ ...block, data: { ...block.data, ...data } });
	}

	function handleDragStart(e: MouseEvent) {
		if (!isSelected || !editable) return;
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
		const cellHeight = 50.5; // 26.5px + 24px gap

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

		// Compact after drag to organize layout and remove gaps
		if (onUpdateAndCompact) {
			onUpdateAndCompact(block);
		}

		onDragEnd?.();
		window.removeEventListener('mousemove', handleDragMove);
		window.removeEventListener('mouseup', handleDragEnd);
	}

	function handleResizeStart(e: MouseEvent, direction: string) {
		if (!isSelected || !editable) return;
		e.stopPropagation();
		isResizing = true;
		dragStartPos = { x: e.clientX, y: e.clientY };
		dragStartBlock = { x: block.x, y: block.y, w: block.w, h: block.h };
		onDragStart?.();

		const handleMove = (e: MouseEvent) => handleResizeMove(e, direction);
		const handleEnd = () => {
			isResizing = false;

			// Compact after resize to organize layout and remove gaps
			if (onUpdateAndCompact) {
				onUpdateAndCompact(block);
			}

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
		const cellHeight = 50.5; // 26.5px + 24px gap

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

		// Snap to closest preset size
		const snapped = findClosestPreset(newW, newH);
		newW = snapped.w;
		newH = snapped.h;

		// Adjust position if size change would go out of bounds
		if (newX + newW > gridCols) {
			newX = gridCols - newW;
		}
		if (newY + newH > gridRows) {
			newY = gridRows - newH;
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
	class="relative transition-colors rounded-md overflow-visible bg-background group {editable
		? isSelected
			? 'border-2 border-accent'
			: 'border-2 border-transparent hover:bg-border/50'
		: 'border-0'} {isDragging || isResizing ? 'z-50 opacity-90' : 'z-0'}"
	role="button"
	tabindex={editable ? 0 : -1}
	onclick={editable ? onSelect : undefined}
	onkeydown={editable ? (e) => e.key === 'Enter' && onSelect?.() : undefined}
>
	<!-- Drag handle (only in editable mode when selected) -->
	{#if editable && isSelected}
		<button
			onmousedown={handleDragStart}
			class="absolute top-2 left-2 z-20 p-1 bg-background border border-border rounded cursor-move hover:bg-border transition-colors"
			aria-label="Déplacer le bloc"
			title="Déplacer le bloc"
		>
			<GripVertical size={16} class="text-text" />
		</button>
	{/if}

	<!-- Delete button (only in editable mode when selected) -->
	{#if editable && isSelected}
		<button
			onclick={(e) => {
				e.stopPropagation();
				onDelete?.();
			}}
			class="absolute top-2 right-2 z-20 p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
			aria-label="Supprimer le bloc"
			title="Supprimer le bloc"
		>
			<Trash2 size={14} />
		</button>
	{/if}

	<!-- Size presets (only in editable mode when selected) -->
	{#if editable && isSelected}
		<div class="absolute -bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-1 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-1.5 shadow-lg">
			{#each presetSizes as size}
				<button
					onclick={(e) => {
						e.stopPropagation();
						changeSize(size.w, size.h);
					}}
					class="group relative p-2 rounded hover:bg-border transition-colors {block.w === size.w && block.h === size.h ? 'bg-accent/20' : ''}"
					title={size.label}
					aria-label="Taille : {size.label}"
				>
					<div
						class="border-2 {block.w === size.w && block.h === size.h ? 'border-accent' : 'border-muted'} rounded"
						style="width: {size.w * 3}px; height: {size.h * 3}px;"
					></div>
				</button>
			{/each}
		</div>
	{/if}

	<!-- Resize handles (only in editable mode when selected) -->
	{#if editable && isSelected}
		<!-- Corners -->
		<button
			onmousedown={(e) => handleResizeStart(e, 'se')}
			class="absolute -bottom-1 -right-1 w-3 h-3 bg-accent rounded-full cursor-se-resize z-20"
			aria-label="Redimensionner sud-est"
		></button>
		<button
			onmousedown={(e) => handleResizeStart(e, 'ne')}
			class="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full cursor-ne-resize z-20"
			aria-label="Redimensionner nord-est"
		></button>
		<button
			onmousedown={(e) => handleResizeStart(e, 'sw')}
			class="absolute -bottom-1 -left-1 w-3 h-3 bg-accent rounded-full cursor-sw-resize z-20"
			aria-label="Redimensionner sud-ouest"
		></button>
		<button
			onmousedown={(e) => handleResizeStart(e, 'nw')}
			class="absolute -top-1 -left-1 w-3 h-3 bg-accent rounded-full cursor-nw-resize z-20"
			aria-label="Redimensionner nord-ouest"
		></button>

		<!-- Edges -->
		<button
			onmousedown={(e) => handleResizeStart(e, 'e')}
			class="absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-8 bg-accent rounded-full cursor-e-resize z-20"
			aria-label="Redimensionner est"
		></button>
		<button
			onmousedown={(e) => handleResizeStart(e, 's')}
			class="absolute left-1/2 -translate-x-1/2 -bottom-1 w-8 h-3 bg-accent rounded-full cursor-s-resize z-20"
			aria-label="Redimensionner sud"
		></button>
		<button
			onmousedown={(e) => handleResizeStart(e, 'w')}
			class="absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-8 bg-accent rounded-full cursor-w-resize z-20"
			aria-label="Redimensionner ouest"
		></button>
		<button
			onmousedown={(e) => handleResizeStart(e, 'n')}
			class="absolute left-1/2 -translate-x-1/2 -top-1 w-8 h-3 bg-accent rounded-full cursor-n-resize z-20"
			aria-label="Redimensionner nord"
		></button>
	{/if}

	<!-- Block content -->
	<div class="h-full w-full overflow-hidden rounded-md">
		{#if block.type === 'text'}
			<TextBlock {block} {editable} onUpdate={handleBlockUpdate} onResize={changeSize} />
		{:else if block.type === 'link'}
			<LinkBlock {block} {editable} onUpdate={handleBlockUpdate} />
		{:else if block.type === 'image'}
			<ImageBlock {block} {editable} onUpdate={handleBlockUpdate} />
		{:else if block.type === 'heading'}
			<HeadingBlock {block} {editable} onUpdate={handleBlockUpdate} />
		{:else if block.type === 'video'}
			<VideoBlock {block} {editable} onUpdate={handleBlockUpdate} />
		{:else}
			<div class="p-4 text-muted">Unknown block type</div>
		{/if}
	</div>
</div>
