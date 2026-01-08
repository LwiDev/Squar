<script lang="ts">
    import type { Block } from "$lib/types/models";
    import { onMount } from "svelte";
    import { t } from "svelte-i18n";

    interface Props {
        block: Block;
        editable?: boolean;
        editState?: { isEditing: boolean };
        onUpdate?: (data: any) => void;
        onDelete?: () => void;
    }

    let { block, editable = true, editState = undefined, onUpdate, onDelete }: Props = $props();

    const localEditState = $state({ isEditing: false });
    const state = $derived(editState ?? localEditState);

    let containerRef: HTMLDivElement;
    let editableRef: HTMLDivElement;
    let initialText = $state("");

    // Sync content when block data changes
    $effect(() => {
        if (editableRef && !state.isEditing && block.data.text !== undefined) {
            editableRef.textContent = block.data.text;
        }
    });

    function handleInput(e: Event) {
        // Just let contenteditable do its thing, don't update yet
    }

    function saveAndClose() {
        if (editableRef) {
            const newText = editableRef.textContent?.trim() || "";
            // Only update if text actually changed and is not empty
            if (newText && newText !== initialText) {
                onUpdate?.({ text: newText });
            }
            // Properly blur the element
            editableRef.blur();
        }
        state.isEditing = false;
    }

    function handleFocus() {
        if (!editable) return;
        state.isEditing = true;
        if (editableRef) {
            const currentText = editableRef.textContent?.trim() || "";
            initialText = currentText;
            // If it's the placeholder text or empty, clear it
            if (
                currentText === $t("blocks.heading.placeholder") ||
                !currentText
            ) {
                editableRef.textContent = "";
                initialText = "";
            }
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        // Prevent Enter key from creating new lines in headings
        if (e.key === "Enter") {
            e.preventDefault();
            saveAndClose();
            // Deselect the block by clicking on the grid background
            setTimeout(() => {
                const grid = document.querySelector(
                    "[data-grid]",
                ) as HTMLElement;
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
            if (
                state.isEditing &&
                containerRef &&
                !containerRef.contains(e.target as Node)
            ) {
                saveAndClose();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    });
</script>

<div bind:this={containerRef} class="h-full w-full p-4 flex items-center">
    <div
        bind:this={editableRef}
        contenteditable={editable && state.isEditing}
        role="textbox"
        aria-multiline="true"
        onclick={(e) => {
            if (editable && !state.isEditing) {
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
        onkeydown={state.isEditing ? handleKeydown : undefined}
        class="w-full outline-none text-text text-2xl font-bold {editable &&
        !state.isEditing
            ? 'cursor-grab'
            : state.isEditing
              ? 'cursor-text'
              : ''}"
    >
        {block.data.text || (editable ? $t("blocks.heading.placeholder") : "")}
    </div>
</div>
