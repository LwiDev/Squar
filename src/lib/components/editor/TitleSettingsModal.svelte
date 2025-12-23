<script lang="ts">
	import { untrack } from 'svelte';
	import { Modal, Button } from '$lib/components/ui';
	import type { PageSettings } from '$lib/types/models';
    import { t } from 'svelte-i18n';

	interface Props {
		open: boolean;
		onClose: () => void;
		titleSize: PageSettings['titleSize'];
		onUpdate: (size: PageSettings['titleSize']) => void;
	}

	let { open = $bindable(), onClose, titleSize, onUpdate }: Props = $props();

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

<Modal bind:open {onClose} title={$t('editor.title_modal.title')} maxWidth="max-w-sm">
	<div class="space-y-6">
		<div class="space-y-4">
			<span class="block text-sm font-medium text-text"> {$t('editor.title_modal.size')} </span>
			<div class="flex flex-col gap-2">
				<button
					class="w-full px-4 py-3 text-left border rounded-md transition-colors flex items-center justify-between group {selectedSize ===
					'small'
						? 'bg-accent text-background border-accent'
						: 'bg-background text-text border-border hover:border-accent'}"
					onclick={() => (selectedSize = 'small')}
				>
					<span>{$t('editor.title_modal.sizes.small')}</span>
					<span class="text-xs opacity-70">20px</span>
				</button>
				<button
					class="w-full px-4 py-3 text-left border rounded-md transition-colors flex items-center justify-between group {selectedSize ===
					'medium'
						? 'bg-accent text-background border-accent'
						: 'bg-background text-text border-border hover:border-accent'}"
					onclick={() => (selectedSize = 'medium')}
				>
					<span>{$t('editor.title_modal.sizes.medium')}</span>
					<span class="text-xs opacity-70">28px</span>
				</button>
				<button
					class="w-full px-4 py-3 text-left border rounded-md transition-colors flex items-center justify-between group {selectedSize ===
					'large'
						? 'bg-accent text-background border-accent'
						: 'bg-background text-text border-border hover:border-accent'}"
					onclick={() => (selectedSize = 'large')}
				>
					<span>{$t('editor.title_modal.sizes.large')}</span>
					<span class="text-xs opacity-70">48px</span>
				</button>
			</div>
		</div>

		<div class="flex justify-end gap-2 pt-2">
			<Button variant="secondary" onclick={onClose}>{$t('common.cancel')}</Button>
			<Button variant="primary" onclick={handleSave}>{$t('common.save')}</Button>
		</div>
	</div>
</Modal>
