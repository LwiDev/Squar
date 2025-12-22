<script lang="ts">
	import { untrack } from 'svelte';
	import { Modal, Button } from '$lib/components/ui';
	import type { PageSettings } from '$lib/types/models';

	interface Props {
		open: boolean;
		onClose: () => void;
		titleSize: PageSettings['titleSize'];
		onUpdate: (size: PageSettings['titleSize']) => void;
	}

	let { open, onClose, titleSize, onUpdate }: Props = $props();

	let selectedSize = $state(untrack(() => titleSize || 'medium'));

	$effect(() => {
		if (open) {
			selectedSize = titleSize || 'medium';
		}
	});

	function handleSave() {
		onUpdate(selectedSize);
		onClose();
	}
</script>

<Modal bind:open {onClose} title="Title Settings" maxWidth="max-w-sm">
	<div class="space-y-6">
		<div class="space-y-4">
			<span class="block text-sm font-medium text-text"> Size </span>
			<div class="flex flex-col gap-2">
				<button
					class="w-full px-4 py-3 text-left border rounded-md transition-colors flex items-center justify-between group {selectedSize ===
					'small'
						? 'bg-accent text-background border-accent'
						: 'bg-background text-text border-border hover:border-accent'}"
					onclick={() => (selectedSize = 'small')}
				>
					<span>Small</span>
					<span class="text-xs opacity-70">20px</span>
				</button>
				<button
					class="w-full px-4 py-3 text-left border rounded-md transition-colors flex items-center justify-between group {selectedSize ===
					'medium'
						? 'bg-accent text-background border-accent'
						: 'bg-background text-text border-border hover:border-accent'}"
					onclick={() => (selectedSize = 'medium')}
				>
					<span>Medium</span>
					<span class="text-xs opacity-70">28px</span>
				</button>
				<button
					class="w-full px-4 py-3 text-left border rounded-md transition-colors flex items-center justify-between group {selectedSize ===
					'large'
						? 'bg-accent text-background border-accent'
						: 'bg-background text-text border-border hover:border-accent'}"
					onclick={() => (selectedSize = 'large')}
				>
					<span>Large</span>
					<span class="text-xs opacity-70">48px</span>
				</button>
			</div>
		</div>

		<div class="flex justify-end gap-2 pt-2">
			<Button variant="secondary" onclick={onClose}>Cancel</Button>
			<Button variant="primary" onclick={handleSave}>Save</Button>
		</div>
	</div>
</Modal>
