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
        onResize?: (w: number, h: number) => void;
    }

    let {
        block,
        editable = true,
        editState = undefined,
        onUpdate,
        onDelete,
        onResize,
    }: Props = $props();

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
        state.isEditing = false;
    }

    function handleFocus() {
        if (!editable) return;
        state.isEditing = true;
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

    function handleKeydown(e: KeyboardEvent) {
        if (
            !state.isEditing &&
            editable &&
            (e.key === "Enter" || e.key === " ")
        ) {
            e.preventDefault();
            handleFocus();
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

<div bind:this={containerRef} class="h-full w-full p-4">
    <div
        bind:this={editableRef}
        contenteditable={editable && state.isEditing}
        role="textbox"
        tabindex="0"
        onclick={(e) => {
            if (editable && !state.isEditing) {
                e.stopPropagation();
                handleFocus();
            }
        }}
        onkeydown={handleKeydown}
        onfocus={handleFocus}
        oninput={handleInput}
        class="h-full w-full outline-none text-text {editable &&
        !state.isEditing
            ? 'cursor-grab'
            : state.isEditing
              ? 'cursor-text'
              : ''}"
    >
        {block.data.text || (editable ? $t("blocks.text.placeholder") : "")}
    </div>
</div>
