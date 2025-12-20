<script lang="ts">
    import { Button, Input } from "$lib/components/ui";
    import { Container } from "$lib/components/layout";
    import GridEditor from "$lib/components/editor/GridEditor.svelte";
    import type { Block } from "$lib/types/models";
    import { onMount } from "svelte";

    let { data } = $props();

    let layout = $state<Block[]>(data.page.layout || []);

    let title = $state(data.page.settings.title);
    let slug = $state(data.page.slug);
    let published = $state(data.page.published);
    let saving = $state(false);
    let autoSaving = $state(false);
    let lastSaved = $state<Date | null>(null);
    let slugError = $state("");

    let autoSaveTimeout: ReturnType<typeof setTimeout>;

    // Auto-save when layout changes
    $effect(() => {
        // Skip initial run
        if (layout === data.page.layout) return;

        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => {
            autoSave();
        }, 2000); // 2 second debounce
    });

    async function autoSave() {
        autoSaving = true;
        try {
            await fetch(`/api/pages/${data.page.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    layout,
                }),
            });
            lastSaved = new Date();
        } catch (e) {
            console.error("Auto-save failed:", e);
        } finally {
            autoSaving = false;
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

<Container class="py-12">
    <div class="max-w-4xl mx-auto space-y-8">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-4xl font-bold text-text">Page Editor</h1>
                {#if autoSaving}
                    <p class="text-xs text-muted mt-1">Saving...</p>
                {:else if lastSaved}
                    <p class="text-xs text-muted mt-1">
                        Saved {lastSaved.toLocaleTimeString()}
                    </p>
                {/if}
            </div>
            <div class="flex gap-2">
                <Button
                    variant="secondary"
                    onclick={handleSave}
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Save"}
                </Button>
                {#if published}
                    <a href="/{slug}" target="_blank">
                        <Button variant="secondary">View Page</Button>
                    </a>
                {/if}
                <Button onclick={handlePublish} disabled={saving}>
                    {published ? "Unpublish" : "Publish"}
                </Button>
            </div>
        </div>

        <div class="space-y-4">
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
                <label class="block text-sm font-medium text-text mb-2"
                    >Username (URL)</label
                >
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
                <p class="text-xs text-muted mt-1">
                    Lowercase letters, numbers, and hyphens only
                </p>
            </div>

            <GridEditor
                blocks={layout}
                onUpdate={(newBlocks) => {
                    layout = newBlocks;
                }}
            />
        </div>
    </div>
</Container>
