<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import logo from "$lib/assets/images/logos/logo.png";
    import { Button, NavLink, IconButton } from "$lib/components/ui";
    import FloatingBar from "./FloatingBar.svelte";
    import { t } from "svelte-i18n";
    import { Menu, X } from "lucide-svelte";

    let isMenuOpen = $state(false);
    let activeSection = $state("");

    $effect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    });

    $effect(() => {
        const sections = ["hero", "how-it-works", "actually-free", "features"];
        const observers = sections.map((id) => {
            const el = document.getElementById(id);
            if (!el) return null;

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            if (id === "hero") {
                                activeSection = "";
                            } else {
                                activeSection = id;
                            }
                        }
                    });
                },
                { threshold: 0.5 },
            );
            observer.observe(el);
            return observer;
        });

        return () => {
            observers.forEach((o) => o?.disconnect());
        };
    });

    function scrollToSection(sectionId: string) {
        isMenuOpen = false;
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    function handleLogoClick() {
        isMenuOpen = false;
        if ($page.url.pathname === "/") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            goto("/");
        }
    }
</script>

<FloatingBar position="top" adaptive>
    <div class="flex items-center justify-between h-12 w-full">
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
                <h1 class="text-sm font-bold tracking-tight uppercase">
                    {$t("common.squar")}
                </h1>
            </div>

            <nav class="hidden md:flex items-center gap-1">
                <NavLink
                    label={$t("landing.nav.how_it_works")}
                    onclick={() => scrollToSection("how-it-works")}
                    active={activeSection === "how-it-works"}
                />
                <NavLink
                    label={$t("landing.nav.pricing")}
                    onclick={() => scrollToSection("actually-free")}
                    active={activeSection === "actually-free"}
                />
                <NavLink
                    label={$t("landing.nav.features")}
                    onclick={() => scrollToSection("features")}
                    active={activeSection === "features"}
                />
            </nav>
            <div class="hidden md:flex items-center">
                {#if $page.data.user && $page.data.page?.slug}
                    <a href="/{$page.data.page.slug}">
                        <Button variant="primary" size="sm" class="h-8 text-xs"
                            >{$t("landing.nav.my_squar")}</Button
                        >
                    </a>
                {:else if $page.data.user}
                    <Button
                        variant="primary"
                        size="sm"
                        class="h-8 text-xs"
                        disabled>{$t("landing.nav.my_squar")}</Button
                    >
                {:else}
                    <Button
                        size="sm"
                        onclick={() => goto("/signup")}
                        class="h-8 text-xs px-6 font-bold tracking-wide"
                    >
                        {$t("common.join_squar")}
                    </Button>
                {/if}
            </div>
        </div>
        <div class="md:hidden">
            <IconButton icon={Menu} onclick={() => (isMenuOpen = true)} />
        </div>
    </div>
</FloatingBar>

<div
    class="fixed inset-0 bg-white/80 backdrop-blur-xl z-100 flex flex-col items-center justify-center transition-all ease-[cubic-bezier(0.25,1,0.5,1)] {isMenuOpen
        ? 'duration-700'
        : 'duration-300'}"
    style="clip-path: {isMenuOpen
        ? 'circle(150% at calc(100% - 2rem) 2rem)'
        : 'circle(0% at calc(100% - 2rem) 2rem)'}; pointer-events: {isMenuOpen
        ? 'auto'
        : 'none'};"
    role="dialog"
    aria-modal="true"
    aria-hidden={!isMenuOpen}
>
    <button
        class="absolute top-6 right-6 text-muted hover:text-black transition-colors p-2 cursor-pointer"
        onclick={() => (isMenuOpen = false)}
        aria-label="Close menu"
    >
        <X size={32} />
    </button>

    <nav class="flex flex-col items-center gap-12">
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
                class="w-10 h-auto"
            />
            <h1 class="text-2xl font-bold tracking-tight uppercase">
                {$t("common.squar")}
            </h1>
        </div>

        <div class="flex flex-col items-center gap-8">
            {#each [{ label: $t("landing.nav.how_it_works"), id: "how-it-works" }, { label: $t("landing.nav.pricing"), id: "actually-free" }, { label: $t("landing.nav.features"), id: "features" }] as item, i}
                <button
                    class="text-3xl font-bold transition-all duration-500 transform translate-y-0 cursor-pointer {activeSection ===
                    item.id
                        ? 'text-accent'
                        : 'text-muted hover:text-accent'}"
                    style="transition-delay: {isMenuOpen
                        ? 100 + i * 100
                        : 0}ms; opacity: {isMenuOpen
                        ? 1
                        : 0}; transform: translateY({isMenuOpen ? 0 : 20}px);"
                    onclick={() => scrollToSection(item.id)}
                >
                    {item.label}
                </button>
            {/each}

            <div
                class="transition-all duration-500 delay-500"
                style="opacity: {isMenuOpen
                    ? 1
                    : 0}; transform: translateY({isMenuOpen ? 0 : 20}px);"
            >
                {#if $page.data.user}
                    <Button
                        size="lg"
                        onclick={() => {
                            isMenuOpen = false;
                            goto(
                                $page.data.page?.slug
                                    ? `/${$page.data.page.slug}`
                                    : "/",
                            );
                        }}
                    >
                        {$t("landing.nav.my_squar")}
                    </Button>
                {:else}
                    <Button
                        size="lg"
                        onclick={() => {
                            isMenuOpen = false;
                            goto("/signup");
                        }}
                    >
                        {$t("common.join_squar")}
                    </Button>
                {/if}
            </div>
        </div>
    </nav>
</div>
