<script lang="ts">
    import { untrack } from "svelte";
    import GridCanvas from "$lib/components/unified/GridCanvas.svelte";
    import PageHeader from "$lib/components/unified/PageHeader.svelte";
    import EditorToolbar from "$lib/components/editor/EditorToolbar.svelte";
    import AddLinkDialog from "$lib/components/editor/AddLinkDialog.svelte";
    import ProfilePhotoModal from "$lib/components/editor/ProfilePhotoModal.svelte";
    import TitleSettingsModal from "$lib/components/editor/TitleSettingsModal.svelte";
    import { HistoryManager } from "$lib/stores/history.svelte";
    import { nanoid } from "nanoid";
    import type { Block, PageSettings } from "$lib/types/models";
    import type { PageData } from "./$types";
    import { DEFAULT_BLOCK_SIZE } from "$lib/constants/blockSizes";
    import logo from "$lib/assets/images/logos/logo.png";

    let { data }: { data: PageData } = $props();
    const { page, isOwner, user } = $derived(data);

    // Mode preview (cache temporairement les contrôles)
    let previewMode = $state(false);

    // Mode édition dérivé
    const editable = $derived(isOwner && !previewMode);

    // État d'édition (uniquement si isOwner)
    let layout = $state<Block[]>(untrack(() => page.layout || []));
    let history: HistoryManager | null = untrack(() => isOwner)
        ? new HistoryManager(untrack(() => layout))
        : null;

    let title = $state(untrack(() => page.settings.title));
    let description = $state(untrack(() => page.settings.description || ""));
    let theme = $state<PageSettings["theme"]>(
        untrack(() => page.settings.theme || "light"),
    );
    let profilePhoto = $state(
        untrack(
            () =>
                page.settings.profilePhoto || {
                    position: "center" as const,
                    size: "medium" as const,
                    shape: "circle" as const,
                    visibility: "letter" as const,
                },
        ),
    );
    let titleSize = $state(untrack(() => page.settings.titleSize || "medium"));
    let slug = $state(untrack(() => page.slug));
    let published = $state(untrack(() => page.published));

    // États d'UI (uniquement si isOwner)
    let saving = $state(false);
    let autoSaving = $state(false);
    let uploading = $state(false);
    let lastSaved = $state<Date | null>(null);

    // Modal states
    let showAddLinkDialog = $state(false);
    let showProfilePhotoModal = $state(false);
    let showTitleSettingsModal = $state(false);

    let lastPageId = $state(untrack(() => page.id));

    let autoSaveTimeout: ReturnType<typeof setTimeout>;

    // Sync when page data changes
    $effect(() => {
        if (page.id !== lastPageId) {
            lastPageId = page.id;
            layout = page.layout || [];
            title = page.settings.title;
            theme = page.settings.theme || "light";
            slug = page.slug;
            published = page.published;
            profilePhoto =
                page.settings.profilePhoto ||
                ({
                    position: "center",
                    size: "medium",
                    shape: "circle",
                    visibility: "letter",
                } as const);
            titleSize = page.settings.titleSize || "medium";
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

    function addBlock(
        type: "text" | "link" | "image" | "video" | "heading",
        blockData: any = {},
    ) {
        const newBlock: Block = {
            id: nanoid(),
            type,
            x: 0,
            y:
                layout.length > 0
                    ? Math.max(...layout.map((b) => b.y + b.h))
                    : 0,
            w: DEFAULT_BLOCK_SIZE[type].w,
            h: DEFAULT_BLOCK_SIZE[type].h,
            data: blockData,
        };
        updateLayout([...layout, newBlock]);
    }

    function handleAddLink(
        url: string,
        linkTitle: string,
        iconSvg?: string,
        iconHex?: string,
        socialData?: any,
    ) {
        addBlock("link", {
            url,
            title: linkTitle,
            iconSvg,
            iconHex,
            socialData,
        });
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
            formData.append("file", file);
            if (profilePhoto.filename) {
                formData.append("oldFilename", profilePhoto.filename);
            }

            const response = await fetch("/api/upload/profile-photo", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                // Try to get error message from response
                let errorMsg = "Upload failed";
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch {
                    // If response is not JSON, use status text
                    errorMsg = response.statusText || errorMsg;
                }
                throw new Error(errorMsg);
            }

            const { url, filename } = await response.json();

            profilePhoto = {
                ...profilePhoto,
                url,
                filename,
                visibility: "photo",
            };
        } catch (err) {
            console.error("Upload error:", err);
            const errorMessage =
                err instanceof Error ? err.message : "Failed to upload photo";
            alert(`Failed to upload photo: ${errorMessage}`);
        } finally {
            uploading = false;
        }
    }

    async function handlePhotoRemove() {
        if (!profilePhoto.filename) return;

        try {
            await fetch("/api/upload/profile-photo", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename: profilePhoto.filename }),
            });
        } catch (err) {
            console.error("Delete error:", err);
        }

        profilePhoto = {
            position: profilePhoto.position,
            size: profilePhoto.size,
            shape: profilePhoto.shape,
            visibility: "letter",
        };
    }

    // Auto-save (uniquement si isOwner)
    $effect(() => {
        if (!isOwner || previewMode) return;

        const hasLayoutChanged = layout !== page.layout;
        const hasTitleChanged = title !== page.settings.title;
        const hasDescriptionChanged =
            description !== (page.settings.description || "");
        const hasThemeChanged = theme !== (page.settings.theme || "light");
        const hasSlugChanged = slug !== page.slug;
        const hasProfilePhotoChanged =
            JSON.stringify(profilePhoto) !==
            JSON.stringify(page.settings.profilePhoto);
        const hasTitleSizeChanged =
            titleSize !== (page.settings.titleSize || "medium");

        if (
            !hasLayoutChanged &&
            !hasTitleChanged &&
            !hasDescriptionChanged &&
            !hasSlugChanged &&
            !hasThemeChanged &&
            !hasProfilePhotoChanged &&
            !hasTitleSizeChanged
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
                const response = await fetch(`/api/pages/${page.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        slug,
                        settings: {
                            ...page.settings,
                            title,
                            description,
                            theme,
                            profilePhoto,
                            titleSize,
                        },
                        layout,
                    }),
                });

                if (response.ok) {
                    page.slug = slug;
                    page.settings.title = title;
                    page.settings.description = description;
                    page.settings.theme = theme;
                    page.settings.profilePhoto = profilePhoto;
                    page.settings.titleSize = titleSize;
                    lastSaved = new Date();
                }
            } catch (e) {
                console.error("Auto-save failed:", e);
            } finally {
                autoSaving = false;
            }
        }
    }

    async function handlePublish() {
        saving = true;
        try {
            await fetch(`/api/pages/${page.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    published: !published,
                }),
            });
            published = !published;
        } catch (e) {
            alert("Failed to publish");
        } finally {
            saving = false;
        }
    }

    async function handleSlugChange(
        newSlug: string,
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(`/api/pages/${page.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug: newSlug,
                }),
            });

            if (!response.ok) {
                if (response.status === 409) {
                    return {
                        success: false,
                        error: "This username is already taken",
                    };
                }
                return { success: false, error: "Failed to update username" };
            }

            slug = newSlug;
            page.slug = newSlug;
            return { success: true };
        } catch (e) {
            return { success: false, error: "Failed to update username" };
        }
    }

    // Default to light if theme is missing or object (legacy)
    const themeName = $derived(typeof theme === "string" ? theme : "light");

    // Derive layout configuration
    const layoutConfig = $derived.by(() => {
        const position = profilePhoto.position;
        const isSidebar = position === "left" || position === "right";

        if (position === "left") {
            return {
                isSidebar: true,
                container:
                    "max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 lg:gap-12 mb-12",
                profileWrapper: "lg:sticky lg:top-8 lg:self-start",
                // Mobile: Profile first (default order)
                contentWrapper: "min-h-[200px]",
            };
        } else if (position === "right") {
            return {
                isSidebar: true,
                container:
                    "max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 lg:gap-12 mb-12",
                // Mobile: Profile first (order-1), Content second (order-2)
                // Desktop: Profile right (order-2), Content left (order-1)
                profileWrapper:
                    "lg:sticky lg:top-8 lg:self-start order-1 lg:order-2",
                contentWrapper: "min-h-[200px] order-2 lg:order-1",
            };
        } else {
            // Center/Top layout
            return {
                isSidebar: false,
                container: "max-w-6xl mx-auto",
                profileWrapper: "mb-12",
                contentWrapper: "",
            };
        }
    });
</script>

<svelte:head>
    <title>{title}</title>
    {#if page.settings.description}
        <meta name="description" content={page.settings.description} />
    {/if}
    {#if page.settings.seo?.metaTitle}
        <meta property="og:title" content={page.settings.seo.metaTitle} />
    {/if}
    {#if page.settings.seo?.metaDescription}
        <meta
            property="og:description"
            content={page.settings.seo.metaDescription}
        />
    {/if}
    {#if page.settings.seo?.ogImage}
        <meta property="og:image" content={page.settings.seo.ogImage} />
    {/if}
</svelte:head>

<!-- Subtle Branding -->
<div class="fixed bottom-6 left-6 z-40 hidden sm:block">
    <a
        href="/"
        class="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity"
    >
        <img src={logo} alt="Squar Logo" class="w-6 h-6 object-contain" />
        <span class="font-bold text-xs tracking-tight">SQUAR</span>
    </a>
</div>

<div
    class="min-h-screen w-full p-4 theme-{themeName} bg-background text-text transition-colors"
>
    <div class={layoutConfig.container}>
        <!-- Profile Section -->
        <aside class={layoutConfig.profileWrapper}>
            {#if layoutConfig.isSidebar}
                <div
                    class="bg-background border-2 border-border rounded-2xl p-8 shadow-sm"
                >
                    <PageHeader
                        {editable}
                        bind:title
                        bind:profilePhoto
                        bind:description
                        {titleSize}
                        username={slug}
                        userEmail={user?.email}
                        onTitleUpdate={(t) => (title = t)}
                        onDescriptionUpdate={(d) => (description = d)}
                        onPhotoClick={() => (showProfilePhotoModal = true)}
                        onTitleSettingsClick={() =>
                            (showTitleSettingsModal = true)}
                    />
                </div>
            {:else}
                <PageHeader
                    {editable}
                    bind:title
                    bind:profilePhoto
                    bind:description
                    {titleSize}
                    username={slug}
                    userEmail={user?.email}
                    onTitleUpdate={(t) => (title = t)}
                    onDescriptionUpdate={(d) => (description = d)}
                    onPhotoClick={() => (showProfilePhotoModal = true)}
                    onTitleSettingsClick={() => (showTitleSettingsModal = true)}
                />
            {/if}
        </aside>

        <!-- Content Section -->
        <main class={layoutConfig.contentWrapper}>
            <GridCanvas
                blocks={layout}
                {editable}
                onUpdate={editable ? updateLayout : undefined}
            />
        </main>
    </div>
</div>

{#if isOwner}
    <AddLinkDialog
        bind:open={showAddLinkDialog}
        onClose={() => (showAddLinkDialog = false)}
        onAdd={handleAddLink}
    />

    <ProfilePhotoModal
        bind:open={showProfilePhotoModal}
        {profilePhoto}
        onClose={() => (showProfilePhotoModal = false)}
        onUpdate={(p) => (profilePhoto = p)}
        onUpload={handlePhotoUpload}
        onRemove={handlePhotoRemove}
        {uploading}
    />

    <TitleSettingsModal
        bind:open={showTitleSettingsModal}
        {titleSize}
        onClose={() => (showTitleSettingsModal = false)}
        onUpdate={(size) => (titleSize = size)}
    />

    <EditorToolbar
        onAddHeading={() => addBlock("heading")}
        onAddText={() => addBlock("text")}
        onAddLink={() => (showAddLinkDialog = true)}
        onAddImage={() => addBlock("image")}
        onAddVideo={() => addBlock("video")}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onPublish={handlePublish}
        onSlugChange={handleSlugChange}
        onPreviewToggle={() => (previewMode = !previewMode)}
        pageSettings={{ ...page.settings, title, theme }}
        onSettingsUpdate={handleSettingsUpdate}
        canUndo={history?.canUndo ?? false}
        canRedo={history?.canRedo ?? false}
        {saving}
        {autoSaving}
        {published}
        {previewMode}
        viewUrl={published ? `/${slug}` : undefined}
        username={slug}
        userEmail={user?.email || ""}
    />
{/if}
