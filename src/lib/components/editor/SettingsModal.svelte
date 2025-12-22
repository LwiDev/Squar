<script lang="ts">
    import { untrack } from 'svelte';
    import { Modal, Input, Button } from "$lib/components/ui";
    import type { PageSettings } from "$lib/types/models";

    interface Props {
        open: boolean;
        onClose: () => void;
        settings: PageSettings;
        onUpdate: (newSettings: PageSettings) => void;
    }

    let { open, onClose, settings, onUpdate }: Props = $props();

    let localSettings = $state(untrack(() => ({ ...settings })));
    
    // Reset local state when modal opens
    $effect(() => {
        if (open) {
            localSettings = { ...settings };
        }
    });

    function handleSave() {
        onUpdate(localSettings);
        onClose();
    }

    const themes = [
        { id: 'light', name: 'Light', color: '#ffffff', border: '#e5e5e5' },
        { id: 'cream', name: 'Cream', color: '#faf8f5', border: '#d4c5b9' },
        { id: 'dark', name: 'Dark', color: '#0f0f0f', border: '#2a2a2a' },
        { id: 'slate', name: 'Slate', color: '#f8fafc', border: '#cbd5e1' },
        { id: 'midnight', name: 'Midnight', color: '#0f172a', border: '#1e3a5f' },
    ] as const;
</script>

<Modal
    bind:open
    {onClose}
    title="Page Settings"
>
    <div class="space-y-6">
        <!-- Theme Selection -->
        <div class="space-y-4">
            <span class="block text-sm font-medium text-text">
                Theme
            </span>
            <div class="grid grid-cols-5 gap-2">
                {#each themes as theme}
                    <button
                        class="group relative aspect-square rounded-lg border-2 transition-all overflow-hidden"
                        class:border-accent={localSettings.theme === theme.id}
                        class:border-border={localSettings.theme !== theme.id}
                        onclick={() => localSettings.theme = theme.id}
                        title={theme.name}
                    >
                        <div 
                            class="absolute inset-0"
                            style="background-color: {theme.color};"
                        ></div>
                        <!-- Preview lines to simulate content -->
                        <div class="absolute inset-2 flex flex-col gap-1.5 opacity-50">
                            <div class="h-1.5 w-2/3 rounded-full bg-current opacity-20" style="color: {theme.border}"></div>
                            <div class="h-1.5 w-full rounded-full bg-current opacity-10" style="color: {theme.border}"></div>
                        </div>
                    </button>
                {/each}
            </div>
            <p class="text-xs text-muted">
                Selected: {themes.find(t => t.id === localSettings.theme)?.name || 'Light'}
            </p>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onclick={onClose}>Cancel</Button>
            <Button variant="primary" onclick={handleSave}>Save Changes</Button>
        </div>
    </div>
</Modal>
