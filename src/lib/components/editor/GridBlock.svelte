<script lang="ts">
    import type { Block } from "$lib/types/models";
    import TextBlock from "./TextBlock.svelte";
    import LinkBlock from "./LinkBlock.svelte";
    import ImageBlock from "./ImageBlock.svelte";
    import HeadingBlock from "./HeadingBlock.svelte";
    import VideoBlock from "./VideoBlock.svelte";
    import { Trash2, GripVertical } from "lucide-svelte";
    import { fade } from "svelte/transition";

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
        onDragEnd,
    }: Props = $props();

    let isDragging = $state(false);
    let isResizing = $state(false);
    let editState = $state({ isEditing: false });
    let dragStartPos = $state({ x: 0, y: 0 });
    let dragStartBlock = $state({ x: 0, y: 0, w: 0, h: 0 });

    // Predefined sizes
    const presetSizes = [
        { w: 3, h: 2, label: "Petit" },
        { w: 4, h: 2, label: "Small" },
        { w: 6, h: 2, label: "Medium" },
        { w: 4, h: 4, label: "Carré" },
        { w: 6, h: 4, label: "Large" },
        { w: 12, h: 2, label: "Full S" },
        { w: 12, h: 4, label: "Full M" },
    ];

    function changeSize(w: number, h: number) {
        onUpdate?.({ ...block, w, h });
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
        if (!isSelected) return;
        e.stopPropagation();
        isDragging = true;
        dragStartPos = { x: e.clientX, y: e.clientY };
        dragStartBlock = { x: block.x, y: block.y, w: block.w, h: block.h };
        onDragStart?.();

        window.addEventListener("mousemove", handleDragMove);
        window.addEventListener("mouseup", handleDragEnd);
    }

    function handleDragMove(e: MouseEvent) {
        if (!isDragging) return;

        const gridElement = (e.target as HTMLElement).closest("[data-grid]");
        if (!gridElement) return;

        const rect = gridElement.getBoundingClientRect();
        const cellWidth = rect.width / gridCols;
        const cellHeight = 48; // 40px + 8px gap

        const deltaX = e.clientX - dragStartPos.x;
        const deltaY = e.clientY - dragStartPos.y;

        const cellsX = Math.round(deltaX / cellWidth);
        const cellsY = Math.round(deltaY / cellHeight);

        const newX = Math.max(
            0,
            Math.min(gridCols - block.w, dragStartBlock.x + cellsX),
        );
        const newY = Math.max(
            0,
            Math.min(gridRows - block.h, dragStartBlock.y + cellsY),
        );

        if (newX !== block.x || newY !== block.y) {
            onUpdate?.({ ...block, x: newX, y: newY });
        }
    }

    function handleDragEnd() {
        isDragging = false;
        onDragEnd?.();
        window.removeEventListener("mousemove", handleDragMove);
        window.removeEventListener("mouseup", handleDragEnd);
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
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleEnd);
        };

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleEnd);
    }

    function handleResizeMove(e: MouseEvent, direction: string) {
        const gridElement = (e.target as HTMLElement).closest("[data-grid]");
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

        if (direction.includes("e")) {
            newW = Math.max(
                2,
                Math.min(gridCols - newX, dragStartBlock.w + cellsX),
            );
        }
        if (direction.includes("s")) {
            newH = Math.max(
                2,
                Math.min(gridRows - newY, dragStartBlock.h + cellsY),
            );
        }
        if (direction.includes("w")) {
            const maxShift = dragStartBlock.w - 2;
            const shift = Math.max(
                -maxShift,
                Math.min(cellsX, dragStartBlock.x),
            );
            newX = dragStartBlock.x + shift;
            newW = dragStartBlock.w - shift;
        }
        if (direction.includes("n")) {
            const maxShift = dragStartBlock.h - 2;
            const shift = Math.max(
                -maxShift,
                Math.min(cellsY, dragStartBlock.y),
            );
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

        if (
            newX !== block.x ||
            newY !== block.y ||
            newW !== block.w ||
            newH !== block.h
        ) {
            onUpdate?.({ ...block, x: newX, y: newY, w: newW, h: newH });
        }
    }

    const gridStyle = $derived(`
		grid-column: ${block.x + 1} / span ${block.w};
		grid-row: ${block.y + 1} / span ${block.h};
		z-index: ${editState.isEditing ? 50 : "auto"};
	`);

    const isRightSide = $derived(block.x >= gridCols / 2);
    const originClass = $derived(isRightSide ? "origin-top-right right-0" : "origin-top-left left-0");
</script>

<div
    style={gridStyle}
    class="relative border-2 transition-colors rounded-md overflow-visible bg-background group {isSelected
        ? 'border-accent'
        : 'border-border hover:border-text'} {isDragging || isResizing
        ? 'opacity-70'
        : ''}"
    role="button"
    tabindex="0"
    onclick={onSelect}
    onkeydown={(e) => e.key === "Enter" && onSelect?.()}
