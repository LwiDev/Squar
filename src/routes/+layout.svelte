<script lang="ts">
    import "../app.css";
    import favicon from "$lib/assets/favicon.png";
    import { Header, Footer } from "$lib/components/layout";
    import { page } from "$app/stores";

    let { children } = $props();

    // On ne veut pas de footer sur l'éditeur
    let showFooter = $derived(!$page.url.pathname.startsWith('/editor'));
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen flex flex-col">
    <Header />
    
    <main class="flex-grow">
        {@render children()}
    </main>

    {#if showFooter}
        <Footer />
    {/if}
</div>