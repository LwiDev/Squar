<script lang="ts">
    import { Button, Card } from "$lib/components/ui";
    import { Container } from "$lib/components/layout";
    import { goto } from "$app/navigation";
    import { LayoutGrid, Image, Zap, Move, Github } from "lucide-svelte";
    import { PUBLIC_GITHUB_URL } from "$env/static/public";
</script>

<main>
    <!-- Hero -->
    <Container class="py-20 md:py-32 text-center">
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
            Now available in v1.0
        </div>
        <h1
            class="text-5xl md:text-7xl font-bold tracking-tight text-text mb-6 leading-tight"
        >
            Your personal page.<br />
            <span class="text-accent">Reimagined.</span>
        </h1>
        <p class="text-xl text-muted max-w-2xl mx-auto mb-10">
            Squar.me is the open-source, self-hosted alternative to Bento.<br />
            Create your grid, drag blocks, and share your world.
        </p>
        <div
            class="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
            <Button
                size="lg"
                onclick={() => goto("/signup")}
                class="w-full sm:w-auto px-8 h-12 text-base"
            >
                Create your Squar
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
                    class="w-full gap-2 h-12 text-base"
                >
                    <Github size={20} />
                    Star on GitHub
                </Button>
            </a>
        </div>
    </Container>

    <!-- UI Demo / Grid visualization -->
    <Container size="md" class="pb-24">
        <div class="relative">
            <!-- Decorative background blob -->
            <div
                class="absolute -inset-1 bg-gradient-to-r from-accent to-purple-600 rounded-2xl blur opacity-20"
            ></div>

            <Card
                class="relative p-4 md:p-8 shadow-2xl overflow-hidden"
            >
                <!-- Browser chrome simulation -->
                <div
                    class="flex items-center gap-2 mb-6 border-b border-border pb-4"
                >
                    <div class="flex gap-1.5">
                        <div class="w-3 h-3 rounded-full bg-red-400"></div>
                        <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div class="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div
                        class="ml-4 text-xs text-muted font-mono bg-accent/5 px-2 py-0.5 rounded"
                    >
                        squar.me/demo
                    </div>
                </div>

                <!-- The Grid -->
                <div
                    class="grid grid-cols-2 md:grid-cols-4 gap-4 aspect-[4/3] md:aspect-[16/9]"
                >
                    <Card
                        class="col-span-2 row-span-2 relative overflow-hidden group border-0 bg-accent text-white flex flex-col justify-between p-6 hover:shadow-lg transition-all"
                    >
                        <div
                            class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Move size={16} />
                        </div>
                        <h3 class="text-2xl font-bold">Hi, I'm Squar.</h3>
                        <p class="opacity-90">
                            I'm a developer and designer building open source
                            tools.
                        </p>
                    </Card>

                    <Card
                        class="col-span-1 row-span-1 flex items-center justify-center bg-blue-500 text-white border-0 hover:shadow-lg transition-all cursor-pointer"
                    >
                        <span class="font-bold">Twitter</span>
                    </Card>

                    <Card
                        class="col-span-1 row-span-2 relative overflow-hidden group border-0 bg-zinc-900 text-white flex flex-col justify-end p-4 hover:shadow-lg transition-all"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=800&auto=format&fit=crop"
                            alt="Spotify"
                            class="absolute inset-0 w-full h-full object-cover opacity-50"
                        />
                        <div class="relative z-10">
                            <p
                                class="text-xs font-bold text-green-400 uppercase mb-1"
                            >
                                Now Playing
                            </p>
                            <p class="font-semibold leading-tight">
                                Squar Theme
                            </p>
                            <p class="text-xs opacity-70">Original Mix</p>
                        </div>
                    </Card>

                    <Card
                        class="col-span-1 row-span-1 flex items-center justify-center bg-pink-500 text-white border-0 hover:shadow-lg transition-all cursor-pointer"
                    >
                        <span class="font-bold">Instagram</span>
                    </Card>

                    <Card
                        class="col-span-2 md:col-span-1 flex items-center justify-center border-dashed border-2 border-border bg-transparent text-muted hover:border-accent hover:text-accent transition-colors cursor-pointer"
                    >
                        <span class="text-sm">+ Add Block</span>
                    </Card>
                    <Card
                        class="col-span-2 flex items-center justify-center bg-orange-500 text-white border-0 hover:shadow-lg transition-all cursor-pointer"
                    >
                        <span class="font-bold">Read my Blog</span>
                    </Card>
                </div>
            </Card>
        </div>
    </Container>

    <!-- Features -->
    <Container class="py-24 border-t border-border">
        <div class="text-center mb-16">
            <h2 class="text-3xl font-bold mb-4 text-text">Everything you need</h2>
            <p class="text-muted max-w-2xl mx-auto">
                Focused on simplicity and flexibility. No bloat, just the
                essentials to build your perfect page.
            </p>
        </div>

        <div class="grid md:grid-cols-3 gap-10">
            <Card
                class="space-y-4 p-8 hover:bg-accent/5 hover:border-accent/20 transition-all duration-300"
            >
                <div
                    class="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-2"
                >
                    <LayoutGrid size={24} />
                </div>
                <h3 class="text-xl font-bold text-text">Smart Grid System</h3>
                <p class="text-muted leading-relaxed">
                    12-column intelligent grid that snaps to place. Drag,
                    resize, and arrange your blocks freely with zero code.
                </p>
            </Card>

            <Card
                class="space-y-4 p-8 hover:bg-accent/5 hover:border-accent/20 transition-all duration-300"
            >
                <div
                    class="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-2"
                >
                    <Image size={24} />
                </div>
                <h3 class="text-xl font-bold text-text">Rich Media Support</h3>
                <p class="text-muted leading-relaxed">
                    Upload high-res images, embed videos, add links, or write
                    text. We optimize everything for lightning-fast loading.
                </p>
            </Card>

            <Card
                class="space-y-4 p-8 hover:bg-accent/5 hover:border-accent/20 transition-all duration-300"
            >
                <div
                    class="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-2"
                >
                    <Zap size={24} />
                </div>
                <h3 class="text-xl font-bold text-text">No Limits, No Paywalls</h3>
                <p class="text-muted leading-relaxed">
                    Everything is free. No premium plans, no hidden costs, and no 
                    artificial limits on your creativity. Just you and your space.
                </p>
            </Card>
        </div>
    </Container>
</main>