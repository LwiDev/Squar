<script lang="ts">
	import { Modal, Input, Button } from '$lib/components/ui';
	import { detectLinkInfo } from '$lib/utils/linkDetector';

	interface Props {
		open: boolean;
		onClose: () => void;
		onAdd: (url: string, title: string, iconSvg?: string, iconHex?: string) => void;
	}

	let { open = $bindable(), onClose, onAdd }: Props = $props();

	let url = $state('');
	let detectedTitle = $state('');
	let detectedIconSvg = $state<string | undefined>(undefined);
	let detectedIconHex = $state<string | undefined>(undefined);

	// Detect link info when URL changes
	$effect(() => {
		if (url) {
			const info = detectLinkInfo(url);
			detectedTitle = info.title;
			detectedIconSvg = info.iconSvg;
			detectedIconHex = info.iconHex;
		} else {
			detectedTitle = '';
			detectedIconSvg = undefined;
			detectedIconHex = undefined;
		}
	});

	function handleAdd() {
		if (url) {
			onAdd(url, detectedTitle, detectedIconSvg, detectedIconHex);
			url = '';
			onClose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleAdd();
		}
	}
</script>

<Modal {open} {onClose} title="Add Link">
	<div class="space-y-4">
		<div>
			<label class="block text-sm font-medium text-text mb-2">URL</label>
			<Input
				type="url"
				value={url}
				oninput={(e) => (url = e.currentTarget.value)}
				onkeydown={handleKeydown}
				placeholder="https://instagram.com/username"
				autofocus
			/>
		</div>

		{#if detectedTitle}
			<div class="flex items-center gap-3 p-3 bg-secondary/50 rounded-md border border-border">
				{#if detectedIconSvg && detectedIconHex}
					<div
						class="w-10 h-10 flex items-center justify-center rounded-md"
						style="background-color: #{detectedIconHex};"
					>
						{@html `<svg viewBox="0 0 24 24" class="w-6 h-6" fill="white">${detectedIconSvg}</svg>`}
					</div>
				{/if}
				<div>
					<p class="text-sm font-medium text-text">{detectedTitle}</p>
					<p class="text-xs text-muted truncate">{url}</p>
				</div>
			</div>
		{/if}

		<div class="flex justify-end gap-2">
			<Button variant="secondary" onclick={onClose}>Cancel</Button>
			<Button onclick={handleAdd} disabled={!url}>Add</Button>
		</div>
	</div>
</Modal>
