<script lang="ts">
    import type { Block } from "$lib/types/models";
    import UnifiedBlock from "./UnifiedBlock.svelte";
    import { Plus } from "lucide-svelte";
    import { t } from "svelte-i18n";
    import { GRID_CONFIG } from "$lib/constants/blockSizes";

    interface Props {
        blocks: Block[];
        editable: boolean;
        onUpdate?: (blocks: Block[]) => void;
    }

    let { blocks = [], editable = false, onUpdate }: Props = $props();

    let selectedBlockId = $state<string | null>(null);
    let draggingBlockId = $state<string | null>(null);
    let dragPreviewPos = $state<{ x: number; y: number; w: number; h: number } | null>(null);

    const GRID_COLS = GRID_CONFIG.cols;

    // Calculate grid rows dynamically based on content
    const maxRow = $derived(
        blocks.length > 0 ? Math.max(...blocks.map((b) => b.y + b.h)) : 0,
    );

    // If editable, add extra space for editing; otherwise, fit content
    const GRID_ROWS = $derived(
        editable ? Math.max(10, maxRow + 2) : Math.max(1, maxRow),
    );

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
    function wouldCollide(updatedBlock: Block, blocksList: Block[] = blocks): boolean {
        return blocksList.some(
            (block) =>
                block.id !== updatedBlock.id &&
                blocksOverlap(updatedBlock, block),
        );
    }

    // Compact blocks: place from top-left, left to right, no gaps
    function compactBlocks(blocksList: Block[]): Block[] {
        if (blocksList.length === 0) return [];

        // Sort by Y, then X (respects order)
        const sorted = [...blocksList].sort((a, b) => {
            if (a.y !== b.y) return a.y - b.y;
            return a.x - b.x;
        });

        const placed: Block[] = [];

        for (const block of sorted) {
            let finalX = 0;
            let finalY = 0;
            let found = false;

            // Rectangles (w=2) must be at even positions (0, 2), w=4 at 0 only
            const step = block.w === 2 ? 2 : block.w === 4 ? 4 : 1;

            // Try to find the first available position from top-left
            for (let testY = 0; testY < 100 && !found; testY++) {
                for (let testX = 0; testX <= GRID_COLS - block.w && !found; testX += step) {
                    const testBlock = { ...block, x: testX, y: testY };

                    // Check if this position is free
                    const collision = placed.find(p => blocksOverlap(testBlock, p));

                    if (!collision) {
                        finalX = testX;
                        finalY = testY;
                        found = true;
                    }
                }
            }

            placed.push({ ...block, x: finalX, y: finalY });
        }

        return placed;
    }

    // Find next available position for a new block (used when adding blocks)
    function findNextAvailablePosition(w: number, h: number, existingBlocks: Block[]): { x: number; y: number } {
        // Rectangles (w=2) must be at even positions (0, 2), w=4 at 0 only
        const step = w === 2 ? 2 : w === 4 ? 4 : 1;

        // Try to place the block row by row, left to right
        for (let testY = 0; testY < 50; testY++) {
            for (let testX = 0; testX <= GRID_COLS - w; testX += step) {
                const testBlock = { id: 'temp', type: 'temp', x: testX, y: testY, w, h, data: {} } as Block;

                if (!wouldCollide(testBlock, existingBlocks)) {
                    return { x: testX, y: testY };
                }
            }
        }

        // Fallback: place at bottom
        return { x: 0, y: existingBlocks.length > 0 ? Math.max(...existingBlocks.map(b => b.y + b.h)) : 0 };
    }

    function updateBlock(updatedBlock: Block) {
        if (!editable || !onUpdate) return;

        // During drag, show real-time preview of where blocks will end up
        if (draggingBlockId === updatedBlock.id) {
            // Compact all other blocks around the dragged block (treated as fixed obstacle)
            const blocksWithoutDragged = blocks.filter(b => b.id !== updatedBlock.id);
            const compacted = compactBlocksWithObstacle(blocksWithoutDragged, updatedBlock);

            // Placeholder stays exactly where user is dragging
            dragPreviewPos = { x: updatedBlock.x, y: updatedBlock.y, w: updatedBlock.w, h: updatedBlock.h };

            // Get original dragged block to keep it at its visual position
            const originalDragged = blocks.find(b => b.id === updatedBlock.id);
            if (originalDragged) {
                onUpdate([...compacted, originalDragged]);
            }
        } else {
            // Regular update without compacting
            const newBlocks = blocks.map((b) =>
                b.id === updatedBlock.id ? updatedBlock : b,
            );
            onUpdate(newBlocks);
        }
    }

    // Compact blocks completely (find first position from top-left) while avoiding an obstacle
    function compactBlocksWithObstacle(blocksList: Block[], obstacle: Block): Block[] {
        if (blocksList.length === 0) return [];

        // Sort by Y, then X
        const sorted = [...blocksList].sort((a, b) => {
            if (a.y !== b.y) return a.y - b.y;
            return a.x - b.x;
        });

        const placed: Block[] = [];

        for (const block of sorted) {
            let finalX = 0;
            let finalY = 0;
            let found = false;

            // Rectangles (w=2) must be at even positions (0, 2), w=4 at 0 only
            const step = block.w === 2 ? 2 : block.w === 4 ? 4 : 1;

            // Find first available position from top-left, avoiding obstacle
            for (let testY = 0; testY < 100 && !found; testY++) {
                for (let testX = 0; testX <= GRID_COLS - block.w && !found; testX += step) {
                    const testBlock = { ...block, x: testX, y: testY };

                    // Check collision with placed blocks AND obstacle
                    const collisionWithPlaced = placed.find(p => blocksOverlap(testBlock, p));
                    const collisionWithObstacle = blocksOverlap(testBlock, obstacle);

                    if (!collisionWithPlaced && !collisionWithObstacle) {
                        finalX = testX;
                        finalY = testY;
                        found = true;
                    }
                }
            }

            placed.push({ ...block, x: finalX, y: finalY });
        }

        return placed;
    }

    // Compact blocks around an obstacle (the dragged block)
    // Try to place each block as high as possible
    function compactBlocksAround(blocksList: Block[], obstacle: Block): Block[] {
        if (blocksList.length === 0) return [];

        // Sort by Y, then X
        const sorted = [...blocksList].sort((a, b) => {
            if (a.y !== b.y) return a.y - b.y;
            return a.x - b.x;
        });

        const placed: Block[] = [];

        for (const block of sorted) {
            const finalX = block.x;
            let finalY = 0; // Start from the top to fill gaps

            // Find the first position from top that doesn't collide
            let attempts = 0;
            while (attempts < 100) {
                const testBlock = { ...block, x: finalX, y: finalY };

                // Check collision with already placed blocks AND the obstacle
                const collidesWithPlaced = placed.find(p => blocksOverlap(testBlock, p));
                const collidesWithObstacle = blocksOverlap(testBlock, obstacle);

                if (!collidesWithPlaced && !collidesWithObstacle) {
                    placed.push({ ...block, x: finalX, y: finalY });
                    break;
                }

                // Jump to just below the collision
                if (collidesWithObstacle) {
                    finalY = Math.max(finalY + 1, obstacle.y + obstacle.h);
                } else if (collidesWithPlaced) {
                    finalY = Math.max(finalY + 1, collidesWithPlaced.y + collidesWithPlaced.h);
                }

                attempts++;
            }

            if (attempts >= 100) {
                placed.push({ ...block, x: finalX, y: finalY });
            }
        }

        return placed;
    }

    function updateBlockAndCompact(updatedBlock: Block) {
        if (!editable || !onUpdate) return;

        // Simple approach: just update the block, don't compact
        // Only push down blocks that would overlap
        const newBlocks = blocks.map((b) => b.id === updatedBlock.id ? updatedBlock : b);

        // Check for overlaps and push overlapping blocks down
        const fixed = pushOverlappingBlocks(newBlocks, updatedBlock.id);

        // Compact to remove any horizontal gaps (prevent 3 columns)
        const compacted = compactBlocks(fixed);
        onUpdate(compacted);
    }

    // Simple collision resolution: push overlapping blocks down
    function pushOverlappingBlocks(blocksList: Block[], movedBlockId: string): Block[] {
        const movedBlock = blocksList.find(b => b.id === movedBlockId);
        if (!movedBlock) return blocksList;

        let result = [...blocksList];
        let changed = true;

        // Keep pushing down until no more overlaps
        while (changed) {
            changed = false;
            for (let i = 0; i < result.length; i++) {
                const block = result[i];
                if (block.id === movedBlockId) continue;

                // Check if this block overlaps with the moved block
                if (blocksOverlap(block, movedBlock)) {
                    // Push it down below the moved block
                    result[i] = { ...block, y: movedBlock.y + movedBlock.h };
                    changed = true;
                }
            }
        }

        return result;
    }

    async function deleteBlock(id: string) {
        if (!editable || !onUpdate) return;

        // Find the block being deleted
        const blockToDelete = blocks.find((b) => b.id === id);

        // If it's a link block with social data, cleanup MinIO (images and/or favicon)
        if (blockToDelete?.type === 'link' && blockToDelete.data?.socialData) {
            const { images, favicon } = blockToDelete.data.socialData;

            if ((images && images.length > 0) || favicon) {
                try {
                    await fetch('/api/social/cleanup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            imageUrls: images || [],
                            favicon: favicon || null
                        })
                    });
                    console.log('Cleaned up social data from MinIO');
                } catch (e) {
                    console.error('Failed to cleanup social data:', e);
                    // Continue with deletion even if cleanup fails
                }
            }
        }

        const newBlocks = blocks.filter((b) => b.id !== id);
        const compactedBlocks = compactBlocks(newBlocks);
        onUpdate(compactedBlocks);
        selectedBlockId = null;
    }

    function handleGridClick(e: MouseEvent) {
        // Deselect block when clicking on the grid background (not on a block)
        if (editable && e.target === e.currentTarget) {
            selectedBlockId = null;
        }
    }

    function handleDragStart(blockId: string) {
        draggingBlockId = blockId;
        const block = blocks.find(b => b.id === blockId);
        if (block) {
            dragPreviewPos = { x: block.x, y: block.y, w: block.w, h: block.h };
        }
    }

    function handleDragEnd() {
        // Place dragged block exactly at placeholder position and push others around it
        if (draggingBlockId && dragPreviewPos) {
            const draggedBlock = blocks.find(b => b.id === draggingBlockId);
            if (draggedBlock) {
                // Block at final position (same as placeholder)
                const finalBlock = { ...draggedBlock, x: dragPreviewPos.x, y: dragPreviewPos.y };

                // Compact others around it (same logic as during drag)
                const otherBlocks = blocks.filter(b => b.id !== draggingBlockId);
                const compacted = compactBlocksWithObstacle(otherBlocks, finalBlock);

                onUpdate([...compacted, finalBlock]);
            }
        }

        draggingBlockId = null;
        dragPreviewPos = null;
    }
