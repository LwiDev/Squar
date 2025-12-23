<script lang="ts">
    import { Button, Card } from "$lib/components/ui";
    import { Container } from "$lib/components/layout";
    import PageHead from "$lib/components/PageHead.svelte";
    import { goto } from "$app/navigation";
    import {
        LayoutGrid,
        Image,
        Zap,
        Github,
        Plus,
        Type,
        Link as LinkIcon,
        Image as ImageIcon,
        GripVertical,
        MousePointer2,
        Palette,
        Share2,
        Check,
    } from "lucide-svelte";
    import { PUBLIC_GITHUB_URL } from "$env/static/public";
    import { t } from "svelte-i18n";

    let heroVisible = $state(false);
    let demoVisible = $state(false);
    let howItWorksVisible = $state(false);
    let actuallyFreeVisible = $state(false);
    let featuresVisible = $state(false);

    $effect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.target.id === "hero" && entry.isIntersecting) {
                        heroVisible = true;
                    }
                    if (entry.target.id === "demo" && entry.isIntersecting) {
                        demoVisible = true;
                    }
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
            document.querySelector("#hero"),
            document.querySelector("#demo"),
            document.querySelector("#how-it-works"),
            document.querySelector("#actually-free"),
            document.querySelector("#features"),
        ];

        sections.forEach((section) => {
            if (section) observer.observe(section);
        });

        setTimeout(() => {
            heroVisible = true;
        }, 100);

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
    <!-- Hero -->
    <Container id="hero" class="pb-20 md:pb-32 md:pt-30 text-center">
        <div class="fade-in stagger-1" class:visible={heroVisible}>
            <div
                class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6"
            >
                <span class="relative flex h-2 w-2">
                    <span
                        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"
                    ></span>
                    <span
                        class="relative inline-flex rounded-full h-2 w-2 bg-accent"
                    ></span>
                </span>
                {$t('landing.hero.tagline')}
            </div>
        </div>

        <h1
            class="text-5xl md:text-7xl font-bold tracking-tight text-text mb-6 leading-tight fade-in stagger-2"
            class:visible={heroVisible}
        >
            {$t('landing.hero.title')}
        </h1>

        <p
            class="text-xl text-muted max-w-2xl mx-auto mb-10 fade-in stagger-3"
            class:visible={heroVisible}
        >
            {$t('landing.hero.subtitle')}
        </p>

        <div
            class="flex flex-col sm:flex-row items-center justify-center gap-4 fade-in stagger-4"
            class:visible={heroVisible}
        >
            <Button
                size="lg"
                onclick={() => goto("/signup")}
                class="w-full sm:w-auto px-8 h-12 text-base transition-transform hover:scale-[1.02]"
            >
                {$t('landing.hero.cta')}
            </Button>
            <a
                href={PUBLIC_GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                class="w-full sm:w-auto"
            >
                <Button
                    variant="secondary"
                    size="lg"
                    class="w-full gap-2 h-12 text-base transition-transform hover:scale-[1.02]"
                >
                    <Github size={20} />
                    {$t('landing.hero.star_github')}
                </Button>
            </a>
        </div>
    </Container>

    <!-- UI Demo / Grid visualization -->
    <Container id="demo" size="md" class="pb-24">
        <div class="relative fade-in" class:visible={demoVisible}>
            <div
                class="absolute -inset-1 bg-gradient-to-r from-accent to-purple-600 rounded-2xl blur opacity-20"
            ></div>

            <Card
                class="relative shadow-2xl overflow-hidden flex flex-col h-[500px] md:h-[600px]"
            >
                <div
                    class="h-14 border-b border-border flex items-center justify-between px-4 bg-background z-10"
                >
                    <div class="flex items-center gap-2">
                        <div
                            class="h-8 w-8 rounded-full bg-accent text-white flex items-center justify-center font-bold"
                        >
                            L
                        </div>
                        <span class="text-sm font-medium">@lwi</span>
                    </div>

                    <div
                        class="hidden md:flex items-center gap-1 bg-secondary/50 p-1 rounded-lg"
                    >
                        <button
                            class="p-1.5 hover:bg-background rounded-md text-text transition-colors"
                        >
                            <Plus size={18} />
                        </button>
                        <div class="w-px h-4 bg-border mx-1"></div>
                        <button
                            class="p-1.5 hover:bg-background rounded-md text-muted hover:text-text transition-colors"
                        >
                            <Type size={18} />
                        </button>
                        <button
                            class="p-1.5 hover:bg-background rounded-md text-muted hover:text-text transition-colors"
                        >
                            <LinkIcon size={18} />
                        </button>
                        <button
                            class="p-1.5 hover:bg-background rounded-md text-muted hover:text-text transition-colors"
                        >
                            <ImageIcon size={18} />
                        </button>
                    </div>

                    <div class="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            class="hidden sm:inline-flex">Preview</Button
                        >
                        <Button size="sm">Publish</Button>
                    </div>
                </div>

                <div
                    class="flex-1 bg-secondary/10 relative p-4 md:p-8 overflow-hidden"
                >
                    <div
                        class="absolute inset-0"
                        style="background-image: radial-gradient(#888888 1px, transparent 1px); background-size: 24px 24px; opacity: 0.1;"
                    ></div>

                    <div
                        class="grid grid-cols-2 md:grid-cols-4 gap-4 h-full relative z-0"
                    >
                        <div class="col-span-2 row-span-2 relative group">
                            <div
                                class="absolute -inset-0.5 border-2 border-accent rounded-xl z-20 pointer-events-none"
                            >
                                <div
                                    class="absolute -top-1.5 -left-1.5 w-3 h-3 bg-accent rounded-full border border-background"
                                ></div>
                                <div
                                    class="absolute -top-1.5 -right-1.5 w-3 h-3 bg-accent rounded-full border border-background"
                                ></div>
                                <div
                                    class="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-accent rounded-full border border-background"
                                ></div>
                                <div
                                    class="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-accent rounded-full border border-background"
                                ></div>
                                <div
                                    class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-white rounded px-2 py-0.5 text-[10px] font-bold"
                                >
                                    Selected
                                </div>
                            </div>

                            <Card
                                variant="glass"
                                class="h-full flex flex-col justify-between p-6 relative overflow-hidden"
                            >
                                <div class="absolute top-3 left-3 opacity-50">
                                    <GripVertical size={16} />
                                </div>
                                <div class="mt-4">
                                    <h3 class="text-2xl font-bold">
                                        Hi, I'm Squar.
                                    </h3>
                                    <p class="text-muted mt-2">
                                        Building open source tools for everyone.
                                    </p>
                                </div>
                            </Card>
                        </div>

                        <div
                            class="col-span-1 row-span-1 relative group cursor-grab active:cursor-grabbing"
                        >
                            <div
                                class="absolute inset-0 border-2 border-transparent group-hover:border-accent/50 rounded-xl transition-colors pointer-events-none z-10"
                            ></div>
                            <Card
                                variant="glass"
                                class="h-full bg-blue-500 text-white flex items-center justify-center relative"
                            >
                                <span class="font-bold">Twitter</span>
                            </Card>
                        </div>

                        <div
                            class="col-span-1 row-span-2 relative group cursor-grab active:cursor-grabbing"
                        >
                            <div
                                class="absolute inset-0 border-2 border-transparent group-hover:border-accent/50 rounded-xl transition-colors pointer-events-none z-10"
                            ></div>
                            <Card
                                variant="glass"
                                class="h-full bg-zinc-900 text-white relative overflow-hidden flex flex-col justify-end p-4"
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=800&auto=format&fit=crop"
                                    alt="Cover"
                                    class="absolute inset-0 w-full h-full object-cover opacity-50"
                                />
                                <div class="relative z-10">
                                    <p
                                        class="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-1"
                                    >
                                        Now Playing
                                    </p>
                                    <p
                                        class="font-semibold leading-tight text-sm"
                                    >
                                        Squar Theme
                                    </p>
                                </div>
                            </Card>
                        </div>

                        <div
                            class="col-span-1 row-span-1 relative group cursor-grab active:cursor-grabbing"
                        >
                            <div
                                class="absolute inset-0 border-2 border-transparent group-hover:border-accent/50 rounded-xl transition-colors pointer-events-none z-10"
                            ></div>
                            <Card
                                variant="glass"
                                class="h-full bg-pink-500 text-white flex items-center justify-center"
                            >
                                <span class="font-bold">Instagram</span>
                            </Card>
                        </div>

                        <div
                            class="col-span-2 md:col-span-1 row-span-1 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted hover:border-accent hover:text-accent hover:bg-accent/5 transition-colors cursor-pointer gap-2"
                        >
                            <Plus size={24} />
                            <span class="text-xs font-medium">Add Block</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    </Container>

    <!-- How it works -->
    <Container id="how-it-works" class="py-24 border-t border-border">
        <div
            class="text-center mb-16 fade-in stagger-1"
            class:visible={howItWorksVisible}
        >
            <h2 class="text-3xl font-bold mb-4 text-text">{$t('landing.how_it_works.title')}</h2>
            <p class="text-muted max-w-2xl mx-auto">
                {$t('landing.how_it_works.subtitle')}
            </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card
                class={`text-center p-8 fade-in stagger-2 ${howItWorksVisible ? "visible" : ""}`}
                variant="hover"
            >
                <div
                    class="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mx-auto mb-6"
                >
                    <MousePointer2 size={28} />
                </div>
                <h3 class="text-xl font-bold mb-3 text-text">
                    {$t('landing.how_it_works.step1_title')}
                </h3>
                <p class="text-muted leading-relaxed">
                    {$t('landing.how_it_works.step1_desc')}
                </p>
            </Card>

            <Card
                class={`text-center p-8 fade-in stagger-3 ${howItWorksVisible ? "visible" : ""}`}
                variant="hover"
            >
                <div
                    class="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mx-auto mb-6"
                >
                    <Palette size={28} />
                </div>
                <h3 class="text-xl font-bold mb-3 text-text">
                    {$t('landing.how_it_works.step2_title')}
                </h3>
                <p class="text-muted leading-relaxed">
                    {$t('landing.how_it_works.step2_desc')}
                </p>
            </Card>

            <Card
                class={`text-center p-8 fade-in stagger-4 ${howItWorksVisible ? "visible" : ""}`}
                variant="hover"
            >
                <div
                    class="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mx-auto mb-6"
                >
                    <Share2 size={28} />
                </div>
                <h3 class="text-xl font-bold mb-3 text-text">
                    {$t('landing.how_it_works.step3_title')}
                </h3>
                <p class="text-muted leading-relaxed">
                    {$t('landing.how_it_works.step3_desc')}
                </p>
            </Card>
        </div>
    </Container>

    <!-- Actually Free -->
    <Container id="actually-free" class="py-24 border-t border-border">
        <div
            class="text-center mb-16 fade-in stagger-1"
            class:visible={actuallyFreeVisible}
        >
            <h2 class="text-3xl font-bold mb-4 text-text">
                {$t('landing.pricing.title')}
            </h2>
            <p class="text-muted max-w-2xl mx-auto">
                {$t('landing.pricing.subtitle')}
            </p>
        </div>

        <div class="max-w-2xl mx-auto">
            <Card
                class={`p-8 fade-in stagger-2 ${actuallyFreeVisible ? "visible" : ""}`}
            >
                <div class="space-y-4">
                    <div class="flex items-start gap-3">
                        <div class="mt-1">
                            <Check size={20} class="text-accent" />
                        </div>
                        <div>
                            <p class="text-text font-medium">
                                {$t('landing.pricing.unlimited_blocks')}
                            </p>
                            <p class="text-muted text-sm mt-1">
                                {$t('landing.pricing.unlimited_blocks_desc')}
                            </p>
                        </div>
                    </div>

                    <div class="h-px bg-border"></div>

                    <div class="flex items-start gap-3">
                        <div class="mt-1">
                            <Check size={20} class="text-accent" />
                        </div>
                        <div>
                            <p class="text-text font-medium">
                                {$t('landing.pricing.themes_included')}
                            </p>
                            <p class="text-muted text-sm mt-1">
                                {$t('landing.pricing.themes_included_desc')}
                            </p>
                        </div>
                    </div>

                    <div class="h-px bg-border"></div>

                    <div class="flex items-start gap-3">
                        <div class="mt-1">
                            <Check size={20} class="text-accent" />
                        </div>
                        <div>
                            <p class="text-text font-medium">
                                {$t('landing.pricing.profile_customization')}
                            </p>
                            <p class="text-muted text-sm mt-1">
                                {$t('landing.pricing.profile_customization_desc')}
                            </p>
                        </div>
                    </div>

                    <div class="h-px bg-border"></div>

                    <div class="flex items-start gap-3">
                        <div class="mt-1">
                            <Check size={20} class="text-accent" />
                        </div>
                        <div>
                            <p class="text-text font-medium">{$t('landing.pricing.no_watermark')}</p>
                            <p class="text-muted text-sm mt-1">
                                {$t('landing.pricing.no_watermark_desc')}
                            </p>
                        </div>
                    </div>

                    <div class="h-px bg-border"></div>

                    <div class="flex items-start gap-3">
                        <div class="mt-1">
                            <Check size={20} class="text-accent" />
                        </div>
                        <div>
                            <p class="text-text font-medium">{$t('landing.pricing.forever_free')}</p>
                            <p class="text-muted text-sm mt-1">
                                {$t('landing.pricing.forever_free_desc')}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    </Container>

    <!-- Features -->
    <Container id="features" class="py-24 border-t border-border">
        <div
            class="text-center mb-16 fade-in stagger-1"
            class:visible={featuresVisible}
        >
            <h2 class="text-3xl font-bold mb-4 text-text">
                {$t('landing.features.title')}
            </h2>
            <p class="text-muted max-w-2xl mx-auto">
                {$t('landing.features.subtitle')}
            </p>
        </div>

        <div class="grid md:grid-cols-3 gap-10">
            <Card
                variant="hover"
                class={`space-y-4 p-8 fade-in stagger-2 ${featuresVisible ? "visible" : ""}`}
            >
                <div
                    class="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-2"
                >
                    <LayoutGrid size={24} />
                </div>
                <h3 class="text-xl font-bold text-text">{$t('landing.features.grid_system')}</h3>
                <p class="text-muted leading-relaxed">
                    {$t('landing.features.grid_system_desc')}
                </p>
            </Card>

            <Card
                variant="hover"
                class={`space-y-4 p-8 fade-in stagger-3 ${featuresVisible ? "visible" : ""}`}
            >
                <div
                    class="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-2"
                >
                    <Image size={24} />
                </div>
                <h3 class="text-xl font-bold text-text">{$t('landing.features.rich_media')}</h3>
                <p class="text-muted leading-relaxed">
                    {$t('landing.features.rich_media_desc')}
                </p>
            </Card>

            <Card
                variant="hover"
                class={`space-y-4 p-8 fade-in stagger-4 ${featuresVisible ? "visible" : ""}`}
            >
                <div
                    class="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-2"
                >
                    <Zap size={24} />
                </div>
                <h3 class="text-xl font-bold text-text">
                    {$t('landing.features.no_limits')}
                </h3>
                <p class="text-muted leading-relaxed">
                    {$t('landing.features.no_limits_desc')}
                </p>
            </Card>
        </div>
    </Container>
</main>
