<script lang="ts">
    import { untrack } from "svelte";
    import { Modal, Button } from "$lib/components/ui";
    import type { PageSettings } from "$lib/types/models";
    import { t } from "svelte-i18n";

    interface Props {
        open: boolean;
        onClose: () => void;
        profilePhoto: PageSettings["profilePhoto"];
        titleSize: PageSettings["titleSize"];
        onUpdate: (updates: {
            profilePhoto?: PageSettings["profilePhoto"];
            titleSize?: PageSettings["titleSize"];
        }) => void;
        onPhotoUpload?: (file: File) => void;
        onPhotoRemove?: () => void;
        uploading?: boolean;
    }

    let {
        open = $bindable(),
        onClose,
        profilePhoto,
        titleSize,
        onUpdate,
        onPhotoUpload,
        onPhotoRemove,
        uploading = false,
    }: Props = $props();

    let fileInput: HTMLInputElement;

    // Local state
    let localProfilePhoto = $state(
        untrack(() => ({
            position: "center" as const,
            size: "medium" as const,
            shape: "circle" as const,
            visibility: "letter" as const,
            layout: "vertical" as const,
            ...profilePhoto,
        })),
    );
    let localTitleSize = $state(untrack(() => titleSize || "medium"));

    // Reset local state when modal opens
    $effect(() => {
        if (open) {
            untrack(() => {
                localProfilePhoto = {
                    position: "center" as const,
                    size: "medium" as const,
                    shape: "circle" as const,
                    visibility: "letter" as const,
                    layout: "vertical" as const,
                    ...profilePhoto,
                };
                localTitleSize = titleSize || "medium";
            });
        }
    });

    function handleFileSelect(e: Event) {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file && onPhotoUpload) {
            onPhotoUpload(file);
            target.value = "";
        }
    }

    function updateProfilePhoto(
        updates: Partial<NonNullable<PageSettings["profilePhoto"]>>,
    ) {
        localProfilePhoto = { ...localProfilePhoto, ...updates };
    }

    function handleSave() {
        onUpdate({
            profilePhoto: localProfilePhoto,
            titleSize: localTitleSize,
        });
        onClose();
    }
</script>

<input
    type="file"
    accept="image/*"
    bind:this={fileInput}
    onchange={handleFileSelect}
    class="hidden"
/>

