<script lang="ts">
    import type { Block } from "$lib/types/models";
    import UnifiedBlock from "./UnifiedBlock.svelte";
    import { Plus } from "lucide-svelte";

    interface Props {
        blocks: Block[];
        editable: boolean;
        onUpdate?: (blocks: Block[]) => void;
    }

    let { blocks = [], editable = false, onUpdate }: Props = $props();

    let selectedBlockId = $state<string | null>(null);

    const GRID_COLS = 12;

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
    function wouldCollide(updatedBlock: Block): boolean {
        return blocks.some(
            (block) =>
                block.id !== updatedBlock.id &&
                blocksOverlap(updatedBlock, block),
        );
    }

    function updateBlock(updatedBlock: Block) {
        if (!editable || !onUpdate) return;

        // Prevent update if it would cause a collision
        if (wouldCollide(updatedBlock)) {
            return;
        }

        const newBlocks = blocks.map((b) =>
            b.id === updatedBlock.id ? updatedBlock : b,
        );
        onUpdate(newBlocks);
    }

    function deleteBlock(id: string) {
        if (!editable || !onUpdate) return;
        const newBlocks = blocks.filter((b) => b.id !== id);
        onUpdate(newBlocks);
        selectedBlockId = null;
    }
</script>

<!-- Grid avec espacement moderne - pas de max-width ici, c'est géré par le parent -->
<div
    data-grid
    class="relative"
    style="display: grid; grid-template-columns: repeat({GRID_COLS}, 1fr); grid-template-rows: repeat({GRID_ROWS}, 40px); gap: 12px;"
>
    {#if editable && blocks.length === 0}
        <div
            class="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
        >
            <div class="bg-border/30 rounded-2xl p-12 max-w-md">
                <Plus size={48} class="text-muted mb-4 mx-auto" />
                <h3 class="text-lg font-semibold text-text mb-2">
                    Add your first block
                </h3>
                <p class="text-sm text-muted">
                    Use the toolbar at the bottom to add text, links, or images
                    to your page
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
            onDelete={editable ? () => deleteBlock(block.id) : undefined}
        />
    {/each}
</div>