</script>

<!-- Grid avec espacement moderne - tailles fixes comme Bento -->
<div
    data-grid
    class="relative mx-auto select-none outline-none"
    style="display: grid; grid-template-columns: repeat({GRID_COLS}, {GRID_CONFIG.cellWidth}px); grid-template-rows: repeat({GRID_ROWS}, {GRID_CONFIG.cellHeight}px); gap: {GRID_CONFIG.gap}px; width: fit-content;"
    onclick={handleGridClick}
>
    {#if editable && blocks.length === 0}
        <div
            class="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
        >
            <div class="bg-border/30 rounded-2xl p-12 max-w-md">
                <Plus size={48} class="text-muted mb-4 mx-auto" />
                <h3 class="text-lg font-semibold text-text mb-2">
                    {$t('grid.empty_title')}
                </h3>
                <p class="text-sm text-muted">
                    {$t('grid.empty_desc')}
                </p>
            </div>
        </div>
    {/if}

    <!-- Placeholder pour le bloc en drag -->
    {#if draggingBlockId && dragPreviewPos}
        <div
            style="grid-column: {dragPreviewPos.x + 1} / span {dragPreviewPos.w}; grid-row: {dragPreviewPos.y + 1} / span {dragPreviewPos.h};"
            class="rounded-md bg-border/30 pointer-events-none"
        ></div>
    {/if}

    {#each blocks as block (block.id)}
        <UnifiedBlock
            {block}
            {editable}
            gridCols={GRID_COLS}
            gridRows={GRID_ROWS}
            allBlocks={blocks}
            isSelected={selectedBlockId === block.id}
            isDragging={draggingBlockId === block.id}
            onSelect={editable ? () => (selectedBlockId = block.id) : undefined}
            onUpdate={editable ? updateBlock : undefined}
            onUpdateAndCompact={editable ? updateBlockAndCompact : undefined}
            onDelete={editable ? () => deleteBlock(block.id) : undefined}
            onDragStart={editable ? () => handleDragStart(block.id) : undefined}
            onDragEnd={editable ? handleDragEnd : undefined}
        />
    {/each}
</div>
