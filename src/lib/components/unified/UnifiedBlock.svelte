<script lang="ts">
    import type { Block } from "$lib/types/models";
    import TextBlock from "../editor/TextBlock.svelte";
    import LinkBlock from "../editor/LinkBlock.svelte";
    import ImageBlock from "../editor/ImageBlock.svelte";
    import HeadingBlock from "../editor/HeadingBlock.svelte";
    import VideoBlock from "../editor/VideoBlock.svelte";
    import { Trash2 } from "lucide-svelte";
    import { AVAILABLE_SIZES, GRID_CONFIG } from "$lib/constants/blockSizes";
    import { spring } from "svelte/motion";

    interface Props {
        block: Block;
        editable: boolean;
        isSelected?: boolean;
        isDragging?: boolean;
        gridCols: number;
        gridRows: number;
        allBlocks?: Block[];
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
        isDragging = false,
        gridCols,
        gridRows,
        allBlocks = [],
        onSelect,
        onUpdate,
        onUpdateAndCompact,
        onDelete,
        onDragStart,
        onDragEnd,
    }: Props = $props();

    let dragInProgress = $state(false);
    let dragStartPos = $state({ x: 0, y: 0 });
    let dragStartBlock = $state({ x: 0, y: 0, w: 0, h: 0 });
    let hasMoved = $state(false);
    let dragOffset = $state({ x: 0, y: 0 }); // Pixel offset for smooth cursor following

    // Spring animation for smooth momentum/physics effect (like Bento)
    const springOffset = spring(
        { x: 0, y: 0, rotation: 0 },
        {
            stiffness: 0.1,
            damping: 0.5,
        },
    );

    // Choose preset sizes based on block type
    const presetSizes = $derived(
        block.type === "heading"
            ? AVAILABLE_SIZES.heading
            : AVAILABLE_SIZES.normal,
    );

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
            const distance = Math.sqrt(
                Math.pow(preset.w - w, 2) + Math.pow(preset.h - h, 2),
            );
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
        if (!editable) return;

        // Only prevent drag if clicking on actual input fields being edited
        const target = e.target as HTMLElement;
        if (
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable ||
            target.closest("input") ||
            target.closest("textarea") ||
            target.closest('[contenteditable="true"]')
        ) {
            return;
        }

        // Prevent default behavior (including focus outline)
        e.preventDefault();

        // Start listening for drag immediately
        dragInProgress = true;
        hasMoved = false;
        dragStartPos = { x: e.clientX, y: e.clientY };
        dragStartBlock = { x: block.x, y: block.y, w: block.w, h: block.h };

        // DON'T notify parent yet - wait for actual movement

        window.addEventListener("mousemove", handleDragMove);
        window.addEventListener("mouseup", handleDragEnd);
    }

    function handleDragMove(e: MouseEvent) {
        if (!dragInProgress) return;

        const deltaX = e.clientX - dragStartPos.x;
        const deltaY = e.clientY - dragStartPos.y;

        // Threshold to distinguish between click and drag (3px)
        if (!hasMoved && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
            hasMoved = true;
            // Now that we're actually dragging, prevent default behaviors
            e.preventDefault();
            // Auto-select when we start actually dragging
            if (!isSelected) {
                onSelect?.();
            }
            onDragStart?.();
        }

        if (!hasMoved) return;

        // Prevent default while dragging
        e.preventDefault();

        // Calculate rotation based on horizontal velocity (Bento-style physics)
        const velocityX = deltaX - (dragOffset.x || 0);
        const rotation = Math.max(-12, Math.min(12, velocityX * 0.3));

        // Block follows cursor with spring physics for smooth momentum
        dragOffset = { x: deltaX, y: deltaY };
        springOffset.set({ x: deltaX, y: deltaY, rotation });

        // Calculate grid position for placeholder
        const gridElement = document.querySelector("[data-grid]");
        if (!gridElement) return;

        const cellWidth = GRID_CONFIG.cellWidth + GRID_CONFIG.gap;
        const cellHeight = GRID_CONFIG.cellHeight + GRID_CONFIG.gap;

        const cellsX = Math.round(deltaX / cellWidth);
        const cellsY = Math.round(deltaY / cellHeight);

        const hoverX = Math.max(
            0,
            Math.min(gridCols - block.w, dragStartBlock.x + cellsX),
        );
        const hoverY = Math.max(
            0,
            Math.min(gridRows - block.h, dragStartBlock.y + cellsY),
        );

        // Send hover position to parent for placeholder (grid doesn't update during drag)
        onUpdate?.({ ...block, x: hoverX, y: hoverY });
    }

    function handleDragEnd() {
        window.removeEventListener("mousemove", handleDragMove);
        window.removeEventListener("mouseup", handleDragEnd);

        // If we didn't move, it was just a click to select
        if (!hasMoved) {
            dragInProgress = false;
            onSelect?.();
            return;
        }

        dragInProgress = false;
        dragOffset = { x: 0, y: 0 }; // Reset visual offset
        springOffset.set({ x: 0, y: 0, rotation: 0 }, { hard: true }); // Reset spring instantly

        // Don't compact again - already compacted in real-time
        onDragEnd?.();
    }

    const gridStyle = $derived(`
		grid-column: ${block.x + 1} / span ${block.w};
		grid-row: ${block.y + 1} / span ${block.h};
		${isDragging && hasMoved ? `transform: translate(${$springOffset.x}px, ${$springOffset.y}px) rotate(${$springOffset.rotation}deg) scale(1.05);` : ''}
	`);
