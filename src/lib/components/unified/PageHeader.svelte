<script lang="ts">
	import { Input } from '$lib/components/ui';
	import ProfilePhotoPreview from '$lib/components/editor/ProfilePhotoPreview.svelte';
	import type { PageSettings } from '$lib/types/models';

	interface Props {
		editable: boolean;
		title: string;
		description?: string;
		profilePhoto?: PageSettings['profilePhoto'];
		username: string;
		userEmail?: string;
		onTitleUpdate?: (title: string) => void;
		onDescriptionUpdate?: (description: string) => void;
		onPhotoClick?: () => void;
	}

	let {
		editable = false,
		title = $bindable(),
		description = $bindable(),
		profilePhoto = $bindable(),
		username,
		userEmail,
		onTitleUpdate,
		onDescriptionUpdate,
		onPhotoClick
	}: Props = $props();

	// Default profile photo settings
	const defaultProfilePhoto = {
		position: 'center' as const,
		size: 'medium' as const,
		shape: 'circle' as const,
		visibility: 'letter' as const
	};

	const currentProfilePhoto = $derived(profilePhoto || defaultProfilePhoto);
</script>

<header
	class="mb-4 flex {currentProfilePhoto.position === 'left'
		? 'justify-start'
		: currentProfilePhoto.position === 'right'
			? 'justify-end'
			: 'justify-center'}"
>
	<div class="flex flex-col items-center gap-4">
		<!-- Profile Photo -->
		{#if currentProfilePhoto.visibility !== 'hidden'}
			<button
				onclick={editable ? onPhotoClick : undefined}
				class="{editable ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-default'} outline-none"
				disabled={!editable}
			>
				<ProfilePhotoPreview
					photoUrl={currentProfilePhoto.url}
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
				class="px-4 py-2 text-sm text-muted hover:text-text border-2 border-dashed border-border hover:border-text rounded-lg transition-colors"
			>
				Add profile photo
			</button>
		{/if}

		<!-- Title & Description -->
		<div class="text-center">
			{#if editable}
				<Input
					id="page-title"
					bind:value={title}
					placeholder="My Page"
					class="text-2xl md:text-4xl font-bold text-center border-0 focus:ring-2 focus:ring-accent/20"
					onblur={() => onTitleUpdate?.(title)}
				/>
				{#if description !== undefined}
					<Input
						id="page-description"
						bind:value={description}
						placeholder="Add a description..."
						class="mt-2 text-lg text-center text-muted border-0 focus:ring-2 focus:ring-accent/20"
						onblur={() => onDescriptionUpdate?.(description)}
					/>
				{/if}
			{:else}
				<h1 class="text-4xl md:text-5xl font-bold mb-2">
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
</header>
