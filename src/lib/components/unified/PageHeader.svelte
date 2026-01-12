<script lang="ts">
    import ProfilePhotoPreview from "$lib/components/editor/ProfilePhotoPreview.svelte";
    import type { PageSettings } from "$lib/types/models";
    import { Settings } from "lucide-svelte";

    interface Props {
        editable: boolean;
        title: string;
        description?: string;
        profilePhoto?: PageSettings["profilePhoto"];
        titleSize?: PageSettings["titleSize"];
        username: string;
        userEmail?: string;
        onTitleUpdate?: (title: string) => void;
        onDescriptionUpdate?: (description: string) => void;
        onHeaderSettingsClick?: () => void;
    }

    let {
        editable = false,
        title = $bindable(),
        description = $bindable(),
        profilePhoto = $bindable(),
        titleSize = "medium",
        username,
        userEmail,
        onTitleUpdate,
        onDescriptionUpdate,
        onHeaderSettingsClick,
    }: Props = $props();

    // Default profile photo settings
    const defaultProfilePhoto = {
        position: "center" as const,
        size: "medium" as const,
        shape: "circle" as const,
        visibility: "letter" as const,
        layout: "vertical" as const, // NEW: vertical, horizontal-left, horizontal-right
    };

    const currentProfilePhoto = $derived(profilePhoto || defaultProfilePhoto);
    const currentTitleSize = $derived(titleSize || "medium");
    const currentLayout = $derived(currentProfilePhoto.layout || "vertical");

    const titleClasses = $derived(
        currentTitleSize === "small"
            ? "text-xl md:text-2xl"
            : currentTitleSize === "medium"
              ? "text-2xl md:text-4xl"
              : "text-4xl md:text-5xl",
    );

    // Check if profile photo is shown
    const showProfilePhoto = $derived(
        currentProfilePhoto.visibility !== "hidden",
    );

    // Check if in sidebar mode
    const isSidebar = $derived(
        currentProfilePhoto.position === "left" ||
            currentProfilePhoto.position === "right",
    );
</script>

