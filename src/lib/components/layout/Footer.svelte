<script lang="ts">
    import { goto } from "$app/navigation";
    import logo from "$lib/assets/images/logos/logo.png";
    import { Container } from "$lib/components/layout";
    import { PUBLIC_GITHUB_URL } from "$env/static/public";
</script>

<footer class="w-full border-t border-border bg-background py-12 mt-20">
    <Container>
        <div
            class="flex flex-col md:flex-row items-center justify-between gap-8"
        >
            <div class="flex flex-col items-center md:items-start gap-4">
                <div
                    class="flex items-center gap-2 hover:opacity-70 transition-opacity cursor-pointer"
                    onclick={() => goto("/")}
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
                        Squar
                    </h1>
                </div>
                <p
                    class="text-xs text-muted max-w-[200px] text-center md:text-left leading-relaxed"
                >
                    The open-source, self-hosted personal page builder.
                </p>
            </div>

            <div class="flex flex-col items-center md:items-end gap-6">
                <nav
                    class="flex items-center gap-8 text-xs font-semibold text-muted uppercase tracking-wider"
                >
                    <a
                        href={PUBLIC_GITHUB_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="hover:text-text transition-colors">GitHub</a
                    >
                    <a href="/login" class="hover:text-text transition-colors"
                        >Login</a
                    >
                    <a href="/signup" class="hover:text-text transition-colors"
                        >Join Squar</a
                    >
                </nav>

                <div
                    class="text-[10px] uppercase tracking-[0.2em] text-muted/40 font-bold"
                >
                    © {new Date().getFullYear()} Squar.me — Built for the open web.
                </div>
            </div>
        </div>
    </Container>
</footer>
