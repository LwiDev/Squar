<script lang="ts">
    import { locale, t } from "svelte-i18n";
    import {
        Languages,
        Check,
        ChevronDown,
        ChevronUp,
        ChevronRight,
    } from "lucide-svelte";
    import { clickOutside } from "$lib/actions/clickOutside";

    interface Props {
        direction?: "up" | "down" | "right";
        variant?: "default" | "menu";
    }

    let { direction = "up", variant = "default" }: Props = $props();

    const locales = [
        { code: "en", label: "English" },
        { code: "fr", label: "Français" },
        { code: "es", label: "Español" },
    ];

    let isOpen = $state(false);

    function selectLocale(code: string) {
        locale.set(code);
        if (typeof window !== "undefined") {
            window.localStorage.setItem("svelte-i18n-locale", code);
        }
        isOpen = false;
    }

    function handleMouseEnter() {
        if (variant === "menu") isOpen = true;
    }

    function handleMouseLeave() {
        if (variant === "menu") isOpen = false;
    }
</script>

<div
    class="relative {variant === 'menu' ? 'w-full' : ''}"
    use:clickOutside={() => (isOpen = false)}
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
    role="none"
>
    {#if variant === "menu"}
        <button
            onclick={() => (isOpen = !isOpen)}
            class="w-full px-4 py-2.5 text-left text-muted transition-colors flex items-center justify-between hover:text-accent hover:bg-border/50 {isOpen
                ? 'text-accent bg-border/30'
                : ''}"
        >
            <div class="flex items-center gap-3">
                <Languages size={16} />
                <span class="text-sm">{$t("editor.menu.language")}</span>
            </div>
            <ChevronRight size={14} class="opacity-50" />
        </button>
    {:else}
        <button
            onclick={() => (isOpen = !isOpen)}
            class="flex items-center gap-2 hover:bg-secondary/50 text-xs font-semibold text-muted hover:text-text uppercase tracking-wider rounded transition-colors"
            aria-label="Change language"
        >
            <span
                >{locales.find((l) => $locale?.startsWith(l.code))?.label ||
                    "English"}</span
            >
            {#if direction === "up"}
                <ChevronUp size={12} class="opacity-50" />
            {:else}
                <ChevronDown size={12} class="opacity-50" />
            {/if}
        </button>
    {/if}

    {#if isOpen}
        <div
            class="absolute z-50 w-40 bg-background border border-border rounded-lg shadow-lg overflow-hidden"
            class:bottom-full={direction === "up"}
            class:mb-2={direction === "up"}
            class:left-0={direction !== "right"}
            class:top-full={direction === "down"}
            class:mt-2={direction === "down"}
            class:left-full={direction === "right"}
            class:bottom-0={direction === "right"}
            class:ml-1={direction === "right"}
        >
            {#each locales as l}
                <button
                    onclick={() => selectLocale(l.code)}
                    class="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary/50 transition-colors flex items-center justify-between {$locale?.startsWith(
                        l.code,
                    )
                        ? 'text-accent font-medium'
                        : 'text-muted hover:text-text'}"
                >
                    <span>{l.label}</span>
                    {#if $locale?.startsWith(l.code)}
                        <Check size={14} />
                    {/if}
                </button>
            {/each}
        </div>
    {/if}
</div>
