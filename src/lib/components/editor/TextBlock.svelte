<script lang="ts">
    import type { Block } from "$lib/types/models";
    import { onMount } from "svelte";
    import { t } from "svelte-i18n";

    interface Props {
        block: Block;
        editable?: boolean;
        onUpdate?: (data: any) => void;
        onDelete?: () => void;
        onResize?: (w: number, h: number) => void;
    }

    let {
        block,
        editable = true,
        onUpdate,
        onDelete,
        onResize,
    }: Props = $props();

    let editing = $state(false);
    let containerRef: HTMLDivElement;
    let editableRef: HTMLDivElement;
    let initialText = $state("");

    // Sync content when block data changes
    $effect(() => {
        if (editableRef && !editing && block.data.text !== undefined) {
            editableRef.textContent = block.data.text;
        }
    });

    function handleInput(e: Event) {
        // Auto-resize removed to allow manual sizing via presets
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
        editing = false;
    }

    function handleFocus() {
        if (!editable) return;
        editing = true;
        if (editableRef) {
            const currentText = editableRef.textContent?.trim() || "";
            initialText = currentText;
            // If it's the placeholder text or empty, clear it
            if (currentText === $t("blocks.text.placeholder") || !currentText) {
                editableRef.textContent = "";
                initialText = "";
            }
            // Focus and set cursor to end
            setTimeout(() => {
                editableRef.focus();
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(editableRef);
                range.collapse(false);
                sel?.removeAllRanges();
                sel?.addRange(range);
            }, 0);
        }
    }

    onMount(() => {
        if (!editable) return;

        function handleClickOutside(e: MouseEvent) {
            if (
                editing &&
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

<div bind:this={containerRef} class="h-full w-full p-4">
    <div
        bind:this={editableRef}
        contenteditable={editable && editing}
        onclick={(e) => {
            if (editable && !editing) {
                e.stopPropagation();
                handleFocus();
            }
        }}
        onfocus={handleFocus}
        oninput={handleInput}
        class="h-full w-full outline-none text-text {editable && !editing
            ? 'cursor-grab'
            : editing
              ? 'cursor-text'
              : ''}"
    >
        {block.data.text || (editable ? $t("blocks.text.placeholder") : "")}
    </div>
</div>
