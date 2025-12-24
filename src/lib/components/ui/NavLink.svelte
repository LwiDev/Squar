<script lang="ts">
    import type { ComponentType } from "svelte";

    interface Props {
        label: string;
        onclick?: () => void;
        href?: string;
        icon?: ComponentType;
        external?: boolean;
        active?: boolean;
    }

    let {
        label,
        onclick,
        href,
        icon: Icon,
        external = false,
        active = false,
    }: Props = $props();
</script>

{#if href && external}
    <a
        {href}
        target="_blank"
        rel="noopener noreferrer"
        class="px-3 py-1.5 text-sm transition-colors rounded-md flex items-center gap-1.5 {active
            ? 'bg-accent/10 text-text'
            : 'text-muted hover:text-text hover:bg-accent/5'}"
    >
        {#if Icon}
            <Icon size={14} />
        {/if}
        {label}
    </a>
{:else if onclick}
    <button
        {onclick}
        class="px-3 py-1.5 text-sm transition-colors rounded-md {active
            ? 'bg-accent/10 text-text font-bold'
            : 'text-muted hover:text-text hover:bg-accent/5'}"
    >
        {label}
    </button>
{/if}
