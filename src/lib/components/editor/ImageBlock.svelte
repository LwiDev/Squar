<script lang="ts">
	import type { Block } from '$lib/types/models';
	import { Image as ImageIcon, Upload } from 'lucide-svelte';
    import { t } from 'svelte-i18n';

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
			alert($t('blocks.image.error_type'));
			return;
		}

		// Check file size
		if (file.size > MAX_FILE_SIZE) {
			alert($t('blocks.image.error_size'));
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
			alert($t('blocks.image.error_failed'));
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
				<p class="text-sm text-muted">{$t('blocks.image.uploading')}</p>
			{:else}
				<ImageIcon size={32} class="text-muted mb-2" />
				<p class="text-sm text-muted">{$t('blocks.image.add')}</p>
				<p class="text-xs text-muted mt-1">{$t('blocks.image.max_size')}</p>
			{/if}
		</button>
	{/if}
</div>
