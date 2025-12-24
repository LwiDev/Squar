<script lang="ts">
    import type { Block } from "$lib/types/models";
    import UnifiedBlock from "./UnifiedBlock.svelte";
    import { Plus } from "lucide-svelte";
    import { t } from "svelte-i18n";

    interface Props {
        blocks: Block[];
        editable: boolean;
        onUpdate?: (blocks: Block[]) => void;
    }

    let { blocks = [], editable = false, onUpdate }: Props = $props();

    let selectedBlockId = $state<string | null>(null);

    const GRID_COLS = 16;

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

    // Compact blocks - organize in horizontal bands (like Bento)
    // Each band is 4 rows tall (height of a Carré)
    function compactBlocks(blocksList: Block[]): Block[] {
        // Sort blocks by Y position first, then X position (reading order)
        const sorted = [...blocksList].sort((a, b) => {
            if (a.y !== b.y) return a.y - b.y;
            return a.x - b.x;
        });

        const compacted: Block[] = [];

        for (const block of sorted) {
            let bestY = block.y;
            let bestX = block.x;
            let foundBetter = false;

            // Try to place in horizontal bands (prefer Y at band boundaries)
            // Band height = 4 (one Carré height)
            const maxBands = Math.ceil(block.y / 4) + 5;

            for (let band = 0; band < maxBands; band++) {
                // Try positions within this band and adjacent rows
                const bandY = band * 4;

                // For small blocks (h=2), can be placed at any Y
                // For medium blocks (h=4), prefer band boundaries (Y = 0, 4, 8...)
                // For large blocks (h=8), must align to even bands
                const yPositions = block.h <= 2
                    ? [bandY, bandY + 1, bandY + 2]
                    : block.h <= 4
                        ? [bandY]
                        : [bandY];

                for (const testY of yPositions) {
                    // Try each column from left to right
                    for (let testX = 0; testX <= GRID_COLS - block.w; testX++) {
                        const testBlock = { ...block, x: testX, y: testY };

                        if (!wouldCollide(testBlock, compacted)) {
                            // Found a valid position
                            bestY = testY;
                            bestX = testX;
                            foundBetter = true;
                            break;
                        }
                    }
                    if (foundBetter) break;
                }
                if (foundBetter) break;
            }

            // Add the block at the best position found
            compacted.push({ ...block, x: bestX, y: bestY });
        }

        return compacted;
    }

    // Find next available position for a new block (used when adding blocks)
    function findNextAvailablePosition(w: number, h: number, existingBlocks: Block[]): { x: number; y: number } {
        // Try to place the block row by row, left to right
        for (let testY = 0; testY < 50; testY++) {
            for (let testX = 0; testX <= GRID_COLS - w; testX++) {
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

        // Allow overlaps during drag - we'll compact at the end
        // This gives a better UX like Bento

        // Update without compacting (live drag/resize)
        const newBlocks = blocks.map((b) =>
            b.id === updatedBlock.id ? updatedBlock : b,
        );

        onUpdate(newBlocks);
    }

    function updateBlockAndCompact(updatedBlock: Block) {
        if (!editable || !onUpdate) return;

        // Update the block position
        const newBlocks = blocks.map((b) =>
            b.id === updatedBlock.id ? updatedBlock : b,
        );

        // Compact to remove gaps and organize layout
        const compactedBlocks = compactBlocks(newBlocks);
        onUpdate(compactedBlocks);
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
</script>

<!-- Grid avec espacement moderne - pas de max-width ici, c'est géré par le parent -->
<div
    data-grid
    class="relative"
    style="display: grid; grid-template-columns: repeat({GRID_COLS}, 26.5px); grid-template-rows: repeat({GRID_ROWS}, 26.5px); gap: 24px;"
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

    {#each blocks as block (block.id)}
        <UnifiedBlock
            {block}
            {editable}
            gridCols={GRID_COLS}
            gridRows={GRID_ROWS}
            isSelected={selectedBlockId === block.id}
            onSelect={editable ? () => (selectedBlockId = block.id) : undefined}
            onUpdate={editable ? updateBlock : undefined}
            onUpdateAndCompact={editable ? updateBlockAndCompact : undefined}
            onDelete={editable ? () => deleteBlock(block.id) : undefined}
        />
    {/each}
</div>
