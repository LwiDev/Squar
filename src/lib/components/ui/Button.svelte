<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLButtonAttributes } from "svelte/elements";

    interface Props extends HTMLButtonAttributes {
        variant?: "primary" | "secondary" | "ghost";
        size?: "sm" | "md" | "lg";
        children: Snippet;
    }

    let {
        variant = "primary",
        size = "md",
        children,
        class: className,
        ...rest
    }: Props = $props();

    const baseClasses =
        "inline-flex items-center justify-center cursor-pointer font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-sm";

    const variantClasses = {
        primary: "bg-accent text-white hover:bg-accent/80 active:bg-accent",
        secondary:
            "bg-background text-text border border-border hover:border-text",
        ghost: "bg-transparent text-text hover:bg-border",
    };

    const sizeClasses = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-2.5 text-base",
    };

    const classes = $derived(
        `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className || ""}`,
    );
</script>

<button class={classes} {...rest}>
    {@render children()}
</button>