{#if isSidebar}
    <!-- SIDEBAR PROFILE CARD CONTENT -->
    <div class="relative group">
        {#if editable && onHeaderSettingsClick}
            <button
                onclick={onHeaderSettingsClick}
                class="absolute top-0 right-0 p-1.5 text-muted hover:text-text bg-background/80 backdrop-blur-sm border border-border rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                title="Header Settings"
            >
                <Settings size={14} />
            </button>
        {/if}
        <div
            class="flex {currentLayout === 'vertical'
                ? 'flex-col items-center text-center'
                : 'flex-row items-center gap-3'} {currentLayout ===
            'horizontal-right'
                ? 'flex-row-reverse text-right'
                : ''} w-full"
        >
            <!-- Profile Photo -->
            <div class="shrink-0 {currentLayout === 'vertical' ? 'mb-4' : ''}">
                {#if showProfilePhoto}
                    <div class="flex justify-center">
                        <ProfilePhotoPreview
                            photoUrl={"url" in currentProfilePhoto
                                ? currentProfilePhoto.url
                                : undefined}
                            visibility={currentProfilePhoto.visibility}
                            size={currentProfilePhoto.size}
                            shape={currentProfilePhoto.shape}
                            {username}
                            {userEmail}
                        />
                    </div>
                {/if}
            </div>

            <!-- Title & Description -->
            <div
                class="flex-1 space-y-1 {currentLayout === 'vertical'
                    ? 'text-center'
                    : currentLayout === 'horizontal-left'
                      ? 'text-left'
                      : 'text-right'} min-w-0"
            >
                {#if editable}
                    <div
                        contenteditable="true"
                        role="textbox"
                        tabindex="0"
                        class="{titleClasses} font-heading font-bold border-0 bg-transparent rounded-md focus:outline-none focus:ring-0 hover:bg-border/20 transition-colors cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-muted/50 outline-none truncate"
                        style="padding: 0.125rem; margin: -0.125rem;"
                        data-placeholder="My Page"
                        oninput={(e) => {
                            title = e.currentTarget.innerText;
                        }}
                        onblur={() => onTitleUpdate?.(title)}
                    >
                        {title}
                    </div>

                    {#if description !== undefined}
                        <div
                            contenteditable="true"
                            role="textbox"
                            tabindex="0"
                            class="text-xs text-muted border-0 bg-transparent rounded-md focus:outline-none focus:ring-0 hover:bg-border/20 transition-colors cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-muted/50 outline-none line-clamp-2"
                            style="padding: 0.125rem; margin: -0.125rem;"
                            data-placeholder="Add a description..."
                            oninput={(e) => {
                                description = e.currentTarget.innerText;
                            }}
                            onblur={() => onDescriptionUpdate?.(description)}
                        >
                            {description}
                        </div>
                    {/if}
                {:else}
                    <h1 class="{titleClasses} font-heading font-bold truncate">
                        {title}
                    </h1>
                    {#if description}
                        <p class="text-xs text-muted line-clamp-3">
                            {description}
                        </p>
                    {/if}
                {/if}
            </div>
        </div>
    </div>
{:else}
    <!-- CENTER/HEADER LAYOUT - Minimalist hero banner -->
    <header class="mb-8">
        <div class="relative group py-8 px-4">
            {#if editable && onHeaderSettingsClick}
                <button
                    onclick={onHeaderSettingsClick}
                    class="absolute top-4 right-4 p-1.5 text-muted hover:text-text bg-background/80 backdrop-blur-sm border border-border rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="Header Settings"
                >
                    <Settings size={14} />
                </button>
            {/if}
            {#if currentLayout === "vertical"}
                <!-- VERTICAL: Photo on top, text below (original) -->
                <div class="flex flex-col items-center text-center gap-4">
                    <!-- Profile Photo -->
                    {#if showProfilePhoto}
                        <ProfilePhotoPreview
                            photoUrl={"url" in currentProfilePhoto
                                ? currentProfilePhoto.url
                                : undefined}
                            visibility={currentProfilePhoto.visibility}
                            size={currentProfilePhoto.size}
                            shape={currentProfilePhoto.shape}
                            {username}
                            {userEmail}
                        />
                    {/if}

                    <!-- Title & Description -->
                    <div class="w-full max-w-2xl space-y-2">
                        {#if editable}
                            <div
                                contenteditable="true"
                                role="textbox"
                                tabindex="0"
                                class="{titleClasses} font-heading font-bold border-0 bg-transparent rounded-lg focus:outline-none focus:ring-0 hover:bg-border/20 transition-colors cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-muted/50 outline-none"
                                style="padding: 0.5rem; margin: -0.5rem;"
                                data-placeholder="My Page"
                                oninput={(e) => {
                                    title = e.currentTarget.innerText;
                                }}
                                onblur={() => onTitleUpdate?.(title)}
                            >
                                {title}
                            </div>

                            {#if description !== undefined}
                                <div
                                    contenteditable="true"
                                    role="textbox"
                                    tabindex="0"
                                    class="text-base text-muted border-0 bg-transparent rounded-lg focus:outline-none focus:ring-0 hover:bg-border/20 transition-colors cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-muted/50 outline-none w-full"
                                    style="padding: 0.5rem; margin: -0.5rem;"
                                    data-placeholder="Add a description..."
                                    oninput={(e) => {
                                        description = e.currentTarget.innerText;
                                    }}
                                    onblur={() =>
                                        onDescriptionUpdate?.(description)}
                                >
                                    {description}
                                </div>
                            {/if}
                        {:else}
                            <h1 class="{titleClasses} font-heading font-bold">
                                {title}
                            </h1>
                            {#if description}
                                <p class="text-base text-muted">
                                    {description}
                                </p>
                            {/if}
                        {/if}
                    </div>
                </div>
            {:else if currentLayout === "horizontal-left"}
                <!-- HORIZONTAL LEFT: Photo on left, text on right -->
                <div
                    class="flex flex-col md:flex-row items-center gap-6 md:gap-8"
                >
                    <!-- Profile Photo -->
                    <div class="shrink-0">
                        {#if showProfilePhoto}
                            <button
                                onclick={editable ? onPhotoClick : undefined}
                                class="{editable
                                    ? 'cursor-pointer hover:opacity-80 transition-opacity'
                                    : 'cursor-default'} outline-none"
                                disabled={!editable}
                            >
                                <ProfilePhotoPreview
                                    photoUrl={"url" in currentProfilePhoto
                                        ? currentProfilePhoto.url
                                        : undefined}
                                    visibility={currentProfilePhoto.visibility}
                                    size={currentProfilePhoto.size}
                                    shape={currentProfilePhoto.shape}
                                    {username}
                                    {userEmail}
                                />
                            </button>
                        {:else if editable}
                            <button
                                onclick={onPhotoClick}
                                class="w-24 h-24 rounded-full flex items-center justify-center text-3xl text-muted hover:text-text hover:bg-border/20 transition-colors"
                            >
                                +
                            </button>
                        {/if}
                    </div>

                    <!-- Title & Description -->
                    <div class="flex-1 space-y-2 text-center md:text-left">
                        {#if editable}
                            <div class="relative group">
                                <div
                                    contenteditable="true"
                                    role="textbox"
                                    tabindex="0"
                                    class="{titleClasses} font-heading font-bold border-0 bg-transparent rounded-lg focus:outline-none focus:ring-0 hover:bg-border/20 transition-colors cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-muted/50 outline-none"
                                    style="padding: 0.5rem; margin: -0.5rem;"
                                    data-placeholder="My Page"
                                    oninput={(e) => {
                                        title = e.currentTarget.innerText;
                                    }}
                                    onblur={() => onTitleUpdate?.(title)}
                                >
                                    {title}
                                </div>
                            </div>

                            {#if description !== undefined}
                                <div
                                    contenteditable="true"
                                    role="textbox"
                                    tabindex="0"
                                    class="text-lg text-muted border-0 bg-transparent rounded-lg focus:outline-none focus:ring-0 hover:bg-border/20 transition-colors cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-muted/50 outline-none"
                                    style="padding: 0.5rem; margin: -0.5rem;"
                                    data-placeholder="Add a description..."
                                    oninput={(e) => {
                                        description = e.currentTarget.innerText;
                                    }}
                                    onblur={() =>
                                        onDescriptionUpdate?.(description)}
                                >
                                    {description}
                                </div>
                            {/if}
                        {:else}
                            <h1 class="{titleClasses} font-heading font-bold">
                                {title}
                            </h1>
                            {#if description}
                                <p class="text-base text-muted">
                                    {description}
                                </p>
                            {/if}
                        {/if}
                    </div>
                </div>
            {:else}
                <!-- HORIZONTAL RIGHT: Text on left, photo on right -->
                <div
                    class="flex flex-col md:flex-row items-center gap-6 md:gap-8"
                >
                    <!-- Title & Description -->
                    <div
                        class="flex-1 space-y-2 text-center md:text-right order-2 md:order-1"
                    >
                        {#if editable}
                            <div class="relative group">
                                <div
                                    contenteditable="true"
                                    role="textbox"
                                    tabindex="0"
                                    class="{titleClasses} font-heading font-bold border-0 bg-transparent rounded-lg focus:outline-none focus:ring-0 hover:bg-border/20 transition-colors cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-muted/50 outline-none"
                                    style="padding: 0.5rem; margin: -0.5rem;"
                                    data-placeholder="My Page"
                                    oninput={(e) => {
                                        title = e.currentTarget.innerText;
                                    }}
                                    onblur={() => onTitleUpdate?.(title)}
                                >
                                    {title}
                                </div>

                                <button
                                    onclick={onTitleSettingsClick}
                                    class="absolute left-0 -translate-x-full mr-2 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-text bg-background border border-border rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    title="Title Settings"
                                >
                                    <Settings size={14} />
                                </button>
                            </div>

                            {#if description !== undefined}
                                <div
                                    contenteditable="true"
                                    role="textbox"
                                    tabindex="0"
                                    class="text-lg text-muted border-0 bg-transparent rounded-lg focus:outline-none focus:ring-0 hover:bg-border/20 transition-colors cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-muted/50 outline-none"
                                    style="padding: 0.5rem; margin: -0.5rem;"
                                    data-placeholder="Add a description..."
                                    oninput={(e) => {
                                        description = e.currentTarget.innerText;
                                    }}
                                    onblur={() =>
                                        onDescriptionUpdate?.(description)}
                                >
                                    {description}
                                </div>
                            {/if}
                        {:else}
                            <h1 class="{titleClasses} font-heading font-bold">
                                {title}
                            </h1>
                            {#if description}
                                <p class="text-base text-muted">
                                    {description}
                                </p>
                            {/if}
                        {/if}
                    </div>

                    <!-- Profile Photo -->
                    <div class="shrink-0 order-1 md:order-2">
                        {#if showProfilePhoto}
                            <button
                                onclick={editable ? onPhotoClick : undefined}
                                class="{editable
                                    ? 'cursor-pointer hover:opacity-80 transition-opacity'
                                    : 'cursor-default'} outline-none"
                                disabled={!editable}
                            >
                                <ProfilePhotoPreview
                                    photoUrl={"url" in currentProfilePhoto
                                        ? currentProfilePhoto.url
                                        : undefined}
                                    visibility={currentProfilePhoto.visibility}
                                    size={currentProfilePhoto.size}
                                    shape={currentProfilePhoto.shape}
                                    {username}
                                    {userEmail}
                                />
                            </button>
                        {:else if editable}
                            <button
                                onclick={onPhotoClick}
                                class="w-24 h-24 rounded-full flex items-center justify-center text-3xl text-muted hover:text-text hover:bg-border/20 transition-colors"
                            >
                                +
                            </button>
                        {/if}
                    </div>
                </div>
            {/if}
        </div>
    </header>
{/if}
