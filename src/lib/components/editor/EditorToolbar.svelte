<script lang="ts">
    import {
        Button,
        Tooltip,
        Modal,
        Input,
        Separator,
        MenuItem,
        IconButton,
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
        Globe,
        Menu,
        Home,
        Settings,
        LogOut,
        User,
        Share,
        GlobeLock,
    } from "lucide-svelte";
    import { goto } from "$app/navigation";
    import { slide } from "svelte/transition";
    import SettingsModal from "./SettingsModal.svelte";
    import type { PageSettings } from "$lib/types/models";

    interface Props {
        onAddText: () => void;
        onAddLink: () => void;
        onAddImage: () => void;
        onAddVideo: () => void;
        onAddHeading: () => void;
        onUndo: () => void;
        onRedo: () => void;
        onPublish: () => void;
        canUndo: boolean;
        canRedo: boolean;
        saving: boolean;
        autoSaving: boolean;
        published: boolean;
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
        canUndo,
        canRedo,
        saving,
        autoSaving,
        published,
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

    function handleLogout() {
        // TODO: Implement logout
        goto("/");
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
            slugError = "Username must be at least 3 characters";
            return;
        }

        if (!/^[a-z0-9-]+$/.test(newSlug)) {
            slugError =
                "Username can only contain lowercase letters, numbers, and hyphens";
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
                alert("Link copied to clipboard!");
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
    <div class="flex items-center justify-between h-12 gap-2">
        <div class="flex items-center gap-1 sm:gap-3">
            <!-- Menu -->
            <div class="relative">
                <button
                    onclick={() => (showMenu = !showMenu)}
                    class="flex items-center gap-1 sm:gap-2 px-1 sm:px-3 py-1.5 rounded hover:bg-border/50 transition-colors -ml-2"
                >
                    <div
                        class="h-8 w-8 min-w-[32px] rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm"
                    >
                        {firstLetter}
                    </div>
                    <span class="text-sm font-medium hidden sm:block"
                        >@{displayName()}</span
                    >
                </button>

                {#if showMenu}
                    <div
                        class="absolute bottom-full left-0 mb-2 w-52 bg-background border border-border rounded-lg shadow-lg overflow-hidden"
                        onmouseleave={() => (showMenu = false)}
                        role="menu"
                        tabindex="-1"
                    >
                        <MenuItem
                            icon={Home}
                            label="Home"
                            onclick={() => {
                                goto("/");
                                showMenu = false;
                            }}
                        />
                        <MenuItem
                            icon={User}
                            label="Change username"
                            onclick={openChangeUsername}
                        />
                        <MenuItem
                            icon={Settings}
                            label="Settings"
                            onclick={openSettings}
                        />
                        <Separator orientation="horizontal" class="mx-4 my-2" />
                        <MenuItem
                            icon={LogOut}
                            label="Logout"
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

            <!-- Add blocks -->
            <div class="flex items-center gap-1">
                <Tooltip text="Add Title">
                    <button
                        onclick={onAddHeading}
                        class="p-1.5 hover:bg-border/50 rounded-md text-muted hover:text-text transition-colors"
                    >
                        <Heading size={18} />
                    </button>
                </Tooltip>
                <Tooltip text="Add Text">
                    <button
                        onclick={onAddText}
                        class="p-1.5 hover:bg-border/50 rounded-md text-muted hover:text-text transition-colors"
                    >
                        <Type size={18} />
                    </button>
                </Tooltip>
                <Tooltip text="Add Link">
                    <button
                        onclick={onAddLink}
                        class="p-1.5 hover:bg-border/50 rounded-md text-muted hover:text-text transition-colors"
                    >
                        <LinkIcon size={18} />
                    </button>
                </Tooltip>
                <Tooltip text="Add Image or GIF">
                    <button
                        onclick={onAddImage}
                        class="p-1.5 hover:bg-border/50 rounded-md text-muted hover:text-text transition-colors"
                    >
                        <ImageIcon size={18} />
                    </button>
                </Tooltip>
                <Tooltip text="Add Video">
                    <button
                        onclick={onAddVideo}
                        class="p-1.5 hover:bg-border/50 rounded-md text-muted hover:text-text transition-colors"
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
                class="flex gap-0.5 sm:gap-1 {!canUndo && !canRedo
                    ? 'hidden sm:flex'
                    : 'flex'}"
            >
                <Tooltip text="Undo (Cmd+Z)">
                    <IconButton
                        icon={Undo2}
                        onclick={onUndo}
                        disabled={!canUndo}
                    />
                </Tooltip>
                <Tooltip text="Redo (Cmd+Shift+Z)">
                    <IconButton
                        icon={Redo2}
                        onclick={onRedo}
                        disabled={!canRedo}
                    />
                </Tooltip>
            </div>

            <Separator />

            <div class="flex items-center">
                {#if published && viewUrl}
                    <div
                        class="flex items-center gap-1 sm:gap-2 mr-1 sm:mr-2"
                        transition:slide={{ axis: "x", duration: 200 }}
                    >
                        <!-- Share -->
                        <Tooltip text="Share your SQUAR">
                            <IconButton icon={Share} onclick={handleShare} />
                        </Tooltip>

                        <!-- View -->
                        <Tooltip text="View your SQUAR">
                            <a href={viewUrl} target="_blank">
                                <IconButton icon={Eye} onclick={() => {}} />
                            </a>
                        </Tooltip>
                    </div>
                {/if}

                <!-- Publish -->
                <div class="sm:hidden flex items-center">
                    <Tooltip text={published ? "Unpublish" : "Publish"}>
                        <IconButton
                            icon={published ? GlobeLock : Globe}
                            onclick={onPublish}
                            disabled={saving}
                            class="bg-accent text-white hover:bg-accent/80 active:bg-accent"
                        />
                    </Tooltip>
                </div>

                <div class="hidden sm:block">
                    <Button
                        size="sm"
                        variant="primary"
                        onclick={onPublish}
                        disabled={saving}
                        class="px-3"
                    >
                        {#if published}
                            <GlobeLock size={16} class="mr-1.5" />
                        {:else}
                            <Globe size={16} class="mr-1.5" />
                        {/if}
                        {published ? "Unpublish" : "Publish"}
                    </Button>
                </div>
            </div>
        </div>
    </div>
</FloatingBar>

<Modal
    bind:open={showChangeUsernameModal}
    onClose={() => (showChangeUsernameModal = false)}
    title="Change username"
>
    <div class="space-y-4">
        <div>
            <label
                for="username-input"
                class="block text-sm font-medium text-text mb-2"
            >
                Username
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
                    error={slugError}
                    placeholder="yourname"
                    class="flex-1"
                />
            </div>
            {#if slugError}
                <p class="text-xs text-destructive mt-1">{slugError}</p>
            {/if}
            <p class="text-xs text-muted mt-2">
                Lowercase letters, numbers, and hyphens only. Minimum 3
                characters.
            </p>
        </div>

        <div class="flex justify-end gap-2">
            <Button
                variant="secondary"
                onclick={() => (showChangeUsernameModal = false)}
                disabled={savingSlug}
            >
                Cancel
            </Button>
            <Button
                variant="primary"
                onclick={handleSaveSlug}
                disabled={savingSlug || !newSlug}
            >
                {savingSlug ? "Saving..." : "Save"}
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
