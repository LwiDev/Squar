<script lang="ts">
    import { goto } from "$app/navigation";
    import logo from "$lib/assets/images/logos/logo.png";
    import { Container } from "$lib/components/layout";
    import { PUBLIC_GITHUB_URL } from "$env/static/public";
    import { t } from "svelte-i18n";
    import { LanguageSwitcher } from "$lib/components/ui";
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
                        class="w-6 h-auto"
                    />
                    <h1 class="text-base font-bold tracking-tight uppercase">
                        {$t('common.squar')}
                    </h1>
                </div>
                <p
                    class="text-sm text-muted max-w-[200px] text-center md:text-left leading-relaxed"
                >
                    {$t('landing.footer.tagline')}
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
                        class="hover:text-text transition-colors">{$t('common.github')}</a
                    >
                    <a href="/signup" class="hover:text-text transition-colors"
                        >{$t('common.join_squar')}</a
                    >
                    <LanguageSwitcher />
                </nav>

                <div
                    class="text-[10px] uppercase tracking-[0.2em] text-muted/60 font-bold"
                >
                    © {new Date().getFullYear()} Squar — {$t('landing.footer.rights')}
                </div>
            </div>
        </div>
    </Container>
</footer>