</script>

<div
    style={gridStyle}
    class="relative transition-colors rounded-md overflow-visible bg-background group [&_*]:outline-none {editable
        ? isSelected
            ? 'border-2 border-accent'
            : 'border-2 border-transparent hover:bg-border/50'
        : 'border-0'} {isDragging && hasMoved
        ? 'z-[100] opacity-50 cursor-grabbing'
        : block.type === 'heading'
          ? 'z-60'
          : editable
            ? 'cursor-grab z-0'
            : 'z-0'}"
    onmousedown={editable ? handleDragStart : undefined}
>
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
        <div
            class="absolute -bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-1 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-1.5 shadow-lg"
        >
            {#each presetSizes as size}
                <button
                    onclick={(e) => {
                        e.stopPropagation();
                        changeSize(size.w, size.h);
                    }}
                    class="group relative p-2 rounded hover:bg-border transition-colors {block.w ===
                        size.w && block.h === size.h
                        ? 'bg-accent/20'
                        : ''}"
                    title={size.label}
                    aria-label="Taille : {size.label}"
                >
                    <div
                        class="border-2 {block.w === size.w &&
                        block.h === size.h
                            ? 'border-accent'
                            : 'border-muted'} rounded"
                        style="width: {size.w * 15}px; height: {size.h * 8}px;"
                    ></div>
                </button>
            {/each}
        </div>
    {/if}

    <!-- Block content -->
    <div
        class="h-full w-full overflow-hidden rounded-md {editable
            ? 'force-grab-cursor'
            : ''}"
    >
        {#if block.type === "text"}
            <TextBlock
                {block}
                {editable}
                onUpdate={handleBlockUpdate}
                onResize={changeSize}
            />
        {:else if block.type === "link"}
            <LinkBlock {block} {editable} onUpdate={handleBlockUpdate} />
        {:else if block.type === "image"}
            <ImageBlock {block} {editable} onUpdate={handleBlockUpdate} />
        {:else if block.type === "heading"}
            <HeadingBlock {block} {editable} onUpdate={handleBlockUpdate} />
        {:else if block.type === "video"}
            <VideoBlock {block} {editable} onUpdate={handleBlockUpdate} />
        {:else}
            <div class="p-4 text-muted">Unknown block type</div>
        {/if}
    </div>
</div>

<style>
    /* Force grab cursor on all children when editable, except inputs/textareas */
    .force-grab-cursor
        :global(*:not(input):not(textarea):not([contenteditable="true"])) {
        cursor: grab !important;
    }

    /* When dragging, show grabbing cursor */
    :global(.cursor-grabbing)
        .force-grab-cursor
        :global(*:not(input):not(textarea):not([contenteditable="true"])) {
        cursor: grabbing !important;
    }
</style>
