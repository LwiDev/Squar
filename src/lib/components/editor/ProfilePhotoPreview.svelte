<script lang="ts">
	interface Props {
		photoUrl?: string;
		visibility: 'photo' | 'letter' | 'hidden';
		size: 'small' | 'medium' | 'large';
		shape: 'circle' | 'square' | 'rounded';
		username?: string;
		userEmail?: string;
		editable?: boolean;
		onUpload?: (file: File) => void;
		uploading?: boolean;
	}

	let {
		photoUrl,
		visibility,
		size,
		shape,
		username,
		userEmail,
		editable = false,
		onUpload,
		uploading = false
	}: Props = $props();

	let fileInput: HTMLInputElement;

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

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file && onUpload) {
			onUpload(file);
			target.value = '';
		}
	}

	function handleClick() {
		if (editable && !uploading) {
			fileInput?.click();
		}
	}
</script>

<input
	type="file"
	accept="image/*"
	bind:this={fileInput}
	onchange={handleFileSelect}
	class="hidden"
/>

<button
	onclick={handleClick}
	class="relative group/photo {editable ? 'cursor-pointer' : 'cursor-default'} outline-none"
	disabled={!editable || uploading}
>
	{#if visibility === 'hidden'}
		<div
			class="h-24 w-24 flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-border/10"
		>
			<span class="text-xs text-muted">Hidden</span>
		</div>
	{:else if visibility === 'photo' && photoUrl}
		<img
			src={photoUrl}
			alt="Profile"
			class="{sizeClasses[size]} {shapeClasses[shape]} object-cover {editable
				? 'group-hover/photo:opacity-80'
				: ''} transition-opacity"
		/>
	{:else}
		<!-- Letter fallback (same style as EditorToolbar) -->
		<div
			class="{sizeClasses[size]} {shapeClasses[shape]} bg-accent text-white flex items-center justify-center font-bold {editable
				? 'group-hover/photo:opacity-80'
				: ''} transition-opacity"
		>
			{firstLetter}
		</div>
	{/if}

	{#if editable && uploading}
		<div
			class="absolute inset-0 flex items-center justify-center bg-background/40 {shapeClasses[
				shape
			]}"
		>
			<div
				class="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"
			></div>
		</div>
	{/if}
</button>
