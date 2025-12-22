<script lang="ts">
	import PublicBlock from '$lib/components/public/PublicBlock.svelte';
	import ProfilePhotoDisplay from '$lib/components/public/ProfilePhotoDisplay.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const GRID_COLS = 12;

	// Calculate grid rows dynamically based on content
	const maxRow = $derived(
		data.page.layout.length > 0
			? Math.max(...data.page.layout.map(b => b.y + b.h))
			: 0
	);
	const GRID_ROWS = $derived(Math.max(1, maxRow));

	// Default to light if theme is missing or object (legacy)
	const themeName = $derived(typeof data.page.settings.theme === 'string' ? data.page.settings.theme : 'light');
</script>

<svelte:head>
	<title>{data.page.settings.title}</title>
	{#if data.page.settings.description}
		<meta name="description" content={data.page.settings.description} />
	{/if}
	{#if data.page.settings.seo?.metaTitle}
		<meta property="og:title" content={data.page.settings.seo.metaTitle} />
	{/if}
	{#if data.page.settings.seo?.metaDescription}
		<meta property="og:description" content={data.page.settings.seo.metaDescription} />
	{/if}
	{#if data.page.settings.seo?.ogImage}
		<meta property="og:image" content={data.page.settings.seo.ogImage} />
	{/if}
</svelte:head>

<div class="min-h-screen w-full p-4 theme-{themeName} bg-background text-text transition-colors">
	<div class="max-w-6xl mx-auto">
		<!-- Header with Photo & Title (aligned based on position) -->
		<header class="mb-4 flex {data.page.settings.profilePhoto?.position === 'left' ? 'justify-start' : data.page.settings.profilePhoto?.position === 'right' ? 'justify-end' : 'justify-center'}">
			<div class="flex flex-col items-center gap-4">
				<!-- Profile Photo -->
				{#if data.page.settings.profilePhoto?.visibility !== 'hidden'}
					<ProfilePhotoDisplay settings={data.page.settings} />
				{/if}

				<!-- Title & Description -->
				<div class="text-center">
					<h1 class="text-4xl md:text-5xl font-bold mb-2">
						{data.page.settings.title}
					</h1>
					{#if data.page.settings.description}
						<p class="text-lg text-muted">
							{data.page.settings.description}
						</p>
					{/if}
				</div>
			</div>
		</header>

		<div
			class="relative"
			style="display: grid; grid-template-columns: repeat({GRID_COLS}, 1fr); grid-template-rows: repeat({GRID_ROWS}, 40px); gap: 8px;"
		>
			{#each data.page.layout as block (block.id)}
				<PublicBlock {block} />
			{/each}
		</div>
	</div>
</div>
