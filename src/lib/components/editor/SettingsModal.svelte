<script lang="ts">
    import { untrack } from "svelte";
    import { Modal, Button } from "$lib/components/ui";
    import type { PageSettings } from "$lib/types/models";
    import { t } from "svelte-i18n";

    interface Props {
        open: boolean;
        onClose: () => void;
        settings: PageSettings;
        onUpdate: (newSettings: PageSettings) => void;
    }

    let { open = $bindable(), onClose, settings, onUpdate }: Props = $props();

    let localSettings = $state(untrack(() => ({ ...settings })));

    // Reset local state when modal opens
    $effect(() => {
        if (open) {
            untrack(() => {
                localSettings = { ...settings };

                // Ensure profilePhoto object exists
                if (!localSettings.profilePhoto) {
                    localSettings.profilePhoto = {
                        position: "left",
                        size: "medium",
                        shape: "circle",
                        visibility: "letter",
                        layout: "vertical",
                    };
                }
            });
        }
    });

    function handleSave() {
        onUpdate(localSettings);
        onClose();
    }

    const themes = [
        {
            id: "light",
            key: "editor.settings_modal.themes.light",
            color: "#ffffff",
            border: "#e5e5e5",
        },
        {
            id: "cream",
            key: "editor.settings_modal.themes.cream",
            color: "#faf8f5",
            border: "#d4c5b9",
        },
        {
            id: "dark",
            key: "editor.settings_modal.themes.dark",
            color: "#0f0f0f",
            border: "#2a2a2a",
        },
        {
            id: "slate",
            key: "editor.settings_modal.themes.slate",
            color: "#f8fafc",
            border: "#cbd5e1",
        },
        {
            id: "midnight",
            key: "editor.settings_modal.themes.midnight",
            color: "#0f172a",
            border: "#1e3a5f",
        },
    ] as const;

    const currentPosition = $derived(localSettings.profilePhoto?.position || "left");
    const currentLayout = $derived(
        localSettings.profilePhoto?.layout || "vertical",
    );
    const isSidebar = $derived(
        currentPosition === "left" || currentPosition === "right",
    );

    function updatePhotoSettings(
        updates: Partial<NonNullable<PageSettings["profilePhoto"]>>,
    ) {
        if (localSettings.profilePhoto) {
            localSettings.profilePhoto = {
                ...localSettings.profilePhoto,
                ...updates,
            } as NonNullable<PageSettings["profilePhoto"]>;
        }
    }
</script>

<Modal bind:open {onClose} title={$t("editor.settings_modal.title")}>
    <div class="space-y-6">
        <!-- Theme Selection -->
        <div class="space-y-4">
            <span class="block text-sm font-medium text-text">
                {$t("editor.settings_modal.theme")}
            </span>
            <div class="grid grid-cols-5 gap-2">
                {#each themes as theme}
                    <button
                        class="group relative aspect-square rounded-lg border-2 transition-all overflow-hidden"
                        class:border-accent={localSettings.theme === theme.id}
                        class:border-border={localSettings.theme !== theme.id}
                        onclick={() => (localSettings.theme = theme.id)}
                        title={$t(theme.key)}
                    >
                        <div
                            class="absolute inset-0"
                            style="background-color: {theme.color};"
                        ></div>
                        <!-- Preview lines to simulate content -->
                        <div
                            class="absolute inset-2 flex flex-col gap-1.5 opacity-50"
                        >
                            <div
                                class="h-1.5 w-2/3 rounded-full bg-current opacity-20"
                                style="color: {theme.border}"
                            ></div>
                            <div
                                class="h-1.5 w-full rounded-full bg-current opacity-10"
                                style="color: {theme.border}"
                            ></div>
                        </div>
                    </button>
                {/each}
            </div>
            <p class="text-xs text-muted">
                {$t("editor.settings_modal.selected")}: {$t(
                    themes.find((t) => t.id === localSettings.theme)?.key ||
                        "editor.settings_modal.themes.light",
                )}
            </p>
        </div>

        <div class="h-px bg-border"></div>

        <!-- Position -->
        <div class="space-y-3">
            <span class="block text-sm font-medium text-text"
                >{$t("editor.profile_modal.position_label")}</span
            >
            <div class="grid grid-cols-3 gap-2">
                <button
                    class="px-3 py-2 text-sm rounded border-2 transition-colors whitespace-nowrap {currentPosition ===
                    'left'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-text'}"
                    onclick={() => updatePhotoSettings({ position: "left" })}
                >
                    {$t("editor.profile_modal.position_left")}
                </button>
                <button
                    class="px-3 py-2 text-sm rounded border-2 transition-colors whitespace-nowrap {currentPosition ===
                    'center'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-text'}"
                    onclick={() => updatePhotoSettings({ position: "center" })}
                >
                    {$t("editor.profile_modal.position_center")}
                </button>
                <button
                    class="px-3 py-2 text-sm rounded border-2 transition-colors whitespace-nowrap {currentPosition ===
                    'right'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-text'}"
                    onclick={() => updatePhotoSettings({ position: "right" })}
                >
                    {$t("editor.profile_modal.position_right")}
                </button>
            </div>
        </div>

        <!-- Header Layout -->
        <div class="space-y-3">
            <span class="block text-sm font-medium text-text"
                >{$t('editor.profile_modal.layout_label')}</span
            >
            <div class="grid grid-cols-3 gap-2">
                <button
                    class="px-3 py-2 text-sm rounded border-2 transition-colors {currentLayout === 'vertical'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-text'}"
                    onclick={() => updatePhotoSettings({ layout: "vertical" })}
                >
                    <div class="font-medium">{$t('editor.profile_modal.layout_vertical')}</div>
                    <div class="text-xs text-muted mt-0.5">
                        {$t('editor.profile_modal.layout_vertical_desc')}
                    </div>
                </button>
                <button
                    class="px-3 py-2 text-sm rounded border-2 transition-colors {currentLayout === 'horizontal-left'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-text'}"
                    onclick={() =>
                        updatePhotoSettings({ layout: "horizontal-left" })}
                >
                    <div class="font-medium">{$t('editor.profile_modal.layout_photo_left')}</div>
                    <div class="text-xs text-muted mt-0.5">
                        {$t('editor.profile_modal.layout_photo_left_desc')}
                    </div>
                </button>
                <button
                    class="px-3 py-2 text-sm rounded border-2 transition-colors {currentLayout === 'horizontal-right'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-text'}"
                    onclick={() =>
                        updatePhotoSettings({ layout: "horizontal-right" })}
                >
                    <div class="font-medium">{$t('editor.profile_modal.layout_photo_right')}</div>
                    <div class="text-xs text-muted mt-0.5">
                        {$t('editor.profile_modal.layout_photo_right_desc')}
                    </div>
                </button>
            </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onclick={onClose}
                >{$t("common.cancel")}</Button
            >
            <Button variant="primary" onclick={handleSave}
                >{$t("editor.settings_modal.save")}</Button
            >
        </div>
    </div>
</Modal>