>
    <!-- Drag handle -->
    {#if isSelected && !editState.isEditing}
        <button
            onmousedown={handleDragStart}
            class="absolute top-2 left-2 z-20 p-1 bg-background border border-border rounded cursor-move hover:bg-border transition-colors"
        >
            <GripVertical size={16} class="text-text" />
        </button>
    {/if}

    <!-- Delete button -->
    {#if isSelected && !editState.isEditing}
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

    <!-- Size presets -->
    {#if isSelected && !editState.isEditing}
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
                >
                    <div
                        class="border-2 {block.w === size.w &&
                        block.h === size.h
                            ? 'border-accent'
                            : 'border-muted'} rounded"
                        style="width: {size.w * 3}px; height: {size.h * 3}px;"
                    ></div>
                </button>
            {/each}
        </div>
    {/if}

    <!-- Resize handles -->
    {#if isSelected && !editState.isEditing}
        <!-- Corners -->
        <button
            onmousedown={(e) => handleResizeStart(e, "se")}
            class="absolute -bottom-1 -right-1 w-3 h-3 bg-accent rounded-full cursor-se-resize z-20"
        ></button>
        <button
            onmousedown={(e) => handleResizeStart(e, "ne")}
            class="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full cursor-ne-resize z-20"
        ></button>
        <button
            onmousedown={(e) => handleResizeStart(e, "sw")}
            class="absolute -bottom-1 -left-1 w-3 h-3 bg-accent rounded-full cursor-sw-resize z-20"
        ></button>
        <button
            onmousedown={(e) => handleResizeStart(e, "nw")}
            class="absolute -top-1 -left-1 w-3 h-3 bg-accent rounded-full cursor-nw-resize z-20"
        ></button>

        <!-- Edges -->
        <button
            onmousedown={(e) => handleResizeStart(e, "e")}
            class="absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-8 bg-accent rounded-full cursor-e-resize z-20"
        ></button>
        <button
            onmousedown={(e) => handleResizeStart(e, "s")}
            class="absolute left-1/2 -translate-x-1/2 -bottom-1 w-8 h-3 bg-accent rounded-full cursor-s-resize z-20"
        ></button>
        <button
            onmousedown={(e) => handleResizeStart(e, "w")}
            class="absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-8 bg-accent rounded-full cursor-w-resize z-20"
        ></button>
        <button
            onmousedown={(e) => handleResizeStart(e, "n")}
            class="absolute left-1/2 -translate-x-1/2 -top-1 w-8 h-3 bg-accent rounded-full cursor-n-resize z-20"
        ></button>
    {/if}

    <!-- Backdrop -->
    {#if editState.isEditing}
        <div
            role="button"
            tabindex="0"
            class="fixed inset-0 bg-black/40 z-[49] backdrop-blur-sm cursor-default"
            onclick={(e) => {
                e.stopPropagation();
                editState.isEditing = false;
            }}
            onkeydown={(e) => {
                if(e.key === "Escape") editState.isEditing = false;
            }}
            transition:fade={{ duration: 200 }}
        ></div>
    {/if}

    <!-- Block content -->
    <div
        class="w-full rounded-md transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] {originClass} {editState.isEditing
            ? 'absolute top-0 min-h-[300px] min-w-[320px] h-auto z-[60] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] bg-background scale-[1.05] border-2 border-accent ring-4 ring-accent/20 overflow-visible'
            : 'h-full overflow-hidden border-transparent'}"
    >
        {#if block.type === "text"}
            <TextBlock {block} {editState} onUpdate={handleBlockUpdate} />
        {:else if block.type === "link"}
            <LinkBlock {block} {editState} onUpdate={handleBlockUpdate} />
        {:else if block.type === "image"}
            <ImageBlock {block} {editState} onUpdate={handleBlockUpdate} />
        {:else if block.type === "heading"}
            <HeadingBlock {block} {editState} onUpdate={handleBlockUpdate} />
        {:else if block.type === "video"}
            <VideoBlock {block} {editState} onUpdate={handleBlockUpdate} />
        {:else}
            <div class="p-4 text-muted">Unknown block type</div>
        {/if}
    </div>
</div>
