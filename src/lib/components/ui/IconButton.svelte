<script lang="ts">
    import type { ComponentType } from "svelte";

    interface Props {
        icon: ComponentType;
        onclick?: () => void | undefined;
        disabled?: boolean;
        size?: number;
        class?: string;
    }

    let {
        icon: Icon,
        onclick,
        disabled = false,
        size = 18,
        class: className,
    }: Props = $props();
</script>

<button
    {onclick}
    {disabled}
    class="{className} p-1.5 hover:bg-border/50 rounded-md text-muted hover:text-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
>
    <Icon {size} />
</button>
