<script lang="ts">
    interface Props {
        title?: string;
        description?: string;
        ogTitle?: string;
        ogDescription?: string;
        ogImage?: string;
    }

    let {
        title = "Squar",
        description = "Your page, your way.",
        ogTitle = title,
        ogDescription = description,
        ogImage,
    }: Props = $props();

    const fullTitle = $derived(title === "Squar" ? title : `${title} | Squar`);
</script>

<svelte:head>
    <title>{fullTitle}</title>
    {#if description}
        <meta name="description" content={description} />
    {/if}
    {#if ogTitle}
        <meta property="og:title" content={ogTitle} />
    {/if}
    {#if ogDescription}
        <meta property="og:description" content={ogDescription} />
    {/if}
    {#if ogImage}
        <meta property="og:image" content={ogImage} />
    {/if}
</svelte:head>
