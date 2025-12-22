<script lang="ts">
	interface Props {
		photoUrl?: string;
		visibility: 'photo' | 'letter' | 'hidden';
		size: 'small' | 'medium' | 'large';
		shape: 'circle' | 'square' | 'rounded';
		username?: string;
		userEmail?: string;
	}

	let { photoUrl, visibility, size, shape, username, userEmail }: Props = $props();

	const displayName = $derived(() => {
		if (username) return username;
		if (!userEmail) return 'user';
		const emailLocal = userEmail.split('@')[0];
		return emailLocal.length > 10 ? emailLocal.substring(0, 10) : emailLocal;
	});

	const firstLetter = $derived(displayName().charAt(0).toUpperCase());

	const sizeClasses = {
		small: 'h-16 w-16 text-xl',
		medium: 'h-24 w-24 text-2xl',
		large: 'h-32 w-32 text-4xl'
	};

	const shapeClasses = {
		circle: 'rounded-full',
		square: 'rounded-none',
		rounded: 'rounded-lg'
	};
</script>

<div class="flex items-center justify-center p-2 bg-border/30 rounded-lg">
	{#if visibility === 'hidden'}
		<div class="h-24 w-24 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
			<span class="text-xs text-muted">Hidden</span>
		</div>
	{:else if visibility === 'photo' && photoUrl}
		<img
			src={photoUrl}
			alt="Profile"
			class="{sizeClasses[size]} {shapeClasses[shape]} object-cover"
		/>
	{:else}
		<!-- Letter fallback (same style as EditorToolbar) -->
		<div
			class="{sizeClasses[size]} {shapeClasses[shape]} bg-accent text-white flex items-center justify-center font-bold"
		>
			{firstLetter}
		</div>
	{/if}
</div>
