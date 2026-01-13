<script lang="ts">
    import {
        Button,
        Card,
        IconButton,
        Separator,
        Tooltip,
    } from "$lib/components/ui";
    import { Container } from "$lib/components/layout";
    import { goto } from "$app/navigation";
    import {
        Github,
        Type,
        Link as LinkIcon,
        Image as ImageIcon,
        Video as VideoIcon,
        Undo2,
        Redo2,
        Eye,
        Globe,
        Heading,
    } from "lucide-svelte";
    import { PUBLIC_GITHUB_URL } from "$env/static/public";
    import { t } from "svelte-i18n";
    import GridCanvas from "$lib/components/unified/GridCanvas.svelte";
    import PageHeader from "$lib/components/unified/PageHeader.svelte";
    import type { Block } from "$lib/types/models";

    let heroVisible = $state(false);
    let demoVisible = $state(false);

    // Demo Data
    let demoTitle = $state("John Doe");
    let demoDescription = $state("Digital Creator & Developer");
    let demoProfile = $state({
        position: "center" as const,
        size: "medium" as const,
        shape: "circle" as const,
        visibility: "letter" as const,
        layout: "vertical" as const,
    });

    let demoBlocks = $state<Block[]>([
        {
            id: "1",
            type: "heading",
            x: 0,
            y: 0,
            w: 2,
            h: 1,
            data: { text: "My Portfolio" },
        },
        {
            id: "2",
            type: "text",
            x: 0,
            y: 1,
            w: 2,
            h: 1,
            data: { text: "Passionate about building great user experiences." },
        },
        {
            id: "3",
            type: "image",
            x: 2,
            y: 0,
            w: 2,
            h: 2,
            data: {
                imageUrl:
                    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop",
            },
        },
    ]);

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
                });
            },
            { threshold: 0.2, rootMargin: "0px 0px -100px 0px" },
        );

        const sections = [
            document.querySelector("#hero"),
            document.querySelector("#demo"),
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

<!-- Hero -->
<Container id="hero" class="pb-20 pt-10 md:pb-32 md:pt-25 text-center">
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
            {$t("landing.hero.tagline")}
        </div>
    </div>

    <h1
        class="text-5xl md:text-7xl font-bold tracking-tight text-text mb-6 leading-tight fade-in stagger-2"
        class:visible={heroVisible}
    >
        {$t("landing.hero.title")}
    </h1>

    <p
        class="text-xl text-muted max-w-2xl mx-auto mb-10 fade-in stagger-3"
        class:visible={heroVisible}
    >
        {$t("landing.hero.subtitle")}
    </p>

    <div
        id="hero-cta"
        class="flex flex-col sm:flex-row items-center justify-center gap-4 fade-in stagger-4"
        class:visible={heroVisible}
    >
        <Button
            size="lg"
            onclick={() => goto("/signup")}
            class="w-full sm:w-auto px-8 h-12 text-base transition-transform hover:scale-[1.02]"
        >
            {$t("landing.hero.cta")}
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
                {$t("landing.hero.star_github")}
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
            class="relative shadow-2xl overflow-hidden flex flex-col h-[600px] md:h-[700px] bg-background"
        >
            <!-- Browser Content Area -->
            <div class="flex-1 overflow-hidden relative no-scrollbar">
                <div class="max-w-6xl mx-auto p-4 md:p-8 pb-32 h-full">
                    <PageHeader
                        editable={false}
                        bind:title={demoTitle}
                        bind:description={demoDescription}
                        bind:profilePhoto={demoProfile}
                        username="johndoe"
                    />

                    <div class="mt-8">
                        <GridCanvas blocks={demoBlocks} editable={false} />
                    </div>
                </div>
            </div>

            <!-- Fake Toolbar (Replica of EditorToolbar) -->
            <div
                class="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-40 pointer-events-none"
            >
                <div
                    class="relative bg-background/70 backdrop-blur-xl border border-border rounded-sm px-4 py-2 shadow-sm w-full pointer-events-auto"
                >
                    <div
                        class="flex items-center justify-between w-full h-12 px-1 sm:px-2 gap-2"
                    >
                        <!-- LEFT: User -->
                        <div
                            class="flex items-center gap-2 sm:gap-3 shrink-0"
                        >
                            <button
                                class="flex items-center gap-1 sm:gap-2 px-1 py-1.5 rounded hover:bg-border/50 transition-colors"
                            >
                                <div
                                    class="h-8 w-8 min-w-[32px] rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm"
                                >
                                    J
                                </div>
                                <span
                                    class="text-sm font-medium hidden sm:block"
                                    >@johndoe</span
                                >
                            </button>
                            <Separator />
                        </div>

                        <!-- CENTER: Tools -->
                        <div
                            class="flex-1 flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar mask-fade px-2"
                        >
                            <div class="flex items-center gap-1 shrink-0">
                                <Tooltip
                                    text={$t("editor.toolbar.add_title")}
                                >
                                    <button
                                        class="p-1.5 hover:bg-border/50 rounded-md text-muted hover:text-text transition-colors"
                                    >
                                        <Heading size={18} />
                                    </button>
                                </Tooltip>
                                <Tooltip
                                    text={$t("editor.toolbar.add_text")}
                                >
                                    <button
                                        class="p-1.5 hover:bg-border/50 rounded-md text-muted hover:text-text transition-colors"
                                    >
                                        <Type size={18} />
                                    </button>
                                </Tooltip>
                                <Tooltip
                                    text={$t("editor.toolbar.add_link")}
                                >
                                    <button
                                        class="p-1.5 hover:bg-border/50 rounded-md text-muted hover:text-text transition-colors"
                                    >
                                        <LinkIcon size={18} />
                                    </button>
                                </Tooltip>
                                <Tooltip
                                    text={$t("editor.toolbar.add_image")}
                                >
                                    <button
                                        class="p-1.5 hover:bg-border/50 rounded-md text-muted hover:text-text transition-colors"
                                    >
                                        <ImageIcon size={18} />
                                    </button>
                                </Tooltip>
                                <Tooltip
                                    text={$t("editor.toolbar.add_video")}
                                >
                                    <button
                                        class="p-1.5 hover:bg-border/50 rounded-md text-muted hover:text-text transition-colors"
                                    >
                                        <VideoIcon size={18} />
                                    </button>
                                </Tooltip>
                            </div>

                            <Separator />

                            <div class="flex gap-0.5 sm:gap-1 shrink-0">
                                <Tooltip text={$t("editor.toolbar.undo")}>
                                    <IconButton
                                        icon={Undo2}
                                        disabled={true}
                                    />
                                </Tooltip>
                                <Tooltip text={$t("editor.toolbar.redo")}>
                                    <IconButton
                                        icon={Redo2}
                                        disabled={true}
                                    />
                                </Tooltip>
                            </div>
                        </div>

                        <!-- RIGHT: Actions -->
                        <div
                            class="flex items-center gap-2 sm:gap-3 shrink-0 justify-end"
                        >
                            <Separator />
                            <Tooltip text={$t("editor.toolbar.preview")}>
                                <IconButton icon={Eye} />
                            </Tooltip>
                            <Button
                                size="sm"
                                variant="primary"
                                class="hidden sm:flex px-3"
                            >
                                <Globe size={16} class="mr-1.5" />
                                {$t("editor.toolbar.publish")}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    </div>
</Container>
