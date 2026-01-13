<script lang="ts">
    import {
        Check,
        Image,
        LayoutGrid,
        Zap,
    } from "lucide-svelte";
    import { Container } from "$lib/components/layout";
    import PageHead from "$lib/components/PageHead.svelte";
    import { t } from "svelte-i18n";
    import Hero from "$lib/components/landing/Hero.svelte";

    let howItWorksVisible = $state(false);
    let actuallyFreeVisible = $state(false);
    let featuresVisible = $state(false);

    $effect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (
                        entry.target.id === "how-it-works" &&
                        entry.isIntersecting
                    ) {
                        howItWorksVisible = true;
                    }
                    if (
                        entry.target.id === "actually-free" &&
                        entry.isIntersecting
                    ) {
                        actuallyFreeVisible = true;
                    }
                    if (
                        entry.target.id === "features" &&
                        entry.isIntersecting
                    ) {
                        featuresVisible = true;
                    }
                });
            },
            { threshold: 0.2, rootMargin: "0px 0px -100px 0px" },
        );

        const sections = [
            document.querySelector("#how-it-works"),
            document.querySelector("#actually-free"),
            document.querySelector("#features"),
        ];

        sections.forEach((section) => {
            if (section) observer.observe(section);
        });

        return () => observer.disconnect();
    });
</script>

<PageHead
    title="Squar"
    description="Design your page, drag your blocks, and make it yours. Open-source, always free."
/>