<Modal bind:open {onClose} title="Paramètres du profil" maxWidth="max-w-2xl">
    <div class="space-y-6 max-h-[70vh] overflow-y-auto px-1">
        <!-- PHOTO DE PROFIL -->
        <div class="space-y-4">
            <h3 class="text-base font-semibold text-text">Photo de profil</h3>

            <!-- Upload/Remove -->
            <div class="flex gap-2">
                <Button
                    variant="secondary"
                    size="sm"
                    onclick={() => fileInput?.click()}
                    disabled={uploading}
                    class="flex-1"
                >
                    {uploading
                        ? $t("editor.profile_modal.uploading")
                        : localProfilePhoto.url
                          ? $t("editor.profile_modal.change_photo")
                          : $t("editor.profile_modal.upload_photo")}
                </Button>
                {#if localProfilePhoto.url}
                    <Button
                        variant="ghost"
                        size="sm"
                        onclick={onPhotoRemove}
                        disabled={uploading}
                    >
                        {$t("common.remove")}
                    </Button>
                {/if}
            </div>

            <!-- Display, Size, Shape - En ligne -->
            <div class="grid grid-cols-3 gap-3">
                <!-- Display -->
                <div class="space-y-2">
                    <label class="text-xs font-medium text-muted"
                        >{$t("editor.profile_modal.display_label")}</label
                    >
                    <div class="flex flex-col gap-1">
                        <button
                            class="px-2 py-1.5 text-xs rounded border transition-colors {localProfilePhoto.visibility ===
                            'photo'
                                ? 'border-accent bg-accent/10 text-accent'
                                : 'border-border hover:border-text'}"
                            onclick={() =>
                                updateProfilePhoto({ visibility: "photo" })}
                            disabled={!localProfilePhoto.url}
                        >
                            Photo
                        </button>
                        <button
                            class="px-2 py-1.5 text-xs rounded border transition-colors {localProfilePhoto.visibility ===
                            'letter'
                                ? 'border-accent bg-accent/10 text-accent'
                                : 'border-border hover:border-text'}"
                            onclick={() =>
                                updateProfilePhoto({ visibility: "letter" })}
                        >
                            Lettre
                        </button>
                        <button
                            class="px-2 py-1.5 text-xs rounded border transition-colors {localProfilePhoto.visibility ===
                            'hidden'
                                ? 'border-accent bg-accent/10 text-accent'
                                : 'border-border hover:border-text'}"
                            onclick={() =>
                                updateProfilePhoto({ visibility: "hidden" })}
                        >
                            Caché
                        </button>
                    </div>
                </div>

                {#if localProfilePhoto.visibility !== "hidden"}
                    <!-- Size -->
                    <div class="space-y-2">
                        <label class="text-xs font-medium text-muted"
                            >Taille</label
                        >
                        <div class="flex flex-col gap-1">
                            {#each [{ id: "small", label: "S" }, { id: "medium", label: "M" }, { id: "large", label: "L" }] as size}
                                <button
                                    class="px-2 py-1.5 text-xs rounded border transition-colors {localProfilePhoto.size ===
                                    size.id
                                        ? 'border-accent bg-accent/10 text-accent'
                                        : 'border-border hover:border-text'}"
                                    onclick={() =>
                                        updateProfilePhoto({
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
                    <div class="space-y-2">
                        <label class="text-xs font-medium text-muted"
                            >Forme</label
                        >
                        <div class="flex flex-col gap-1">
                            {#each [{ id: "circle", label: "Cercle" }, { id: "square", label: "Carré" }, { id: "rounded", label: "Arrondi" }] as shp}
                                <button
                                    class="px-2 py-1.5 text-xs rounded border transition-colors {localProfilePhoto.shape ===
                                    shp.id
                                        ? 'border-accent bg-accent/10 text-accent'
                                        : 'border-border hover:border-text'}"
                                    onclick={() =>
                                        updateProfilePhoto({
                                            shape: shp.id as
                                                | "circle"
                                                | "square"
                                                | "rounded",
                                        })}
                                >
                                    {shp.label}
                                </button>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>
        </div>

        <div class="h-px bg-border"></div>

        <!-- DISPOSITION -->
        <div class="space-y-4">
            <h3 class="text-base font-semibold text-text">Disposition</h3>

            <div class="grid grid-rows-2 gap-1">
                <!-- Position -->
                <div class="space-x-2">
                    <label class="text-xs font-medium text-muted"
                        >Position</label
                    >
                    <div class="grid grid-cols-3 gap-1">
                        <button
                            class="px-3 py-2 text-xs rounded border transition-colors text-left {localProfilePhoto.position ===
                            'left'
                                ? 'border-accent bg-accent/10 text-accent'
                                : 'border-border hover:border-text'}"
                            onclick={() =>
                                updateProfilePhoto({ position: "left" })}
                        >
                            Sidebar gauche
                        </button>
                        <button
                            class="px-3 py-2 text-xs rounded border transition-colors text-left {localProfilePhoto.position ===
                            'center'
                                ? 'border-accent bg-accent/10 text-accent'
                                : 'border-border hover:border-text'}"
                            onclick={() =>
                                updateProfilePhoto({ position: "center" })}
                        >
                            Centre
                        </button>
                        <button
                            class="px-3 py-2 text-xs rounded border transition-colors text-left {localProfilePhoto.position ===
                            'right'
                                ? 'border-accent bg-accent/10 text-accent'
                                : 'border-border hover:border-text'}"
                            onclick={() =>
                                updateProfilePhoto({ position: "right" })}
                        >
                            Sidebar droite
                        </button>
                    </div>
                </div>

                <!-- Layout -->
                <div class="space-x-2">
                    <label class="text-xs font-medium text-muted"
                        >Mise en page</label
                    >
                    <div class="grid grid-cols-3 gap-1">
                        <button
                            class="px-3 py-2 text-xs rounded border transition-colors text-left {localProfilePhoto.layout ===
                            'vertical'
                                ? 'border-accent bg-accent/10 text-accent'
                                : 'border-border hover:border-text'}"
                            onclick={() =>
                                updateProfilePhoto({ layout: "vertical" })}
                        >
                            <div class="font-medium">Vertical</div>
                            <div class="text-xs text-muted">Photo en haut</div>
                        </button>
                        <button
                            class="px-3 py-2 text-xs rounded border transition-colors text-left {localProfilePhoto.layout ===
                            'horizontal-left'
                                ? 'border-accent bg-accent/10 text-accent'
                                : 'border-border hover:border-text'}"
                            onclick={() =>
                                updateProfilePhoto({
                                    layout: "horizontal-left",
                                })}
                        >
                            <div class="font-medium">Photo à gauche</div>
                            <div class="text-xs text-muted">Photo → Texte</div>
                        </button>
                        <button
                            class="px-3 py-2 text-xs rounded border transition-colors text-left {localProfilePhoto.layout ===
                            'horizontal-right'
                                ? 'border-accent bg-accent/10 text-accent'
                                : 'border-border hover:border-text'}"
                            onclick={() =>
                                updateProfilePhoto({
                                    layout: "horizontal-right",
                                })}
                        >
                            <div class="font-medium">Photo à droite</div>
                            <div class="text-xs text-muted">Texte → Photo</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="h-px bg-border"></div>

        <!-- TITRE -->
        <div class="space-y-3">
            <h3 class="text-base font-semibold text-text">Titre</h3>

            <div class="flex gap-2">
                {#each [{ id: "small", label: "Petit" }, { id: "medium", label: "Moyen" }, { id: "large", label: "Grand" }] as size}
                    <button
                        class="flex-1 px-3 py-2 text-sm rounded border transition-colors {localTitleSize ===
                        size.id
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border hover:border-text'}"
                        onclick={() => (localTitleSize = size.id)}
                    >
                        {size.label}
                    </button>
                {/each}
            </div>
        </div>
    </div>

    <!-- Actions fixées en bas -->
    <div class="flex justify-end gap-2 pt-4 border-t border-border mt-4">
        <Button variant="secondary" onclick={onClose}>Annuler</Button>
        <Button variant="primary" onclick={handleSave}>Enregistrer</Button>
    </div>
</Modal>
