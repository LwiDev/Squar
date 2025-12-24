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
        onPhotoClick?: () => void;
        onTitleSettingsClick?: () => void;
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
        onPhotoClick,
        onTitleSettingsClick,
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
    <div class="flex {currentLayout === 'vertical' ? 'flex-col items-center text-center' : 'flex-row items-center gap-4'} {currentLayout === 'horizontal-right' ? 'flex-row-reverse text-right' : ''} w-full">
        <!-- Profile Photo -->
        <div class="shrink-0 {currentLayout === 'vertical' ? 'mb-6' : ''}">
            {#if showProfilePhoto}
                <button
                    onclick={editable ? onPhotoClick : undefined}
                    class="{editable
                        ? 'cursor-pointer hover:opacity-80 transition-opacity'
                        : 'cursor-default'} outline-none flex justify-center"
                    disabled={!editable}
                >
                    <ProfilePhotoPreview
                        photoUrl={'url' in currentProfilePhoto ? currentProfilePhoto.url : undefined}
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
                    class="px-4 py-3 text-sm text-muted hover:text-text border-2 border-dashed border-border hover:border-text rounded-lg transition-colors"
                >
                    +
                </button>
            {/if}
        </div>

        <!-- Title & Description -->
        <div class="flex-1 space-y-2 {currentLayout === 'vertical' ? 'text-center' : currentLayout === 'horizontal-left' ? 'text-left' : 'text-right'} min-w-0">
            {#if editable}
                <div class="relative group">
                    <div
                        contenteditable="true"
                        role="textbox"
                        tabindex="0"
                        class="{titleClasses} font-heading font-bold border-0 bg-transparent rounded-lg focus:outline-none focus:ring-0 hover:bg-border/20 transition-colors cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-muted/50 outline-none truncate"
                        style="padding: 0.25rem; margin: -0.25rem;"
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
                        class="absolute {currentLayout === 'horizontal-right' ? 'right-0' : 'right-0'} top-1/2 -translate-y-1/2 p-1 text-muted hover:text-text bg-background border border-border rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title="Title Settings"
                    >
                        <Settings size={12} />
                    </button>
                </div>

                {#if description !== undefined}
                    <div
                        contenteditable="true"
                        role="textbox"
                        tabindex="0"
                        class="text-sm text-muted border-0 bg-transparent rounded-lg focus:outline-none focus:ring-0 hover:bg-border/20 transition-colors cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-muted/50 outline-none line-clamp-2"
                        style="padding: 0.25rem; margin: -0.25rem;"
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
                    <p class="text-sm text-muted line-clamp-3">
                        {description}
                    </p>
                {/if}
            {/if}
        </div>
    </div>
{:else}
    <!-- CENTER/HEADER LAYOUT - Hero banner style with layout options -->
    <header class="mb-12">
        <div
            class="bg-background border-2 border-border rounded-2xl p-12 shadow-sm"
        >
            {#if currentLayout === "vertical"}
                <!-- VERTICAL: Photo on top, text below (original) -->
                <div class="flex flex-col items-center text-center gap-6">
                    <!-- Profile Photo -->
                    {#if showProfilePhoto}
                        <button
                            onclick={editable ? onPhotoClick : undefined}
                            class="{editable
                                ? 'cursor-pointer hover:opacity-80 transition-opacity'
                                : 'cursor-default'} outline-none shrink-0"
                            disabled={!editable}
                        >
                            <ProfilePhotoPreview
                                photoUrl={'url' in currentProfilePhoto ? currentProfilePhoto.url : undefined}
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
                            class="px-4 py-3 text-sm text-muted hover:text-text border-2 border-dashed border-border hover:border-text rounded-lg transition-colors"
                        >
                            Add profile photo
                        </button>
                    {/if}

                    <!-- Title & Description -->
                    <div class="w-full max-w-2xl space-y-3">
                        {#if editable}
                            <div
                                class="relative group inline-flex items-center w-full justify-center"
                            >
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
                                    class="absolute right-0 translate-x-full ml-2 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-text bg-background border border-border rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
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
                                    class="text-lg text-muted border-0 bg-transparent rounded-lg focus:outline-none focus:ring-0 hover:bg-border/20 transition-colors cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-muted/50 outline-none w-full"
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
                                <p class="text-lg text-muted">
                                    {description}
                                </p>
                            {/if}
                        {/if}
                    </div>
                </div>
            {:else if currentLayout === "horizontal-left"}
                <!-- HORIZONTAL LEFT: Photo on left, text on right -->
                <div
                    class="flex flex-col md:flex-row items-center gap-8 md:gap-12"
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
                                    photoUrl={'url' in currentProfilePhoto ? currentProfilePhoto.url : undefined}
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
                                class="px-4 py-3 text-sm text-muted hover:text-text border-2 border-dashed border-border hover:border-text rounded-lg transition-colors"
                            >
                                Add photo
                            </button>
                        {/if}
                    </div>

                    <!-- Title & Description -->
                    <div class="flex-1 space-y-3 text-center md:text-left">
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
                                    class="absolute right-0 translate-x-full ml-2 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-text bg-background border border-border rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
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
                                <p class="text-lg text-muted">
                                    {description}
                                </p>
                            {/if}
                        {/if}
                    </div>
                </div>
            {:else}
                <!-- HORIZONTAL RIGHT: Text on left, photo on right -->
                <div
                    class="flex flex-col md:flex-row items-center gap-8 md:gap-12"
                >
                    <!-- Title & Description -->
                    <div
                        class="flex-1 space-y-3 text-center md:text-right order-2 md:order-1"
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
                                <p class="text-lg text-muted">
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
                                    photoUrl={'url' in currentProfilePhoto ? currentProfilePhoto.url : undefined}
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
                                class="px-4 py-3 text-sm text-muted hover:text-text border-2 border-dashed border-border hover:border-text rounded-lg transition-colors"
                            >
                                Add photo
                            </button>
                        {/if}
                    </div>
                </div>
            {/if}
        </div>
    </header>
{/if}
