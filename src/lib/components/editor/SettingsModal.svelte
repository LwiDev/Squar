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

    let localTheme = $state(untrack(() => settings.theme || "light"));

    // Reset local state when modal opens
    $effect(() => {
        if (open) {
            untrack(() => {
                localTheme = settings.theme || "light";
            });
        }
    });

    function handleSave() {
        onUpdate({ ...settings, theme: localTheme });
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
                        class:border-accent={localTheme === theme.id}
                        class:border-border={localTheme !== theme.id}
                        onclick={() => (localTheme = theme.id)}
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
                    themes.find((t) => t.id === localTheme)?.key ||
                        "editor.settings_modal.themes.light",
                )}
            </p>
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
