<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";

    interface Props extends HTMLAttributes<HTMLDivElement> {
        children: Snippet;
        variant?: "default" | "hover" | "glass";
    }

    let {
        children,
        class: className,
        variant = "default",
        ...rest
    }: Props = $props();

    const variantClasses = {
        default: "bg-background border border-border rounded-md",
        hover: "bg-background border border-border rounded-md hover:bg-accent/5 hover:border-accent/20 transition-all duration-300",
        glass: "bg-background border-0 rounded-md shadow-sm",
    };

    const classes = $derived(`${variantClasses[variant]} ${className || ""}`);
</script>

<div class={classes} {...rest}>
    {@render children()}
</div>
