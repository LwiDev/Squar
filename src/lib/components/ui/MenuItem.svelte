<script lang="ts">
    import type { ComponentType } from "svelte";

    interface Props {
        icon: ComponentType;
        label: string;
        onclick: () => void;
        variant?: "default" | "destructive";
    }

    let { icon: Icon, label, onclick, variant = "default" }: Props = $props();
</script>

<button
    {onclick}
    class="w-full px-4 py-2.5 text-left text-muted transition-colors flex items-center gap-3 cursor-pointer {variant ===
    'destructive'
        ? 'hover:text-destructive hover:bg-border/50'
        : 'hover:text-accent hover:bg-border/50'}"
>
    <Icon size={16} />
    <span class="text-sm">{label}</span>
</button>
