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
            position: "left" as const,
            size: "medium" as const,
            shape: "circle" as const,
            visibility: "letter" as const,
            layout: "vertical" as const,
        },
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
            <span class="block text-sm font-medium text-text">{$t('editor.profile_modal.photo_label')}</span>
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
            <span class="block text-sm font-medium text-text">{$t('editor.profile_modal.display_label')}</span>
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

        {#if currentPhoto.visibility !== "hidden"}
            <!-- Size -->
            <div class="space-y-3">
                <span class="block text-sm font-medium text-text">{$t('editor.profile_modal.size_label')}</span>
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
                <span class="block text-sm font-medium text-text">{$t('editor.profile_modal.shape_label')}</span>
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
