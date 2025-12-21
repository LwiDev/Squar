<script lang="ts">
    import { Input, Modal, Button } from "$lib/components/ui";
    import { Container } from "$lib/components/layout";
    import PageHead from "$lib/components/PageHead.svelte";
    import GridEditor from "$lib/components/editor/GridEditor.svelte";
    import EditorToolbar from "$lib/components/editor/EditorToolbar.svelte";
    import AddLinkDialog from "$lib/components/editor/AddLinkDialog.svelte";
    import type { Block, PageSettings } from "$lib/types/models";
    import { HistoryManager } from "$lib/stores/history.svelte";
    import { nanoid } from "nanoid";
    import { untrack } from "svelte";
    import logo from "$lib/assets/images/logos/logo.png";

    let { data } = $props();

    let layout = $state<Block[]>(untrack(() => data.page.layout || []));
    let history: HistoryManager = new HistoryManager(untrack(() => layout));
    let canUndo = $derived(history?.canUndo ?? false);
    let canRedo = $derived(history?.canRedo ?? false);
    let isUndoRedoing = false;
    let showAddLinkDialog = $state(false);

    let title = $state(untrack(() => data.page.settings.title));
    let theme = $state<PageSettings['theme']>(untrack(() => data.page.settings.theme || 'light'));
    let slug = $state(untrack(() => data.page.slug));
    let published = $state(untrack(() => data.page.published));
    let saving = $state(false);
    let autoSaving = $state(false);
    let lastSaved = $state<Date | null>(null);
    let slugError = $state("");

    let showChooseUsernameModal = $state(false);
    let initialSlug = $state("");
    let initialSlugError = $state("");
    let savingInitialSlug = $state(false);
    
    let lastPageId = $state(untrack(() => data.page.id));

    let autoSaveTimeout: ReturnType<typeof setTimeout>;

    function updateLayout(newBlocks: Block[]) {
        layout = newBlocks;
        if (!isUndoRedoing) {
            history?.push(newBlocks);
        }
    }
    
    $effect(() => {
        if (data.page.id !== lastPageId) {
            lastPageId = data.page.id;
            layout = data.page.layout || [];
            title = data.page.settings.title;
            theme = data.page.settings.theme || 'light';
            slug = data.page.slug;
            published = data.page.published;
            history.reset(layout);
        }
    });

    function addBlock(type: 'text' | 'link' | 'image' | 'video' | 'heading', data: any = {}) {
        const newBlock: Block = {
            id: nanoid(),
            type,
            x: 0,
            y: layout.length > 0 ? Math.max(...layout.map((b) => b.y + b.h)) : 0,
            w: type === 'heading' ? 12 : type === 'text' ? 6 : type === 'video' ? 6 : 4,
            h: type === 'heading' ? 2 : type === 'text' ? 3 : type === 'video' ? 4 : 2,
            data
        };
        updateLayout([...layout, newBlock]);
    }

    function handleAddLink(url: string, title: string, iconSvg?: string, iconHex?: string, socialData?: any) {
        addBlock('link', { url, title, iconSvg, iconHex, socialData });
    }

    function handleUndo() {
        const previousState = history?.undo();
        if (previousState) {
            isUndoRedoing = true;
            layout = previousState;
            setTimeout(() => {
                isUndoRedoing = false;
            }, 0);
        }
    }

    function handleRedo() {
        const nextState = history?.redo();
        if (nextState) {
            isUndoRedoing = true;
            layout = nextState;
            setTimeout(() => {
                isUndoRedoing = false;
            }, 0);
        }
    }

    function handleSettingsUpdate(newSettings: PageSettings) {
        title = newSettings.title;
        theme = newSettings.theme;
    }

    // Auto-save when layout, title, slug, or theme changes
    $effect(() => {
        // Skip initial run
        const hasLayoutChanged = layout !== data.page.layout;
        const hasTitleChanged = title !== data.page.settings.title;
        const hasThemeChanged = theme !== (data.page.settings.theme || 'light');
        const hasSlugChanged = slug !== data.page.slug;

        if (!hasLayoutChanged && !hasTitleChanged && !hasSlugChanged && !hasThemeChanged) return;

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
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        slug,
                        settings: {
                            ...data.page.settings,
                            title,
                            theme,
                        },
                        layout,
                    }),
                });

                if (response.ok) {
                    // Update local data on success
                    data.page.slug = slug;
                    data.page.settings.title = title;
                    data.page.settings.theme = theme;
                    lastSaved = new Date();
                    slugError = "";
                } else if (response.status === 409) {
                    slugError = "This username is already taken";
                }
            } catch (e) {
                console.error("Auto-save failed:", e);
            } finally {
                autoSaving = false;
            }
        }
    }

    async function handleSave() {
        slugError = "";

        // Validate slug
        if (!slug || slug.length < 3) {
            slugError = "Username must be at least 3 characters";
            return;
        }

        if (!/^[a-z0-9-]+$/.test(slug)) {
            slugError =
                "Username can only contain lowercase letters, numbers, and hyphens";
            return;
        }

        saving = true;
        try {
            const response = await fetch(`/api/pages/${data.page.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug,
                    settings: {
                        ...data.page.settings,
                        title,
                        theme,
                    },
                    layout,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                if (response.status === 409) {
                    slugError = "This username is already taken";
                } else {
                    alert("Failed to save");
                }
                return;
            }

            // Update local data on success
            data.page.slug = slug;
            lastSaved = new Date();
        } catch (e) {
            alert("Failed to save");
        } finally {
            saving = false;
        }
    }

    async function handlePublish() {
        // Check if slug is valid
        if (!slug || slug.length < 3 || !/^[a-z0-9-]+$/.test(slug)) {
            // No valid slug, ask user to choose one
            initialSlug = slug || "";
            initialSlugError = "";
            showChooseUsernameModal = true;
            return;
        }

        // Valid slug, publish normally
        saving = true;
        try {
            await fetch(`/api/pages/${data.page.id}`, {
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

    async function handleChooseUsername() {
        initialSlugError = "";

        // Validate slug
        if (!initialSlug || initialSlug.length < 3) {
            initialSlugError = "Username must be at least 3 characters";
            return;
        }

        if (!/^[a-z0-9-]+$/.test(initialSlug)) {
            initialSlugError = "Username can only contain lowercase letters, numbers, and hyphens";
            return;
        }

        savingInitialSlug = true;
        try {
            const response = await fetch(`/api/pages/${data.page.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug: initialSlug,
                    published: true, // Publish automatically after choosing slug
                }),
            });

            if (!response.ok) {
                if (response.status === 409) {
                    initialSlugError = "This username is already taken";
                } else {
                    initialSlugError = "Failed to save username";
                }
                return;
            }

            // Update local state
            slug = initialSlug;
            data.page.slug = initialSlug;
            published = true;
            showChooseUsernameModal = false;
        } catch (e) {
            initialSlugError = "Failed to save username";
        } finally {
            savingInitialSlug = false;
        }
    }

    async function handleSlugChange(newSlug: string): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(`/api/pages/${data.page.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug: newSlug,
                }),
            });

            if (!response.ok) {
                if (response.status === 409) {
                    return { success: false, error: "This username is already taken" };
                }
                return { success: false, error: "Failed to update username" };
            }

            // Update local state on success
            slug = newSlug;
            data.page.slug = newSlug;
            return { success: true };
        } catch (e) {
            return { success: false, error: "Failed to update username" };
        }
    }
</script>

<PageHead
    title="Editor"
    description="Design and customize your page"
/>

<!-- Subtle Branding -->
<div class="fixed bottom-6 left-6 z-40 hidden sm:block">
    <a href="/" class="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
        <img src={logo} alt="Squar Logo" class="w-6 h-6 object-contain" />
        <span class="font-bold text-xs tracking-tight">SQUAR</span>
    </a>
</div>

<Container class="py-4">
    <div class="max-w-4xl mx-auto space-y-4">
        <!-- Editor Canvas with Theme -->
        <div class="theme-{theme} rounded-lg bg-background text-text transition-colors p-4 min-h-[50vh] shadow-sm border border-border/50">
            <GridEditor
                blocks={layout}
                onUpdate={updateLayout}
            />
        </div>
    </div>
</Container>

<AddLinkDialog
    bind:open={showAddLinkDialog}
    onClose={() => (showAddLinkDialog = false)}
    onAdd={handleAddLink}
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
    pageSettings={{ ...data.page.settings, title, theme }}
    onSettingsUpdate={handleSettingsUpdate}
    {canUndo}
    {canRedo}
    {saving}
    {autoSaving}
    {published}
    viewUrl={published ? `/${slug}` : undefined}
    username={slug}
    userEmail={data.user.email}
/>

<Modal
    bind:open={showChooseUsernameModal}
    onClose={() => (showChooseUsernameModal = false)}
    title="Choose your username"
>
    <div class="space-y-4">
        <p class="text-sm text-muted">
            Choose a username to publish your page. This will be your public URL.
        </p>
        <div>
            <label
                for="initial-slug-input"
                class="block text-sm font-medium text-text mb-2"
            >
                Username
            </label>
            <div class="flex items-center gap-2">
                <span class="text-sm text-muted whitespace-nowrap"
                    >squar.me/</span
                >
                <Input
                    id="initial-slug-input"
                    bind:value={initialSlug}
                    oninput={(e) => {
                        initialSlug = e.currentTarget.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "");
                        e.currentTarget.value = initialSlug;
                        initialSlugError = "";
                    }}
                    onkeydown={(e) => {
                        if (e.key === "Enter" && !savingInitialSlug) {
                            handleChooseUsername();
                        }
                    }}
                    error={initialSlugError}
                    placeholder="yourname"
                    class="flex-1"
                />
            </div>
            {#if initialSlugError}
                <p class="text-xs text-destructive mt-1">{initialSlugError}</p>
            {/if}
            <p class="text-xs text-muted mt-2">
                Lowercase letters, numbers, and hyphens only. Minimum 3
                characters.
            </p>
        </div>

        <div class="flex justify-end gap-2">
            <Button
                variant="secondary"
                onclick={() => (showChooseUsernameModal = false)}
                disabled={savingInitialSlug}
            >
                Cancel
            </Button>
            <Button
                variant="primary"
                onclick={handleChooseUsername}
                disabled={savingInitialSlug || !initialSlug}
            >
                {savingInitialSlug ? "Publishing..." : "Publish"}
            </Button>
        </div>
    </div>
</Modal>
