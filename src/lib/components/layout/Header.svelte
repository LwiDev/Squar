<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import logo from "$lib/assets/images/logos/logo.png";
    import { Button, NavLink } from "$lib/components/ui";
    import FloatingBar from "./FloatingBar.svelte";
    import { t } from "svelte-i18n";

    function scrollToSection(sectionId: string) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    function handleLogoClick() {
        if ($page.url.pathname === "/") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            goto("/");
        }
    }
</script>

<FloatingBar position="top" adaptive>
    <div class="flex items-center justify-between h-12">
        <div class="flex items-center gap-6">
            <div
                class="flex items-center gap-2 hover:opacity-70 transition-opacity cursor-pointer"
                onclick={handleLogoClick}
                role="button"
                tabindex="0"
                onkeydown={(e) => e.key === "Enter" && goto("/")}
            >
                <img
                    src={logo}
                    loading="lazy"
                    alt="Squar Logo"
                    class="w-5 h-auto"
                />
                <h1 class="text-sm font-bold tracking-tight">{$t('common.squar')}</h1>
            </div>

            <nav class="hidden md:flex items-center gap-1">
                <NavLink
                    label={$t('landing.nav.how_it_works')}
                    onclick={() => scrollToSection("how-it-works")}
                />
                <NavLink
                    label={$t('landing.nav.pricing')}
                    onclick={() => scrollToSection("actually-free")}
                />
                <NavLink
                    label={$t('landing.nav.features')}
                    onclick={() => scrollToSection("features")}
                />
            </nav>

            <div class="flex items-center">
                {#if $page.data.user}
                    <a href="/editor">
                        <Button variant="primary" size="sm" class="h-8 text-xs"
                            >{$t('landing.nav.my_squar')}</Button
                        >
                    </a>
                {:else}
                    <Button
                        size="sm"
                        onclick={() => goto("/signup")}
                        class="h-8 text-xs px-6 font-bold tracking-wide"
                    >
                        {$t('common.join_squar')}
                    </Button>
                {/if}
            </div>
        </div>
    </div>
</FloatingBar>
