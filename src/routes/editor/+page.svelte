<script lang="ts">
    import { Input } from "$lib/components/ui";
    import { Container } from "$lib/components/layout";
    import GridEditor from "$lib/components/editor/GridEditor.svelte";
    import EditorToolbar from "$lib/components/editor/EditorToolbar.svelte";
    import AddLinkDialog from "$lib/components/editor/AddLinkDialog.svelte";
    import type { Block } from "$lib/types/models";
    import { HistoryManager } from "$lib/stores/history.svelte";
    import { nanoid } from "nanoid";

    let { data } = $props();

    let layout = $state<Block[]>(data.page.layout || []);
    let history: HistoryManager = new HistoryManager(layout);
    let canUndo = $derived(history?.canUndo ?? false);
    let canRedo = $derived(history?.canRedo ?? false);
    let isUndoRedoing = false;
    let showAddLinkDialog = $state(false);

    let title = $state(data.page.settings.title);
    let slug = $state(data.page.slug);
    let published = $state(data.page.published);
    let saving = $state(false);
    let autoSaving = $state(false);
    let lastSaved = $state<Date | null>(null);
    let slugError = $state("");

    let autoSaveTimeout: ReturnType<typeof setTimeout>;

    function updateLayout(newBlocks: Block[]) {
        layout = newBlocks;
        if (!isUndoRedoing) {
            history?.push(newBlocks);
        }
    }

    function addBlock(type: 'text' | 'link' | 'image', data: any = {}) {
        const newBlock: Block = {
            id: nanoid(),
            type,
            x: 0,
            y: layout.length > 0 ? Math.max(...layout.map((b) => b.y + b.h)) : 0,
            w: type === 'text' ? 6 : 4,
            h: type === 'text' ? 3 : 2,
            data
        };
        updateLayout([...layout, newBlock]);
    }

    function handleAddLink(url: string, title: string, iconSvg?: string, iconHex?: string) {
        addBlock('link', { url, title, iconSvg, iconHex });
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

    // Auto-save when layout, title, or slug changes
    $effect(() => {
        // Skip initial run
        const hasLayoutChanged = layout !== data.page.layout;
        const hasTitleChanged = title !== data.page.settings.title;
        const hasSlugChanged = slug !== data.page.slug;

        if (!hasLayoutChanged && !hasTitleChanged && !hasSlugChanged) return;

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
                        },
                        layout,
                    }),
                });

                if (response.ok) {
                    // Update local data on success
                    data.page.slug = slug;
                    data.page.settings.title = title;
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
</script>

<Container class="py-4">
    <div class="max-w-4xl mx-auto space-y-4">
        <!-- Page settings -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-text mb-2"
                    >Page Title</label
                >
                <Input
                    value={title}
                    oninput={(e) => (title = e.currentTarget.value)}
                    placeholder="My Awesome Page"
                />
            </div>

            <div>
                <div class="flex items-center justify-between mb-2">
                    <label class="text-sm font-medium text-text"
                        >Username (URL)</label
                    >
                    <span class="text-xs text-muted">
                        Lowercase letters, numbers, and hyphens only
                    </span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-muted whitespace-nowrap"
                        >squar.me/</span
                    >
                    <Input
                        value={slug}
                        oninput={(e) => {
                            slug = e.currentTarget.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]/g, "");
                            e.currentTarget.value = slug;
                            slugError = "";
                        }}
                        error={slugError}
                        placeholder="yourname"
                        class="flex-1"
                    />
                </div>
                {#if slugError}
                    <p class="text-xs text-destructive mt-1">{slugError}</p>
                {/if}
            </div>
        </div>

        <GridEditor
            blocks={layout}
            onUpdate={updateLayout}
        />
    </div>
</Container>

<AddLinkDialog
    bind:open={showAddLinkDialog}
    onClose={() => (showAddLinkDialog = false)}
    onAdd={handleAddLink}
/>

<EditorToolbar
    onAddText={() => addBlock('text')}
    onAddLink={() => (showAddLinkDialog = true)}
    onAddImage={() => addBlock('image')}
    onUndo={handleUndo}
    onRedo={handleRedo}
    onPublish={handlePublish}
    {canUndo}
    {canRedo}
    {saving}
    {autoSaving}
    {published}
    viewUrl={published ? `/${slug}` : undefined}
/>
