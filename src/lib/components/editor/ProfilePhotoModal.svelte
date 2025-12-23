<script lang="ts">
    import { Modal, Button, Input } from "$lib/components/ui";
    import type { PageSettings } from "$lib/types/models";
    import { t } from "svelte-i18n";

    interface Props {
        open: boolean;
        profilePhoto: PageSettings["profilePhoto"];
        onClose: () => void;
        onUpdate: (photo: PageSettings["profilePhoto"]) => void;
        onUpload: (file: File) => void;
        onRemove: () => void;
        uploading?: boolean;
    }

    let {
        open = $bindable(),
        profilePhoto,
        onClose,
        onUpdate,
        onUpload,
        onRemove,
        uploading = false,
    }: Props = $props();

    let fileInput: HTMLInputElement;

    const currentPhoto = $derived(
        profilePhoto || {
            position: "center" as const,
            size: "medium" as const,
            shape: "circle" as const,
            visibility: "letter" as const,
            layout: "vertical" as const,
        },
    );

    // Check if in sidebar mode (layout option not applicable)
    const isSidebar = $derived(
        currentPhoto.position === "left" || currentPhoto.position === "right",
    );

    function handleFileSelect(e: Event) {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
            onUpload(file);
            target.value = "";
        }
    }

    function updateSettings(updates: Partial<PageSettings["profilePhoto"]>) {
        onUpdate({ ...currentPhoto, ...updates });
    }
</script>

<input
    type="file"
    accept="image/*"
    bind:this={fileInput}
    onchange={handleFileSelect}
    class="hidden"
/>

