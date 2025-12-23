<script lang="ts">
    import "../app.css";
    import "$lib/i18n";
    import { isLoading } from "svelte-i18n";
    import favicon from "$lib/assets/favicon.png";
    import { Header, Footer } from "$lib/components/layout";
    import { page } from "$app/stores";

    let { children } = $props();

    // Routes système connues
    const knownRoutes = ['/', '/login', '/signup', '/editor'];

    // Détecte si c'est une page slug (/{slug})
    const isSlugPage = $derived(
        !knownRoutes.includes($page.url.pathname) &&
        !$page.url.pathname.startsWith('/api/') &&
        $page.url.pathname.split('/').filter(Boolean).length === 1
    );

    // Pas de header sur les pages slug et l'éditeur
    // Pas de footer sur l'éditeur ni sur les pages slug
    let showHeader = $derived(!isSlugPage && !$page.url.pathname.startsWith('/editor'));
    let showFooter = $derived(!$page.url.pathname.startsWith('/editor') && !isSlugPage);
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

{#if $isLoading}
    <div class="flex items-center justify-center min-h-screen bg-background text-text">
        Loading...
    </div>
{:else}
<div class="min-h-screen flex flex-col">
    {#if showHeader}
        <Header />
    {/if}

    <main class="flex-grow">
        {@render children()}
    </main>

    {#if showFooter}
        <Footer />
    {/if}
</div>
{/if}