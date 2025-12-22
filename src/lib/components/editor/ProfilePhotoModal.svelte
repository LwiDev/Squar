<script lang="ts">
    import { Modal, Button, Input } from "$lib/components/ui";
    import type { PageSettings } from "$lib/types/models";

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

<Modal bind:open {onClose} title="Profile Photo Settings">
    <div class="space-y-6">
        <!-- Upload/Remove Actions -->
        <div class="space-y-3">
            <label class="text-sm font-medium text-text">Photo</label>
            <div class="flex gap-2">
                <Button
                    variant="secondary"
                    size="sm"
                    onclick={() => fileInput?.click()}
                    disabled={uploading}
                    class="flex-1"
                >
                    {uploading
                        ? "Uploading..."
                        : currentPhoto.url
                          ? "Change Photo"
                          : "Upload Photo"}
                </Button>
                {#if currentPhoto.url}
                    <Button
                        variant="ghost"
                        size="sm"
                        onclick={onRemove}
                        disabled={uploading}
                    >
                        Remove
                    </Button>
                {/if}
            </div>
        </div>

        <!-- Display Mode -->
        <div class="space-y-3">
            <label class="text-sm font-medium text-text">Display</label>
            <div class="grid grid-cols-3 gap-2">
                <button
                    class="px-3 py-2 text-sm rounded border-2 transition-colors {currentPhoto.visibility ===
                    'photo'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-text'}"
                    onclick={() => updateSettings({ visibility: "photo" })}
                    disabled={!currentPhoto.url}
                >
                    Photo
                </button>
                <button
                    class="px-3 py-2 text-sm rounded border-2 transition-colors {currentPhoto.visibility ===
                    'letter'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-text'}"
                    onclick={() => updateSettings({ visibility: "letter" })}
                >
                    Letter
                </button>
                <button
                    class="px-3 py-2 text-sm rounded border-2 transition-colors {currentPhoto.visibility ===
                    'hidden'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-text'}"
                    onclick={() => updateSettings({ visibility: "hidden" })}
                >
                    Hidden
                </button>
            </div>
        </div>

        <!-- Position -->
        <div class="space-y-3">
            <label class="text-sm font-medium text-text">Position</label>
            <div class="grid grid-cols-3 gap-2">
                <button
                    class="px-3 py-2 text-sm rounded border-2 transition-colors {currentPhoto.position ===
                    'left'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-text'}"
                    onclick={() => updateSettings({ position: "left" })}
                >
                    Left Sidebar
                </button>
                <button
                    class="px-3 py-2 text-sm rounded border-2 transition-colors {currentPhoto.position ===
                    'center'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-text'}"
                    onclick={() => updateSettings({ position: "center" })}
                >
                    Center
                </button>
                <button
                    class="px-3 py-2 text-sm rounded border-2 transition-colors {currentPhoto.position ===
                    'right'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-text'}"
                    onclick={() => updateSettings({ position: "right" })}
                >
                    Right Sidebar
                </button>
            </div>
        </div>

        <!-- Header Layout (only for center position) -->
        {#if !isSidebar}
            <div class="space-y-3">
                <label class="text-sm font-medium text-text"
                    >Header Layout</label
                >
                <div class="grid grid-cols-3 gap-2">
                    <button
                        class="px-3 py-2 text-sm rounded border-2 transition-colors {(currentPhoto.layout ||
                            'vertical') === 'vertical'
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border hover:border-text'}"
                        onclick={() => updateSettings({ layout: "vertical" })}
                    >
                        <div class="font-medium">Vertical</div>
                        <div class="text-xs text-muted mt-0.5">
                            Photo on top
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
                        <div class="font-medium">Photo Left</div>
                        <div class="text-xs text-muted mt-0.5">
                            Photo → Text
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
                        <div class="font-medium">Photo Right</div>
                        <div class="text-xs text-muted mt-0.5">
                            Text → Photo
                        </div>
                    </button>
                </div>
            </div>
        {/if}

        {#if currentPhoto.visibility !== "hidden"}
            <!-- Size -->
            <div class="space-y-3">
                <label class="text-sm font-medium text-text">Size</label>
                <div class="grid grid-cols-3 gap-2">
                    {#each [{ id: "small", label: "Small" }, { id: "medium", label: "Medium" }, { id: "large", label: "Large" }] as size}
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
                            {size.label}
                        </button>
                    {/each}
                </div>
            </div>

            <!-- Shape -->
            <div class="space-y-3">
                <label class="text-sm font-medium text-text">Shape</label>
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
                            {shp}
                        </button>
                    {/each}
                </div>
            </div>
        {/if}

        <div class="flex justify-end pt-4 border-t border-border">
            <Button variant="primary" onclick={onClose}>Done</Button>
        </div>
    </div>
</Modal>
