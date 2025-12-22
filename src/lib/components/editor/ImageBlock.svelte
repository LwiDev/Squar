<script lang="ts">
	import type { Block } from '$lib/types/models';
	import { Image as ImageIcon, Upload } from 'lucide-svelte';

	interface Props {
		block: Block;
		editable?: boolean;
		onUpdate?: (data: any) => void;
	}

	let { block, editable = true, onUpdate }: Props = $props();

	let imageUrl = $state(block.data.imageUrl || '');
	let uploading = $state(false);
	let fileInput: HTMLInputElement;

	const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

	async function handleFileSelect(e: Event) {
		if (!editable) return;

		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		// Only accept images and GIFs
		if (!file.type.startsWith('image/')) {
			alert('Only images and GIFs are allowed');
			return;
		}

		// Check file size
		if (file.size > MAX_FILE_SIZE) {
			alert('File size must be less than 10 MB');
			return;
		}

		uploading = true;

		try {
			const formData = new FormData();
			formData.append('file', file);

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				throw new Error('Upload failed');
			}

			const data = await response.json();
			imageUrl = data.url;
			onUpdate?.({ imageUrl: data.url, filename: data.filename });
		} catch (error) {
			alert('Failed to upload image');
		} finally {
			uploading = false;
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

<div class="h-full w-full">
	{#if imageUrl}
		{#if editable}
			<button
				onclick={() => fileInput.click()}
				class="h-full w-full group relative overflow-hidden bg-secondary/50"
			>
				<img src={imageUrl} alt="" class="h-full w-full object-contain" />
				<div
					class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
				>
					<Upload size={24} class="text-white" />
				</div>
			</button>
		{:else}
			<div class="h-full w-full overflow-hidden bg-secondary/50">
				<img src={imageUrl} alt="" class="h-full w-full object-contain" />
			</div>
		{/if}
	{:else if editable}
		<button
			onclick={() => fileInput.click()}
			disabled={uploading}
			class="h-full w-full flex flex-col items-center justify-center bg-border/20 hover:bg-border/30 transition-colors"
		>
			{#if uploading}
				<p class="text-sm text-muted">Uploading...</p>
			{:else}
				<ImageIcon size={32} class="text-muted mb-2" />
				<p class="text-sm text-muted">Click to add image or GIF</p>
				<p class="text-xs text-muted mt-1">Max 10 MB</p>
			{/if}
		</button>
	{/if}
</div>
