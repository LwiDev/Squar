<script lang="ts">
	import { Button } from '$lib/components/ui';
	import FloatingBar from '$lib/components/layout/FloatingBar.svelte';
	import { Type, Link as LinkIcon, Image as ImageIcon, Undo2, Redo2, Eye, Globe } from 'lucide-svelte';

	interface Props {
		onAddText: () => void;
		onAddLink: () => void;
		onAddImage: () => void;
		onUndo: () => void;
		onRedo: () => void;
		onPublish: () => void;
		canUndo: boolean;
		canRedo: boolean;
		saving: boolean;
		autoSaving: boolean;
		published: boolean;
		viewUrl?: string;
	}

	let {
		onAddText,
		onAddLink,
		onAddImage,
		onUndo,
		onRedo,
		onPublish,
		canUndo,
		canRedo,
		saving,
		autoSaving,
		published,
		viewUrl
	}: Props = $props();
</script>

<FloatingBar position="bottom" maxWidth="xl">
	<div class="flex items-center justify-between h-12 gap-4">
		<!-- Add blocks -->
		<div class="flex gap-2">
			<Button size="sm" variant="secondary" onclick={onAddText}>
				<Type size={16} class="mr-1.5" />
				Text
			</Button>
			<Button size="sm" variant="secondary" onclick={onAddLink}>
				<LinkIcon size={16} class="mr-1.5" />
				Link
			</Button>
			<Button size="sm" variant="secondary" onclick={onAddImage}>
				<ImageIcon size={16} class="mr-1.5" />
				Image
			</Button>
		</div>

		<!-- Undo/Redo -->
		<div class="flex gap-1">
			<Button
				size="sm"
				variant="ghost"
				onclick={onUndo}
				disabled={!canUndo}
				title="Undo (Cmd+Z)"
			>
				<Undo2 size={16} />
			</Button>
			<Button
				size="sm"
				variant="ghost"
				onclick={onRedo}
				disabled={!canRedo}
				title="Redo (Cmd+Shift+Z)"
			>
				<Redo2 size={16} />
			</Button>
		</div>

		<!-- Status & actions -->
		<div class="flex items-center gap-2">
			{#if autoSaving}
				<span class="text-xs text-muted">Saving...</span>
			{/if}

			{#if published && viewUrl}
				<a href={viewUrl} target="_blank">
					<Button size="sm" variant="ghost">
						<Eye size={16} />
					</Button>
				</a>
			{/if}

			<Button size="sm" variant="primary" onclick={onPublish} disabled={saving}>
				<Globe size={16} class="mr-1.5" />
				{published ? 'Unpublish' : 'Publish'}
			</Button>
		</div>
	</div>
</FloatingBar>