<svelte:head>
    <style>
        .fade-in {
            opacity: 0;
            transform: translateY(24px);
            transition:
                opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .fade-in.visible {
            opacity: 1;
            transform: translateY(0);
        }

        .stagger-1 {
            transition-delay: 0ms;
        }
        .stagger-2 {
            transition-delay: 100ms;
        }
        .stagger-3 {
            transition-delay: 200ms;
        }
        .stagger-4 {
            transition-delay: 300ms;
        }
    </style>
</svelte:head>

<main class="relative">
    <Hero />

    <!-- How it works -->
    <Container id="how-it-works" class="py-24 ">
        <div
            class="text-center mb-16 fade-in stagger-1"
            class:visible={howItWorksVisible}
        >
            <h2 class="text-3xl font-bold mb-4 text-text">
                {$t("landing.how_it_works.title")}
            </h2>
            <p class="text-muted max-w-2xl mx-auto">
                {$t("landing.how_it_works.subtitle")}
            </p>
        </div>

        <div
            class="max-w-3xl mx-auto fade-in stagger-2"
            class:visible={howItWorksVisible}
        >
            <div
                class="relative border-l border-border ml-6 md:ml-12 space-y-12"
            >
                <div class="relative pl-8 md:pl-12">
                    <div
                        class="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-background"
                    ></div>

                    <span
                        class="text-xs font-bold text-muted uppercase tracking-widest mb-2 block"
                        >{$t("landing.how_it_works.step")} 01</span
                    >

                    <h3 class="text-xl font-bold text-text mb-2">
                        {$t("landing.how_it_works.step1_title")}
                    </h3>

                    <p class="text-muted text-sm leading-relaxed">
                        {$t("landing.how_it_works.step1_desc")}
                    </p>
                </div>

                <div class="relative pl-8 md:pl-12">
                    <div
                        class="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-background"
                    ></div>

                    <span
                        class="text-xs font-bold text-muted uppercase tracking-widest mb-2 block"
                        >{$t("landing.how_it_works.step")} 02</span
                    >

                    <h3 class="text-xl font-bold text-text mb-2">
                        {$t("landing.how_it_works.step2_title")}
                    </h3>

                    <p class="text-muted text-sm leading-relaxed">
                        {$t("landing.how_it_works.step2_desc")}
                    </p>
                </div>

                <div class="relative pl-8 md:pl-12">
                    <div
                        class="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-background"
                    ></div>

                    <span
                        class="text-xs font-bold text-muted uppercase tracking-widest mb-2 block"
                        >{$t("landing.how_it_works.step")} 03</span
                    >

                    <h3 class="text-xl font-bold text-text mb-2">
                        {$t("landing.how_it_works.step3_title")}
                    </h3>

                    <p class="text-muted text-sm leading-relaxed">
                        {$t("landing.how_it_works.step3_desc")}
                    </p>
                </div>
            </div>
        </div>
    </Container>

    <!-- Actually Free -->
    <Container id="actually-free" class="py-24 ">
        <div
            class="text-center mb-16 fade-in stagger-1"
            class:visible={actuallyFreeVisible}
        >
            <h2 class="text-3xl font-bold mb-4 text-text">
                {$t("landing.pricing.title")}
            </h2>
            <p class="text-muted max-w-2xl mx-auto">
                {$t("landing.pricing.subtitle")}
            </p>
        </div>

        <!-- Modern List Design -->
        <div
            class="max-w-3xl mx-auto fade-in stagger-2"
            class:visible={actuallyFreeVisible}
        >
            <div class="grid gap-4">
                {#each [{ t: "landing.pricing.unlimited_blocks", d: "landing.pricing.unlimited_blocks_desc" }, { t: "landing.pricing.themes_included", d: "landing.pricing.themes_included_desc" }, { t: "landing.pricing.profile_customization", d: "landing.pricing.profile_customization_desc" }, { t: "landing.pricing.no_watermark", d: "landing.pricing.no_watermark_desc" }, { t: "landing.pricing.forever_free", d: "landing.pricing.forever_free_desc" }] as item}
                    <div
                        class="flex items-center gap-4 p-4 bg-background rounded-xl border border-border/50 hover:border-accent/50 transition-colors"
                    >
                        <div
                            class="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shrink-0"
                        >
                            <Check size={16} strokeWidth={3} />
                        </div>
                        <div class="text-left">
                            <span class="font-bold text-text">{$t(item.t)}</span
                            >
                            <span class="hidden md:inline text-muted mx-2"
                                >—</span
                            >
                            <span class="block md:inline text-sm text-muted"
                                >{$t(item.d)}</span
                            >
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </Container>

    <!-- Features -->
    <Container id="features" class="py-24 ">
        <div
            class="text-center mb-16 fade-in stagger-1"
            class:visible={featuresVisible}
        >
            <h2 class="text-3xl font-bold mb-4 text-text">
                {$t("landing.features.title")}
            </h2>
            <p class="text-muted max-w-2xl mx-auto">
                {$t("landing.features.subtitle")}
            </p>
        </div>

        <div
            class="max-w-3xl mx-auto fade-in stagger-2"
            class:visible={featuresVisible}
        >
            <div class="grid gap-4">
                <div
                    class="flex items-center gap-6 p-6 bg-background rounded-2xl border border-border/50 hover:border-accent/50 transition-colors"
                >
                    <div
                        class="w-12 h-12 rounded-xl bg-accent/5 flex items-center justify-center text-accent shrink-0"
                    >
                        <LayoutGrid size={24} />
                    </div>
                    <div class="text-left">
                        <h3 class="text-lg font-bold text-text mb-1">
                            {$t("landing.features.grid_system")}
                        </h3>
                        <p class="text-muted text-sm leading-relaxed">
                            {$t("landing.features.grid_system_desc")}
                        </p>
                    </div>
                </div>
                <div
                    class="flex items-center gap-6 p-6 bg-background rounded-2xl border border-border/50 hover:border-accent/50 transition-colors"
                >
                    <div
                        class="w-12 h-12 rounded-xl bg-accent/5 flex items-center justify-center text-accent shrink-0"
                    >
                        <Image size={24} />
                    </div>
                    <div class="text-left">
                        <h3 class="text-lg font-bold text-text mb-1">
                            {$t("landing.features.rich_media")}
                        </h3>
                        <p class="text-muted text-sm leading-relaxed">
                            {$t("landing.features.rich_media_desc")}
                        </p>
                    </div>
                </div>
                <div
                    class="flex items-center gap-6 p-6 bg-background rounded-2xl border border-border/50 hover:border-accent/50 transition-colors"
                >
                    <div
                        class="w-12 h-12 rounded-xl bg-accent/5 flex items-center justify-center text-accent shrink-0"
                    >
                        <Zap size={24} />
                    </div>
                    <div class="text-left">
                        <h3 class="text-lg font-bold text-text mb-1">
                            {$t("landing.features.no_limits")}
                        </h3>
                        <p class="text-muted text-sm leading-relaxed">
                            {$t("landing.features.no_limits_desc")}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </Container>
</main>
