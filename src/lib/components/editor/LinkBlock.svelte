<script lang="ts">
    import type { Block } from "$lib/types/models";
    import { ExternalLink } from "lucide-svelte";
    import { onMount } from "svelte";

    interface Props {
        block: Block;
        editable?: boolean;
        onUpdate?: (data: any) => void;
    }

    let { block, editable = true, onUpdate }: Props = $props();

    let editTitle = $state("");
    let editUrl = $state("");
    let editing = $state(false);
    let containerRef = $state<HTMLDivElement>();
    let initialTitle = $state("");
    let initialUrl = $state("");

    // Action for auto-focusing
    function autofocus(node: HTMLElement) {
        node.focus();
    }

    // Use block data directly when not editing
    const title = $derived(
        editing ? editTitle : block.data.title || "Link Title",
    );
    const url = $derived(editing ? editUrl : block.data.url || "https://");
    const iconSvg = $derived(block.data.iconSvg);
    const iconHex = $derived(block.data.iconHex);
    const favicon = $derived(block.data.socialData?.favicon);

    // Determine display mode based on block size
    const socialData = $derived(block.data.socialData);
    const hasImages = $derived(
        socialData?.images && socialData.images.length > 0,
    );
    const isSingleImage = $derived(
        socialData?.images && socialData.images.length === 1,
    );
    const isMultipleImages = $derived(
        socialData?.images && socialData.images.length > 1,
    );

    // Display modes (like Bento):
    // - Small squares (w=1 OR 4x4): Vertical centered (icon on top, title below, NO photos)
    // - Rectangles (w=2): Icon + title horizontal (NO photos)
    // - Medium/Large squares (8x4+): Icon + title + photos
    const isSquareMode = $derived(
        block.w === 1 || (block.w === 4 && block.h === 4),
    );
    const showPhotos = $derived(!isSquareMode && hasImages && block.h >= 4);

    function startEditing() {
        if (!editable) return;
        editing = true;
        editTitle = block.data.title || "Link Title";
        editUrl = block.data.url || "https://";
        initialTitle = editTitle;
        initialUrl = editUrl;
    }

    function saveAndClose() {
        // Only update if something actually changed
        if (editTitle !== initialTitle || editUrl !== initialUrl) {
            onUpdate?.({ title: editTitle, url: editUrl });
        }
        editing = false;
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

{#if editing}
    <div bind:this={containerRef} class="h-full w-full p-4 space-y-2">
        <input
            type="text"
            value={editTitle}
            oninput={(e) => {
                editTitle = e.currentTarget.value;
            }}
            placeholder="Link title"
            class="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
            use:autofocus
        />
        <input
            type="url"
            value={editUrl}
            oninput={(e) => {
                editUrl = e.currentTarget.value;
            }}
            placeholder="https://example.com"
            class="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
        />
    </div>
{:else if isSquareMode}
    <!-- Square mode (w=1 or 4x4): Vertical centered layout with icon on top, title below -->
    <a
        href={editable ? undefined : url}
        target={editable ? undefined : "_blank"}
        rel={editable ? undefined : "noopener noreferrer"}
        onclick={editable ? startEditing : undefined}
        class="h-full w-full p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-border/30 transition-colors"
    >
        {#if iconSvg && iconHex}
            <div
                class="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 flex items-center justify-center rounded-lg"
                style="background-color: #{iconHex};"
            >
                {@html `<svg viewBox="0 0 24 24" class="w-6 h-6 sm:w-10 sm:h-10" fill="white">${iconSvg}</svg>`}
            </div>
        {:else if favicon}
            <div
                class="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 flex items-center justify-center rounded-lg bg-secondary/50"
            >
                <img
                    src={favicon}
                    alt=""
                    class="w-6 h-6 sm:w-10 sm:h-10 object-contain"
                    loading="lazy"
                    style="image-rendering: -webkit-optimize-contrast;"
                />
            </div>
        {/if}
        <p
            class="font-semibold text-text text-base sm:text-sm leading-tight text-center text-balance w-full"
        >
            {title}
        </p>
    </a>
{:else if showPhotos && isSingleImage}
    <!-- Single image (Open Graph): Show icon + title + large image -->
    <a
        href={editable ? undefined : url}
        target={editable ? undefined : "_blank"}
        rel={editable ? undefined : "noopener noreferrer"}
        onclick={editable ? startEditing : undefined}
        class="h-full w-full p-4 flex flex-col gap-3 cursor-pointer hover:bg-border/30 transition-colors text-left block"
    >
        <div class="flex items-center gap-3">
            {#if iconSvg && iconHex}
                <div
                    class="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-md"
                    style="background-color: #{iconHex};"
                >
                    {@html `<svg viewBox="0 0 24 24" class="w-6 h-6" fill="white">${iconSvg}</svg>`}
                </div>
            {:else if favicon}
                <div
                    class="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-md bg-secondary/50"
                >
                    <img
                        src={favicon}
                        alt=""
                        class="w-6 h-6 object-contain"
                        loading="lazy"
                        style="image-rendering: -webkit-optimize-contrast;"
                    />
                </div>
            {/if}
            <div class="flex-1 min-w-0">
                <p class="font-semibold text-text truncate">{title}</p>
                {#if socialData?.description}
                    <p class="text-xs text-muted line-clamp-1">
                        {socialData.description}
                    </p>
                {/if}
            </div>
            <ExternalLink size={18} class="text-muted flex-shrink-0" />
        </div>

        <!-- Single large image taking full width -->
        <div
            class="flex-1 bg-secondary/50 rounded overflow-hidden min-h-0 flex items-center justify-center"
        >
            <img
                src={socialData.images[0]}
                alt=""
                class="w-full h-full object-contain"
                loading="lazy"
            />
        </div>
    </a>
{:else if showPhotos && isMultipleImages}
    <!-- Multiple images (Instagram): Show icon + title + photo grid -->
    <a
        href={editable ? undefined : url}
        target={editable ? undefined : "_blank"}
        rel={editable ? undefined : "noopener noreferrer"}
        onclick={editable ? startEditing : undefined}
        class="h-full w-full p-4 flex flex-col gap-3 cursor-pointer hover:bg-border/30 transition-colors text-left block"
    >
        <div class="flex items-center gap-3">
            {#if iconSvg && iconHex}
                <div
                    class="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-md"
                    style="background-color: #{iconHex};"
                >
                    {@html `<svg viewBox="0 0 24 24" class="w-6 h-6" fill="white">${iconSvg}</svg>`}
                </div>
            {:else if favicon}
                <div
                    class="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-md bg-secondary/50"
                >
                    <img
                        src={favicon}
                        alt=""
                        class="w-6 h-6 object-contain"
                        loading="lazy"
                        style="image-rendering: -webkit-optimize-contrast;"
                    />
                </div>
            {/if}
            <div class="flex-1 min-w-0">
                <p class="font-semibold text-text truncate">{title}</p>
                {#if socialData?.username}
                    <p class="text-xs text-muted">@{socialData.username}</p>
                {/if}
            </div>
            <ExternalLink size={18} class="text-muted flex-shrink-0" />
        </div>

        <!-- Photo grid: 6 photos in 3x2 grid -->
        <div class="grid grid-cols-3 gap-1">
            {#each socialData.images.slice(0, 6) as image}
                <div
                    class="aspect-square bg-secondary/50 rounded overflow-hidden"
                >
                    <img
                        src={image}
                        alt=""
                        class="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
            {/each}
        </div>
    </a>
{:else}
    <!-- Without photos: Just icon + title -->
    <a
        href={editable ? undefined : url}
        target={editable ? undefined : "_blank"}
        rel={editable ? undefined : "noopener noreferrer"}
        onclick={editable ? startEditing : undefined}
        class="h-full w-full p-4 flex items-center gap-3 cursor-pointer hover:bg-border/30 transition-colors text-left block"
    >
        {#if iconSvg && iconHex}
            <div
                class="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-md"
                style="background-color: #{iconHex};"
            >
                {@html `<svg viewBox="0 0 24 24" class="w-6 h-6" fill="white">${iconSvg}</svg>`}
            </div>
        {:else if favicon}
            <div
                class="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-md bg-secondary/50"
            >
                <img
                    src={favicon}
                    alt=""
                    class="w-6 h-6 object-contain"
                    loading="lazy"
                    style="image-rendering: -webkit-optimize-contrast;"
                />
            </div>
        {/if}
        <div class="flex-1 min-w-0">
            <p class="font-semibold text-text truncate">{title}</p>
            {#if socialData?.username}
                <p class="text-xs text-muted">@{socialData.username}</p>
            {/if}
        </div>
        <ExternalLink size={18} class="text-muted flex-shrink-0" />
    </a>
{/if}
