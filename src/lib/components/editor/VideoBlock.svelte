<script lang="ts">
	import type { Block } from '$lib/types/models';
	import { Input } from '$lib/components/ui';
	import { parseVideoUrl } from '$lib/utils/videoParser';
	import { Video, Upload, Link as LinkIcon } from 'lucide-svelte';

	interface Props {
		block: Block;
		onUpdate?: (data: any) => void;
	}

	let { block, onUpdate }: Props = $props();

	let url = $state(block.data.url || '');
	let videoUrl = $state(block.data.videoUrl || '');
	let sourceType = $state<'upload' | 'link'>(block.data.sourceType || 'link');
	let editing = $state(!block.data.url && !block.data.videoUrl);
	let uploading = $state(false);
	let fileInput: HTMLInputElement;

	const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
	const videoInfo = $derived(url ? parseVideoUrl(url) : null);

	async function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		// Only accept videos
		if (!file.type.startsWith('video/')) {
			alert('Only video files are allowed');
			return;
		}

		// Check file size
		if (file.size > MAX_FILE_SIZE) {
			alert('Video size must be less than 10 MB');
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
			videoUrl = data.url;
			onUpdate?.({ videoUrl: data.url, filename: data.filename, sourceType: 'upload' });
			editing = false;
		} catch (error) {
			alert('Failed to upload video');
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
				sourceType: 'link'
			});
			editing = false;
		}
	}

	function handleEdit() {
		editing = true;
	}
</script>

<input
	type="file"
	accept="video/*"
	bind:this={fileInput}
	onchange={handleFileSelect}
	class="hidden"
/>

<div class="h-full w-full p-4 flex flex-col gap-3">
	{#if editing}
		<div class="flex flex-col gap-3">
			<!-- Source type selection -->
			<div class="flex gap-2">
				<button
					onclick={() => (sourceType = 'upload')}
					class="flex-1 px-3 py-2 rounded border-2 transition-colors {sourceType === 'upload'
						? 'border-accent bg-accent/10 text-accent'
						: 'border-border hover:border-text'}"
				>
					<Upload size={16} class="inline mr-2" />
					Upload Video
				</button>
				<button
					onclick={() => (sourceType = 'link')}
					class="flex-1 px-3 py-2 rounded border-2 transition-colors {sourceType === 'link'
						? 'border-accent bg-accent/10 text-accent'
						: 'border-border hover:border-text'}"
				>
					<LinkIcon size={16} class="inline mr-2" />
					Video Link
				</button>
			</div>

			{#if sourceType === 'upload'}
				<button
					onclick={() => fileInput.click()}
					disabled={uploading}
					class="py-8 border-2 border-dashed border-border hover:border-accent rounded transition-colors flex flex-col items-center gap-2"
				>
					{#if uploading}
						<p class="text-sm text-muted">Uploading...</p>
					{:else}
						<Upload size={32} class="text-muted" />
						<p class="text-sm text-muted">Click to upload video</p>
						<p class="text-xs text-muted">Max 10 MB • MP4, WebM, MOV</p>
					{/if}
				</button>
			{:else}
				<div class="flex flex-col gap-2">
					<label class="text-sm font-medium">Video URL</label>
					<Input
						bind:value={url}
						placeholder="https://youtube.com/watch?v=..."
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								handleSaveUrl();
							}
						}}
					/>
					<p class="text-xs text-muted">Supports YouTube, Vimeo, and Loom</p>
					{#if url && !videoInfo}
						<p class="text-xs text-red-500">Invalid video URL</p>
					{/if}
					<button
						onclick={handleSaveUrl}
						disabled={!videoInfo}
						class="px-3 py-1.5 bg-accent text-white rounded text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Save
					</button>
				</div>
			{/if}
		</div>
	{:else if videoUrl}
		<!-- Uploaded video -->
		<div class="h-full w-full flex flex-col gap-2" ondblclick={handleEdit}>
			<video src={videoUrl} class="w-full h-full rounded object-contain" controls loop muted autoplay />
			<p class="text-xs text-muted text-center">Double-click to edit • Uploaded</p>
		</div>
	{:else if videoInfo}
		<!-- External video -->
		<div class="h-full w-full flex flex-col gap-2" ondblclick={handleEdit}>
			<iframe
				src={videoInfo.embedUrl}
				title="Video"
				frameborder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen
				class="w-full h-full rounded"
			></iframe>
			<p class="text-xs text-muted text-center">
				Double-click to edit • {videoInfo.platform}
			</p>
		</div>
	{:else}
		<div class="h-full w-full flex flex-col items-center justify-center gap-2 text-muted">
			<Video size={32} />
			<p class="text-sm">Click to add video</p>
		</div>
	{/if}
</div>