<Modal bind:open {onClose} title={$t('editor.profile_modal.title')}>
    <div class="space-y-6">
        <!-- Upload/Remove Actions -->
        <div class="space-y-3">
            <label class="text-sm font-medium text-text">{$t('editor.profile_modal.photo_label')}</label>
            <div class="flex gap-2">
                <Button
                    variant="secondary"
                    size="sm"
                    onclick={() => fileInput?.click()}
                    disabled={uploading}
                    class="flex-1"
                >
                    {uploading
                        ? $t('editor.profile_modal.uploading')
                        : currentPhoto.url
                          ? $t('editor.profile_modal.change_photo')
                          : $t('editor.profile_modal.upload_photo')}
                </Button>
                {#if currentPhoto.url}
                    <Button
                        variant="ghost"
                        size="sm"
                        onclick={onRemove}
                        disabled={uploading}
                    >
                        {$t('common.remove')}
                    </Button>
                {/if}
            </div>
        </div>

        <!-- Display Mode -->
        <div class="space-y-3">
            <label class="text-sm font-medium text-text">{$t('editor.profile_modal.display_label')}</label>
            <div class="grid grid-cols-3 gap-2">
                <button
                    class="px-3 py-2 text-sm rounded border-2 transition-colors {currentPhoto.visibility ===
                    'photo'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-text'}"
                    onclick={() => updateSettings({ visibility: "photo" })}
                    disabled={!currentPhoto.url}
                >
                    {$t('editor.profile_modal.display_photo')}
                </button>
                <button
                    class="px-3 py-2 text-sm rounded border-2 transition-colors {currentPhoto.visibility ===
                    'letter'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-text'}"
                    onclick={() => updateSettings({ visibility: "letter" })}
                >
                    {$t('editor.profile_modal.display_letter')}
                </button>
                <button
                    class="px-3 py-2 text-sm rounded border-2 transition-colors {currentPhoto.visibility ===
                    'hidden'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-text'}"
                    onclick={() => updateSettings({ visibility: "hidden" })}
                >
                    {$t('editor.profile_modal.display_hidden')}
                </button>
            </div>
        </div>

        <!-- Position -->
        <div class="space-y-3">
            <label class="text-sm font-medium text-text">{$t('editor.profile_modal.position_label')}</label>
            <div class="grid grid-cols-3 gap-2">
                <button
                    class="px-3 py-2 text-sm rounded border-2 transition-colors {currentPhoto.position ===
                    'left'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-text'}"
                    onclick={() => updateSettings({ position: "left" })}
                >
                    {$t('editor.profile_modal.position_left')}
                </button>
                <button
                    class="px-3 py-2 text-sm rounded border-2 transition-colors {currentPhoto.position ===
                    'center'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-text'}"
                    onclick={() => updateSettings({ position: "center" })}
                >
                    {$t('editor.profile_modal.position_center')}
                </button>
                <button
                    class="px-3 py-2 text-sm rounded border-2 transition-colors {currentPhoto.position ===
                    'right'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-text'}"
                    onclick={() => updateSettings({ position: "right" })}
                >
                    {$t('editor.profile_modal.position_right')}
                </button>
            </div>
        </div>

        <!-- Header Layout (only for center position) -->
        {#if !isSidebar}
            <div class="space-y-3">
                <label class="text-sm font-medium text-text"
                    >{$t('editor.profile_modal.layout_label')}</label
                >
                <div class="grid grid-cols-3 gap-2">
                    <button
                        class="px-3 py-2 text-sm rounded border-2 transition-colors {(currentPhoto.layout ||
                            'vertical') === 'vertical'
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border hover:border-text'}"
                        onclick={() => updateSettings({ layout: "vertical" })}
                    >
                        <div class="font-medium">{$t('editor.profile_modal.layout_vertical')}</div>
                        <div class="text-xs text-muted mt-0.5">
                            {$t('editor.profile_modal.layout_vertical_desc')}
                        </div>
                    </button>
                    <button
                        class="px-3 py-2 text-sm rounded border-2 transition-colors {currentPhoto.layout ===
                        'horizontal-left'
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border hover:border-text'}"
                        onclick={() =>
                            updateSettings({ layout: "horizontal-left" })}
                    >
                        <div class="font-medium">{$t('editor.profile_modal.layout_photo_left')}</div>
                        <div class="text-xs text-muted mt-0.5">
                            {$t('editor.profile_modal.layout_photo_left_desc')}
                        </div>
                    </button>
                    <button
                        class="px-3 py-2 text-sm rounded border-2 transition-colors {currentPhoto.layout ===
                        'horizontal-right'
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border hover:border-text'}"
                        onclick={() =>
                            updateSettings({ layout: "horizontal-right" })}
                    >
                        <div class="font-medium">{$t('editor.profile_modal.layout_photo_right')}</div>
                        <div class="text-xs text-muted mt-0.5">
                            {$t('editor.profile_modal.layout_photo_right_desc')}
                        </div>
                    </button>
                </div>
            </div>
        {/if}

        {#if currentPhoto.visibility !== "hidden"}
            <!-- Size -->
            <div class="space-y-3">
                <label class="text-sm font-medium text-text">{$t('editor.profile_modal.size_label')}</label>
                <div class="grid grid-cols-3 gap-2">
                    {#each [{ id: "small", key: "editor.title_modal.sizes.small" }, { id: "medium", key: "editor.title_modal.sizes.medium" }, { id: "large", key: "editor.title_modal.sizes.large" }] as size}
                        <button
                            class="px-3 py-2 text-sm rounded border-2 transition-colors {currentPhoto.size ===
                            size.id
                                ? 'border-accent bg-accent/10 text-accent'
                                : 'border-border hover:border-text'}"
                            onclick={() =>
                                updateSettings({
                                    size: size.id as
                                        | "small"
                                        | "medium"
                                        | "large",
                                })}
                        >
                            {$t(size.key)}
                        </button>
                    {/each}
                </div>
            </div>

            <!-- Shape -->
            <div class="space-y-3">
                <label class="text-sm font-medium text-text">{$t('editor.profile_modal.shape_label')}</label>
                <div class="grid grid-cols-3 gap-2">
                    {#each ["circle", "square", "rounded"] as shp}
                        <button
                            class="px-3 py-2 text-sm rounded border-2 transition-colors capitalize {currentPhoto.shape ===
                            shp
                                ? 'border-accent bg-accent/10 text-accent'
                                : 'border-border hover:border-text'}"
                            onclick={() =>
                                updateSettings({
                                    shape: shp as
                                        | "circle"
                                        | "square"
                                        | "rounded",
                                })}
                        >
                            {$t('editor.profile_modal.shapes.' + shp)}
                        </button>
                    {/each}
                </div>
            </div>
        {/if}

        <div class="flex justify-end pt-4 border-t border-border">
            <Button variant="primary" onclick={onClose}>{$t('common.done')}</Button>
        </div>
    </div>
</Modal>
