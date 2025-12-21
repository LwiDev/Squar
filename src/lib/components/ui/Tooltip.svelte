<script lang="ts">
    import type { Snippet } from "svelte";
    import { scale } from "svelte/transition";
    import { cubicOut } from "svelte/easing";

    interface Props {
        text: string;
        position?: "top" | "bottom" | "left" | "right";
        class?: string;
        children: Snippet;
    }

    let {
        text,
        position = "top",
        children,
        class: className,
    }: Props = $props();

    let showTooltip = $state(false);

    const positionClasses = $derived(() => {
        const classes = [
            "absolute",
            "z-50",
            "px-2",
            "py-1",
            "text-xs",
            "font-medium",
            "text-white",
            "bg-muted",
            "rounded",
            "whitespace-nowrap",
            "pointer-events-none",
        ];

        switch (position) {
            case "top":
                classes.push(
                    "bottom-full",
                    "left-1/2",
                    "-translate-x-1/2",
                    "mb-2",
                );
                break;
            case "bottom":
                classes.push(
                    "top-full",
                    "left-1/2",
                    "-translate-x-1/2",
                    "mt-2",
                );
                break;
            case "left":
                classes.push(
                    "right-full",
                    "top-1/2",
                    "-translate-y-1/2",
                    "mr-2",
                );
                break;
            case "right":
                classes.push(
                    "left-full",
                    "top-1/2",
                    "-translate-y-1/2",
                    "ml-2",
                );
                break;
        }

        return classes.join(" ");
    });
</script>

<div
    class="relative inline-flex {className}"
    role="group"
    onmouseenter={() => (showTooltip = true)}
    onmouseleave={() => (showTooltip = false)}
>
    {@render children()}

    {#if showTooltip}
        <div
            class={positionClasses()}
            role="tooltip"
            transition:scale={{
                duration: 200,
                start: 0.9,
                opacity: 0,
                easing: cubicOut,
            }}
        >
            {text}
        </div>
    {/if}
</div>
