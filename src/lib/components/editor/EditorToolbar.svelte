<script lang="ts">
    import {
        Button,
        Tooltip,
        Modal,
        Input,
        Separator,
        MenuItem,
        IconButton,
        LanguageSwitcher,
    } from "$lib/components/ui";
    import FloatingBar from "$lib/components/layout/FloatingBar.svelte";
    import {
        Type,
        Link as LinkIcon,
        Image as ImageIcon,
        Video as VideoIcon,
        Heading,
        Undo2,
        Redo2,
        Eye,
        EyeOff,
        Globe,
        Home,
        Settings,
        LogOut,
        User,
        Share,
        GlobeLock,
    } from "lucide-svelte";
    import { goto, invalidateAll } from "$app/navigation";
    import { slide } from "svelte/transition";
    import SettingsModal from "./SettingsModal.svelte";
    import type { PageSettings } from "$lib/types/models";
    import { t } from "svelte-i18n";
    import { signOut } from "$lib/auth/client";

    interface Props {
        onAddText: () => void;
        onAddLink: () => void;
        onAddImage: () => void;
        onAddVideo: () => void;
        onAddHeading: () => void;
        onUndo: () => void;
        onRedo: () => void;
        onPublish: () => void;
        onPreviewToggle?: () => void;
        canUndo: boolean;
        canRedo: boolean;
        saving: boolean;
        autoSaving: boolean;
        published: boolean;
        previewMode?: boolean;
        viewUrl?: string;
        username?: string;
        userEmail?: string;
        pageSettings: PageSettings;
        onSlugChange?: (
            newSlug: string,
        ) => Promise<{ success: boolean; error?: string }>;
        onSettingsUpdate: (newSettings: PageSettings) => void;
    }

    let {
        onAddText,
        onAddLink,
        onAddImage,
        onAddVideo,
        onAddHeading,
        onUndo,
        onRedo,
        onPublish,
        onPreviewToggle,
        canUndo,
        canRedo,
        saving,
        autoSaving,
        published,
        previewMode = false,
        viewUrl,
        username,
        userEmail,
        pageSettings,
        onSlugChange,
        onSettingsUpdate,
    }: Props = $props();

    const displayName = $derived(() => {
        if (username) return username;
        if (!userEmail) return "user";
        const emailLocal = userEmail.split("@")[0];
        return emailLocal.length > 10
            ? emailLocal.substring(0, 10)
            : emailLocal;
    });

    const firstLetter = $derived(displayName().charAt(0).toUpperCase());

    let showMenu = $state(false);
    let showChangeUsernameModal = $state(false);
    let showSettingsModal = $state(false);
    let newSlug = $state("");
    let slugError = $state("");
    let savingSlug = $state(false);

    async function handleLogout() {
        try {
            await signOut();
            await invalidateAll();
            goto("/");
        } catch (error) {
            console.error("Error during logout:", error);
            // Redirect anyway to ensure user is logged out
            goto("/");
        }
    }

    function openChangeUsername() {
        newSlug = username || "";
        slugError = "";
        showChangeUsernameModal = true;
        showMenu = false;
    }

    function openSettings() {
        showSettingsModal = true;
        showMenu = false;
    }

    async function handleSaveSlug() {
        slugError = "";

        // Validate slug
        if (!newSlug || newSlug.length < 3) {
            slugError = "editor.username_modal.error_min_length";
            return;
        }

        if (!/^[a-z0-9-]+$/.test(newSlug)) {
            slugError = "editor.username_modal.error_invalid";
            return;
        }

        if (newSlug === username) {
            showChangeUsernameModal = false;
            return;
        }

        if (!onSlugChange) return;

        savingSlug = true;
        const result = await onSlugChange(newSlug);
        savingSlug = false;

        if (result.success) {
            showChangeUsernameModal = false;
        } else if (result.error) {
            slugError = result.error;
        }
    }

    async function handleShare() {
        if (!viewUrl) return;

        const fullUrl = `${window.location.origin}${viewUrl}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `My SQUAR page is live → squar.me/${username}`,
                    url: fullUrl,
                });
            } catch (err) {
                // Ignore AbortError (user cancelled)
                if ((err as Error).name !== "AbortError") {
                    console.error("Error sharing:", err);
                }
            }
        } else {
            try {
                await navigator.clipboard.writeText(fullUrl);
                alert($t("editor.share.copied"));
            } catch (err) {
                console.error("Error copying to clipboard:", err);
            }
        }
    }
</script>

<FloatingBar
    position="bottom"
    minWidth="xl"
    adaptive={true}
    saving={autoSaving}
>
    <div class="flex items-center justify-between w-full h-12 sm:px-2 gap-2">
        <!-- LEFT: User -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
            <!-- Menu -->
            <div class="relative">
                <button
                    onclick={() => (showMenu = !showMenu)}
                    class="flex items-center gap-1 sm:gap-2 px-1 sm:px-2 py-1.5 rounded hover:bg-border/50 transition-colors"
                >
                    <div
                        class="h-8 w-8 min-w-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm"
                    >
                        {firstLetter}
                    </div>
                    <span class="text-sm font-medium hidden sm:block"
                        >@{displayName()}</span
                    >
                </button>

                {#if showMenu}
                    <div
                        class="absolute bottom-full left-0 mb-2 w-52 bg-background border border-border rounded-lg shadow-lg z-50"
                        onmouseleave={() => (showMenu = false)}
                        role="menu"
                        tabindex="-1"
                    >
                        <MenuItem
                            icon={User}
                            label={$t("editor.menu.change_username")}
                            onclick={openChangeUsername}
                        />
                        <LanguageSwitcher variant="menu" direction="right" />
                        <MenuItem
                            icon={Settings}
                            label={$t("editor.menu.settings")}
                            onclick={openSettings}
                        />
                        <Separator orientation="horizontal" class="mx-4 my-2" />
                        <MenuItem
                            icon={LogOut}
                            label={$t("editor.menu.logout")}
                            variant="destructive"
                            onclick={() => {
                                handleLogout();
                                showMenu = false;
                            }}
                        />
                    </div>
                {/if}
            </div>

            <Separator />
        </div>

        <!-- CENTER: Tools -->

        <div
            class="flex-1 flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar mask-fade px-2"
        >
            <!-- Add blocks -->

            <div class="flex items-center gap-1 shrink-0">
                <Tooltip text={$t("editor.toolbar.add_title")}>
                    <button
                        onclick={onAddHeading}
                        disabled={previewMode}
                        class="p-1.5 hover:bg-border/50 rounded-md text-muted hover:text-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <Heading size={18} />
                    </button>
                </Tooltip>
                <Tooltip text={$t("editor.toolbar.add_text")}>
                    <button
                        onclick={onAddText}
                        disabled={previewMode}
                        class="p-1.5 hover:bg-border/50 rounded-md text-muted hover:text-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <Type size={18} />
                    </button>
                </Tooltip>
                <Tooltip text={$t("editor.toolbar.add_link")}>
                    <button
                        onclick={onAddLink}
                        disabled={previewMode}
                        class="p-1.5 hover:bg-border/50 rounded-md text-muted hover:text-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <LinkIcon size={18} />
                    </button>
                </Tooltip>
                <Tooltip text={$t("editor.toolbar.add_image")}>
                    <button
                        onclick={onAddImage}
                        disabled={previewMode}
                        class="p-1.5 hover:bg-border/50 rounded-md text-muted hover:text-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ImageIcon size={18} />
                    </button>
                </Tooltip>
                <Tooltip text={$t("editor.toolbar.add_video")}>
                    <button
                        onclick={onAddVideo}
                        disabled={previewMode}
                        class="p-1.5 hover:bg-border/50 rounded-md text-muted hover:text-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <VideoIcon size={18} />
                    </button>
                </Tooltip>
            </div>

            <Separator
                class={!canUndo && !canRedo ? "hidden sm:inline" : "inline"}
            />

            <!-- Undo/Redo -->
            <div
                class="flex gap-0.5 sm:gap-1 shrink-0 {!canUndo && !canRedo
                    ? 'hidden sm:flex'
                    : 'flex'}"
            >
                <Tooltip text={$t("editor.toolbar.undo")}>
                    <IconButton
                        icon={Undo2}
                        onclick={onUndo}
                        disabled={!canUndo || previewMode}
                    />
                </Tooltip>
                <Tooltip text={$t("editor.toolbar.redo")}>
                    <IconButton
                        icon={Redo2}
                        onclick={onRedo}
                        disabled={!canRedo || previewMode}
                    />
                </Tooltip>
            </div>
        </div>

        <!-- RIGHT: Actions -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0 justify-end">
            <Separator />

            <!-- Preview Mode Toggle -->
            {#if onPreviewToggle}
                <div class="flex items-center">
                    <Tooltip
                        text={previewMode
                            ? $t("editor.toolbar.exit_preview")
                            : $t("editor.toolbar.preview")}
                    >
                        <IconButton
                            icon={previewMode ? EyeOff : Eye}
                            onclick={onPreviewToggle}
                            class={previewMode
                                ? "bg-accent/20 text-accent"
                                : ""}
                        />
                    </Tooltip>
                </div>
            {/if}

            {#if published && viewUrl}
                <div
                    class="flex items-center gap-1 sm:gap-2"
                    transition:slide={{ axis: "x", duration: 200 }}
                >
                    <!-- Share -->
                    <Tooltip text={$t("editor.toolbar.share")}>
                        <IconButton icon={Share} onclick={handleShare} />
                    </Tooltip>

                    <!-- View (deprecated in new unified mode, but kept for compatibility) -->
                    {#if viewUrl !== `/${username}`}
                        <Tooltip text={$t("editor.toolbar.view")}>
                            <a href={viewUrl} target="_blank">
                                <IconButton icon={Eye} onclick={() => {}} />
                            </a>
                        </Tooltip>
                    {/if}
                </div>
            {/if}

            <!-- Publish -->
            <div class="sm:hidden flex items-center">
                <Tooltip
                    text={published
                        ? $t("editor.toolbar.unpublish")
                        : $t("editor.toolbar.publish")}
                >
                    <IconButton
                        icon={published ? GlobeLock : Globe}
                        onclick={onPublish}
                        disabled={saving || previewMode}
                        class="bg-accent text-white hover:bg-accent/80 active:bg-accent"
                    />
                </Tooltip>
            </div>

            <div class="hidden sm:block">
                <Button
                    size="sm"
                    variant="primary"
                    onclick={onPublish}
                    disabled={saving || previewMode}
                    class="px-3"
                >
                    {#if published}
                        <GlobeLock size={16} class="mr-1.5" />
                    {:else}
                        <Globe size={16} class="mr-1.5" />
                    {/if}
                    {published
                        ? $t("editor.toolbar.unpublish")
                        : $t("editor.toolbar.publish")}
                </Button>
            </div>
        </div>
    </div>
</FloatingBar>

<Modal
    bind:open={showChangeUsernameModal}
    onClose={() => (showChangeUsernameModal = false)}
    title={$t("editor.username_modal.title")}
>
    <div class="space-y-4">
        <div>
            <label
                for="username-input"
                class="block text-sm font-medium text-text mb-2"
            >
                {$t("editor.username_modal.label")}
            </label>
            <div class="flex items-center gap-2">
                <span class="text-sm text-muted whitespace-nowrap"
                    >squar.me/</span
                >
                <Input
                    id="username-input"
                    value={newSlug}
                    oninput={(e) => {
                        newSlug = e.currentTarget.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "");
                        e.currentTarget.value = newSlug;
                        slugError = "";
                    }}
                    onkeydown={(e) => {
                        if (e.key === "Enter" && !savingSlug) {
                            handleSaveSlug();
                        }
                    }}
                    error={$t(slugError)}
                    placeholder="yourname"
                    class="flex-1"
                />
            </div>
            {#if slugError}
                <p class="text-xs text-destructive mt-1">{$t(slugError)}</p>
            {/if}
            <p class="text-xs text-muted mt-2">
                {$t("editor.username_modal.help")}
            </p>
        </div>

        <div class="flex justify-end gap-2">
            <Button
                variant="secondary"
                onclick={() => (showChangeUsernameModal = false)}
                disabled={savingSlug}
            >
                {$t("common.cancel")}
            </Button>
            <Button
                variant="primary"
                onclick={handleSaveSlug}
                disabled={savingSlug || !newSlug}
            >
                {savingSlug
                    ? $t("editor.username_modal.saving")
                    : $t("common.save")}
            </Button>
        </div>
    </div>
</Modal>

<SettingsModal
    bind:open={showSettingsModal}
    onClose={() => (showSettingsModal = false)}
    settings={pageSettings}
    onUpdate={onSettingsUpdate}
/>
