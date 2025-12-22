<script lang="ts">
	import { untrack } from 'svelte';
	import GridCanvas from '$lib/components/unified/GridCanvas.svelte';
	import PageHeader from '$lib/components/unified/PageHeader.svelte';
	import EditorToolbar from '$lib/components/editor/EditorToolbar.svelte';
	import AddLinkDialog from '$lib/components/editor/AddLinkDialog.svelte';
	import ProfilePhotoModal from '$lib/components/editor/ProfilePhotoModal.svelte';
	import { HistoryManager } from '$lib/stores/history.svelte';
	import { nanoid } from 'nanoid';
	import type { Block, PageSettings } from '$lib/types/models';
	import type { PageData } from './$types';
	import logo from '$lib/assets/images/logos/logo.png';

	let { data }: { data: PageData } = $props();

	// Mode preview (cache temporairement les contrôles)
	let previewMode = $state(false);

	// Mode édition dérivé
	const editable = $derived(data.isOwner && !previewMode);

	// État d'édition (uniquement si isOwner)
	let layout = $state<Block[]>(untrack(() => data.page.layout || []));
	let history: HistoryManager | null = data.isOwner
		? new HistoryManager(untrack(() => layout))
		: null;

	let title = $state(untrack(() => data.page.settings.title));
	let theme = $state<PageSettings['theme']>(
		untrack(() => data.page.settings.theme || 'light')
	);
	let profilePhoto = $state(
		untrack(
			() =>
				data.page.settings.profilePhoto || {
					position: 'center' as const,
					size: 'medium' as const,
					shape: 'circle' as const,
					visibility: 'letter' as const
				}
		)
	);
	let slug = $state(untrack(() => data.page.slug));
	let published = $state(untrack(() => data.page.published));

	// États d'UI (uniquement si isOwner)
	let saving = $state(false);
	let autoSaving = $state(false);
	let uploading = $state(false);
	let lastSaved = $state<Date | null>(null);

	// Modal states
	let showAddLinkDialog = $state(false);
	let showProfilePhotoModal = $state(false);

	let lastPageId = $state(untrack(() => data.page.id));

	let autoSaveTimeout: ReturnType<typeof setTimeout>;

	// Sync when page data changes
	$effect(() => {
		if (data.page.id !== lastPageId) {
			lastPageId = data.page.id;
			layout = data.page.layout || [];
			title = data.page.settings.title;
			theme = data.page.settings.theme || 'light';
			slug = data.page.slug;
			published = data.page.published;
			profilePhoto =
				data.page.settings.profilePhoto ||
				({
					position: 'center',
					size: 'medium',
					shape: 'circle',
					visibility: 'letter'
				} as const);
			if (history) {
				history.reset(layout);
			}
		}
	});

	// Handlers
	function updateLayout(newBlocks: Block[]) {
		layout = newBlocks;
		if (history) {
			history.push(newBlocks);
		}
	}

	function addBlock(type: 'text' | 'link' | 'image' | 'video' | 'heading', blockData: any = {}) {
		const newBlock: Block = {
			id: nanoid(),
			type,
			x: 0,
			y: layout.length > 0 ? Math.max(...layout.map((b) => b.y + b.h)) : 0,
			w: type === 'heading' ? 12 : type === 'text' ? 6 : type === 'video' ? 6 : 4,
			h: type === 'heading' ? 2 : type === 'text' ? 3 : type === 'video' ? 4 : 2,
			data: blockData
		};
		updateLayout([...layout, newBlock]);
	}

	function handleAddLink(
		url: string,
		linkTitle: string,
		iconSvg?: string,
		iconHex?: string,
		socialData?: any
	) {
		addBlock('link', { url, title: linkTitle, iconSvg, iconHex, socialData });
	}

	function handleUndo() {
		const previousState = history?.undo();
		if (previousState) {
			layout = previousState;
		}
	}

	function handleRedo() {
		const nextState = history?.redo();
		if (nextState) {
			layout = nextState;
		}
	}

	function handleSettingsUpdate(newSettings: PageSettings) {
		title = newSettings.title;
		theme = newSettings.theme;
	}

	// Profile photo handlers
	async function handlePhotoUpload(file: File) {
		uploading = true;
		try {
			const formData = new FormData();
			formData.append('file', file);
			if (profilePhoto.filename) {
				formData.append('oldFilename', profilePhoto.filename);
			}

			const response = await fetch('/api/upload/profile-photo', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				throw new Error('Upload failed');
			}

			const { url, filename } = await response.json();

			profilePhoto = {
				...profilePhoto,
				url,
				filename,
				visibility: 'photo'
			};
		} catch (err) {
			console.error('Upload error:', err);
			alert('Failed to upload photo');
		} finally {
			uploading = false;
		}
	}

	async function handlePhotoRemove() {
		if (!profilePhoto.filename) return;

		try {
			await fetch('/api/upload/profile-photo', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ filename: profilePhoto.filename })
			});
		} catch (err) {
			console.error('Delete error:', err);
		}

		profilePhoto = {
			position: profilePhoto.position,
			size: profilePhoto.size,
			shape: profilePhoto.shape,
			visibility: 'letter'
		};
	}

	// Auto-save (uniquement si isOwner)
	$effect(() => {
		if (!data.isOwner || previewMode) return;

		const hasLayoutChanged = layout !== data.page.layout;
		const hasTitleChanged = title !== data.page.settings.title;
		const hasThemeChanged = theme !== (data.page.settings.theme || 'light');
		const hasSlugChanged = slug !== data.page.slug;
		const hasProfilePhotoChanged =
			JSON.stringify(profilePhoto) !== JSON.stringify(data.page.settings.profilePhoto);

		if (
			!hasLayoutChanged &&
			!hasTitleChanged &&
			!hasSlugChanged &&
			!hasThemeChanged &&
			!hasProfilePhotoChanged
		)
			return;

		clearTimeout(autoSaveTimeout);
		autoSaveTimeout = setTimeout(() => {
			autoSave();
		}, 2000); // 2 second debounce
	});

	async function autoSave() {
		// Validate slug before saving
		if (slug && slug.length >= 3 && /^[a-z0-9-]+$/.test(slug)) {
			autoSaving = true;
			try {
				const response = await fetch(`/api/pages/${data.page.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						slug,
						settings: {
							...data.page.settings,
							title,
							theme,
							profilePhoto
						},
						layout
					})
				});

				if (response.ok) {
					data.page.slug = slug;
					data.page.settings.title = title;
					data.page.settings.theme = theme;
					data.page.settings.profilePhoto = profilePhoto;
					lastSaved = new Date();
				}
			} catch (e) {
				console.error('Auto-save failed:', e);
			} finally {
				autoSaving = false;
			}
		}
	}

	async function handlePublish() {
		saving = true;
		try {
			await fetch(`/api/pages/${data.page.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					published: !published
				})
			});
			published = !published;
		} catch (e) {
			alert('Failed to publish');
		} finally {
			saving = false;
		}
	}

	async function handleSlugChange(
		newSlug: string
	): Promise<{ success: boolean; error?: string }> {
		try {
			const response = await fetch(`/api/pages/${data.page.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					slug: newSlug
				})
			});

			if (!response.ok) {
				if (response.status === 409) {
					return { success: false, error: 'This username is already taken' };
				}
				return { success: false, error: 'Failed to update username' };
			}

			slug = newSlug;
			data.page.slug = newSlug;
			return { success: true };
		} catch (e) {
			return { success: false, error: 'Failed to update username' };
		}
	}

	// Default to light if theme is missing or object (legacy)
	const themeName = $derived(typeof theme === 'string' ? theme : 'light');
</script>

<svelte:head>
	<title>{title}</title>
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

<!-- Subtle Branding (only in edit mode) -->
{#if data.isOwner && !previewMode}
	<div class="fixed bottom-6 left-6 z-40 hidden sm:block">
		<a
			href="/"
			class="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity"
		>
			<img src={logo} alt="Squar Logo" class="w-6 h-6 object-contain" />
			<span class="font-bold text-xs tracking-tight">SQUAR</span>
		</a>
	</div>
{/if}

<div
	class="min-h-screen w-full p-4 theme-{themeName} bg-background text-text transition-colors"
>
	<div class="max-w-6xl mx-auto">
		<PageHeader
			{editable}
			bind:title
			bind:profilePhoto
			username={slug}
			userEmail={data.user?.email}
			onTitleUpdate={(t) => (title = t)}
			onPhotoClick={() => (showProfilePhotoModal = true)}
		/>

		<GridCanvas blocks={layout} {editable} onUpdate={editable ? updateLayout : undefined} />
	</div>
</div>

{#if data.isOwner}
	<AddLinkDialog
		bind:open={showAddLinkDialog}
		onClose={() => (showAddLinkDialog = false)}
		onAdd={handleAddLink}
	/>

	<ProfilePhotoModal
		bind:open={showProfilePhotoModal}
		profilePhoto={profilePhoto}
		onClose={() => (showProfilePhotoModal = false)}
		onUpdate={(p) => (profilePhoto = p)}
		onUpload={handlePhotoUpload}
		onRemove={handlePhotoRemove}
		{uploading}
	/>

	<EditorToolbar
		onAddHeading={() => addBlock('heading')}
		onAddText={() => addBlock('text')}
		onAddLink={() => (showAddLinkDialog = true)}
		onAddImage={() => addBlock('image')}
		onAddVideo={() => addBlock('video')}
		onUndo={handleUndo}
		onRedo={handleRedo}
		onPublish={handlePublish}
		onSlugChange={handleSlugChange}
		onPreviewToggle={() => (previewMode = !previewMode)}
		pageSettings={{ ...data.page.settings, title, theme }}
		onSettingsUpdate={handleSettingsUpdate}
		canUndo={history?.canUndo ?? false}
		canRedo={history?.canRedo ?? false}
		{saving}
		{autoSaving}
		{published}
		previewMode={previewMode}
		viewUrl={published ? `/${slug}` : undefined}
		username={slug}
		userEmail={data.user?.email || ''}
	/>
{/if}
