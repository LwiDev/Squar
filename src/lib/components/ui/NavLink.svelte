<script lang="ts">
    import type { ComponentType } from "svelte";

    interface Props {
        label: string;
        onclick?: () => void;
        href?: string;
        icon?: ComponentType;
        external?: boolean;
    }

    let {
        label,
        onclick,
        href,
        icon: Icon,
        external = false,
    }: Props = $props();
</script>

{#if href && external}
    <a
        {href}
        target="_blank"
        rel="noopener noreferrer"
        class="px-3 py-1.5 text-sm text-muted hover:text-text transition-colors rounded-md hover:bg-accent/5 flex items-center gap-1.5"
    >
        {#if Icon}
            <Icon size={14} />
        {/if}
        {label}
    </a>
{:else if onclick}
    <button
        {onclick}
        class="px-3 py-1.5 text-sm text-muted hover:text-text transition-colors rounded-md hover:bg-accent/5"
    >
        {label}
    </button>
{/if}
