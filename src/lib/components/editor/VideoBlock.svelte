<script lang="ts">
    import type { Block } from "$lib/types/models";
    import { Input } from "$lib/components/ui";
    import { parseVideoUrl } from "$lib/utils/videoParser";
    import { Video, Upload, Link as LinkIcon } from "lucide-svelte";
    import { t } from "svelte-i18n";
    import { slide, fade } from "svelte/transition";

    interface Props {
        block: Block;
        editable?: boolean;
        editState?: { isEditing: boolean };
        onUpdate?: (data: any) => void;
    }

    let { block, editable = true, editState = undefined, onUpdate }: Props = $props();

    const localEditState = $state({ isEditing: false });
    const state = $derived(editState ?? localEditState);

    let url = $state(block.data.url || "");
    let videoUrl = $state(block.data.videoUrl || "");
    let sourceType = $state<"upload" | "link">(block.data.sourceType || "link");
    let uploading = $state(false);
    let fileInput: HTMLInputElement;

    $effect(() => {
        url = block.data.url || "";
        videoUrl = block.data.videoUrl || "";
        sourceType = block.data.sourceType || "link";
        // Auto-edit for new blocks managed by parent editState if passed, or local logic
        if (editable && !url && !videoUrl && !state.isEditing) {
             // If we want auto-edit on creation, the parent should likely handle it via the initial state
             // But for now, let's respect the state passed down
        }
    });

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    const videoInfo = $derived(url ? parseVideoUrl(url) : null);
    
    // ...

    async function handleFileSelect(e: Event) {
        if (!editable) return;

        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        // Only accept videos
        if (!file.type.startsWith("video/")) {
            alert($t("blocks.video.error_type"));
            return;
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            alert($t("blocks.video.error_size"));
            return;
        }

        uploading = true;

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Upload failed");
            }

            const data = await response.json();
            videoUrl = data.url;
            onUpdate?.({
                videoUrl: data.url,
                filename: data.filename,
                sourceType: "upload",
            });
            state.isEditing = false;
        } catch (error) {
            alert($t("blocks.video.error_failed"));
        } finally {
            uploading = false;
        }
    }

    function handleSaveUrl() {
        if (videoInfo) {
            onUpdate?.({
                url,
                platform: videoInfo.platform,
                videoId: videoInfo.videoId,
                embedUrl: videoInfo.embedUrl,
                sourceType: "link",
            });
            state.isEditing = false;
        }
    }

    function handleEdit() {
        if (!editable) return;
        state.isEditing = true;
    }
</script>

<input
    type="file"
    accept="video/*"
    bind:this={fileInput}
    onchange={handleFileSelect}
    class="hidden"
/>

<div class="h-full w-full">
    {#if state.isEditing}
        <div class="p-4 flex flex-col gap-3" transition:slide={{ duration: 300, axis: 'y' }}>
            <!-- Source type selection -->
            <div class="flex gap-2">
                <button
                    onclick={() => (sourceType = "upload")}
                    class="flex-1 px-3 py-2 rounded border-2 transition-colors {sourceType ===
                    'upload'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-text'}"
                >
                    <Upload size={16} class="inline mr-2" />
                    {$t("blocks.video.upload_tab")}
                </button>
                <button
                    onclick={() => (sourceType = "link")}
                    class="flex-1 px-3 py-2 rounded border-2 transition-colors {sourceType ===
                    'link'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-text'}"
                >
                    <LinkIcon size={16} class="inline mr-2" />
                    {$t("blocks.video.link_tab")}
                </button>
            </div>

            {#if sourceType === "upload"}
                <button
                    onclick={() => fileInput.click()}
                    disabled={uploading}
                    class="py-8 border-2 border-dashed border-border hover:border-accent rounded transition-colors flex flex-col items-center gap-2"
                >
                    {#if uploading}
                        <p class="text-sm text-muted">
                            {$t("blocks.video.uploading")}
                        </p>
                    {:else}
                        <Upload size={32} class="text-muted" />
                        <p class="text-sm text-muted">
                            {$t("blocks.video.add")}
                        </p>
                        <p class="text-xs text-muted">
                            {$t("blocks.video.max_size_help")}
                        </p>
                    {/if}
                </button>
            {:else}
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium" for="video-url"
                        >{$t("blocks.video.url_label")}</label
                    >
                    <Input
                        id="video-url"
                        bind:value={url}
                        placeholder="https://youtube.com/watch?v=..."
                        onkeydown={(e) => {
                            if (e.key === "Enter") {
                                handleSaveUrl();
                            }
                        }}
                    />
                    <p class="text-xs text-muted">
                        {$t("blocks.video.url_help")}
                    </p>
                    {#if url && !videoInfo}
                        <p class="text-xs text-red-500">
                            {$t("blocks.video.url_invalid")}
                        </p>
                    {/if}
                    <button
                        onclick={handleSaveUrl}
                        disabled={!videoInfo}
                        class="px-3 py-1.5 bg-accent text-white rounded text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {$t("common.save")}
                    </button>
                </div>
            {/if}
        </div>
    {:else if videoUrl}
        <!-- Uploaded video -->
        <div
            class="h-full w-full flex flex-col"
            transition:fade={{ duration: 200 }}
        >
            {#if editable}
                <button
                    onclick={() => {
                        state.isEditing = true;
                        fileInput.click();
                    }}
                    class="h-full w-full group relative overflow-hidden bg-secondary/50"
                >
                    <video
                        src={videoUrl}
                        class="w-full h-full object-contain"
                        loop
                        muted
                        autoplay
                    >
                        <track kind="captions" />
                    </video>
                    <div
                        class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                        <Upload size={24} class="text-white" />
                    </div>
                </button>
            {:else}
                <div class="h-full w-full overflow-hidden bg-secondary/50">
                    <video
                        src={videoUrl}
                        class="w-full h-full object-contain"
                        controls
                        loop
                        muted
                        autoplay
                    >
                        <track kind="captions" />
                    </video>
                </div>
            {/if}
        </div>
    {:else if videoInfo}
        <!-- External video -->
        <div
            class="h-full w-full flex flex-col"
            transition:fade={{ duration: 200 }}
        >
            {#if editable}
                <button
                    onclick={() => {
                        state.isEditing = true;
                        fileInput.click();
                    }}
                    class="h-full w-full group relative overflow-hidden bg-secondary/50 aspect-video"
                >
                    <iframe
                        src={videoInfo.embedUrl}
                        title="Video"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        class="w-full h-full pointer-events-none"
                    ></iframe>
                    <div
                        class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                        <Upload size={24} class="text-white" />
                    </div>
                </button>
            {:else}
                <div class="h-full w-full overflow-hidden bg-secondary/50 aspect-video">
                    <iframe
                        src={videoInfo.embedUrl}
                        title="Video"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                        class="w-full h-full"
                    ></iframe>
                </div>
            {/if}
        </div>
    {:else if editable}
        <button
            onclick={() => {
                 state.isEditing = true;
                 fileInput.click();
            }}
            disabled={uploading}
            class="h-full w-full flex flex-col items-center justify-center bg-border/20 hover:bg-border/30 transition-colors py-12"
            transition:fade={{ duration: 200 }}
        >
            {#if uploading}
                <p class="text-sm text-muted">{$t("blocks.video.uploading")}</p>
            {:else}
                <Video size={32} class="text-muted mb-2" />
                <p class="text-sm text-muted">{$t("blocks.video.add")}</p>
                <p class="text-xs text-muted mt-1">
                    {$t("blocks.video.max_size_help")}
                </p>
            {/if}
        </button>
    {/if}
</div>
