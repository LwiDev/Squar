<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { tweened } from "svelte/motion";
    import { cubicInOut } from "svelte/easing";

    interface Props extends HTMLAttributes<HTMLElement> {
        children: Snippet;
        position?: "top" | "bottom";
        minWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
        adaptive?: boolean;
        saving?: boolean;
    }

    let {
        children,
        position = "top",
        minWidth = "xl",
        adaptive = false,
        saving = false,
        class: className,
        ...rest
    }: Props = $props();

    let showSavingBar = $state(false);
    let isLooping = $state(false);

    const progress = tweened(0, {
        duration: 900,
        easing: cubicInOut,
    });

    $effect(() => {
        if (saving && !isLooping) {
            isLooping = true;
            showSavingBar = true;

            const loop = () => {
                if (!isLooping) {
                    // This check is crucial. If 'saving' became false while the tween was running,
                    // isLooping is now false, and we should not start a new loop.
                    // The 'else' block handles the final hiding of the bar.
                    return;
                }

                progress.set(1).then(() => {
                    // This promise resolves when the animation to 1 is complete.
                    if (isLooping) {
                        progress.set(0, { duration: 0 }); // Reset for the next loop
                        loop(); // Go again
                    }
                });
            };

            progress.set(0, { duration: 0 });
            loop();
        } else if (!saving && isLooping) {
            isLooping = false;
            // 'isLooping' is now false. The current loop will finish its `progress.set(1)`
            // but it will not restart because the check `if (isLooping)` inside the .then()
            // will fail. We just need to hide the bar once that final animation is truly over.

            const unsubscribe = progress.subscribe((p) => {
                // When the progress tween completes its final run (reaches 1)
                if (p === 1) {
                    showSavingBar = false;
                    unsubscribe();
                }
            });
        }
    });

    const barStyle = $derived.by(() => {
        const p = $progress;
        const maxWidth = 60; // The peak width of the bar (as a percentage of the container)

        // Parabolic curve for width: w = 4 * W_max * (p - p^2)
        // This makes it grow smoothly to a peak at p=0.5, then shrink smoothly.
        const width = 4 * maxWidth * (p - p * p);

        // Make the center of the bar move linearly across the container
        const center = 100 * p;
        const left = center - width / 2;

        return `left: ${left}%; width: ${width}%;`;
    });

    const minWidthClasses = {
        sm: "sm:min-w-sm",
        md: "sm:min-w-md",
        lg: "sm:min-w-lg",
        xl: "sm:min-w-xl",
        "2xl": "sm:min-w-2xl",
    };

    const positionClasses = $derived(
        position === "top" ? "sticky top-4 mb-4 mt-4" : "fixed bottom-4",
    );

    const classes = $derived(
        `${positionClasses} z-40 w-full px-4 pointer-events-none flex justify-center ${className || ""}`,
    );
</script>

<div class={classes} {...rest}>
    <div
        class="relative bg-background/70 backdrop-blur-xl border border-border rounded-sm px-4 py-2 shadow-sm pointer-events-auto transition-all duration-200 ease-in-out {adaptive
            ? 'w-fit'
            : 'w-full max-w-2xl'}"
    >
        {#if showSavingBar}
            <div
                class="absolute -top-[1px] inset-x-0 h-[2px] overflow-hidden rounded-t-sm pointer-events-none"
            >
                <div
                    class="absolute top-0 h-full bg-text"
                    style={barStyle}
                ></div>
            </div>
        {/if}
        {@render children()}
    </div>
</div>
