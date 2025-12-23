<script lang="ts">
	import { Modal, Input, Button } from '$lib/components/ui';
	import { detectLinkInfo } from '$lib/utils/linkDetector';
    import { t } from 'svelte-i18n';

	interface Props {
		open: boolean;
		onClose: () => void;
		onAdd: (url: string, title: string, iconSvg?: string, iconHex?: string, socialData?: any) => void;
	}

	let { open = $bindable(), onClose, onAdd }: Props = $props();

	let url = $state('');
	let detectedTitle = $state('');
	let detectedIconSvg = $state<string | undefined>(undefined);
	let detectedIconHex = $state<string | undefined>(undefined);
	let socialData = $state<any>(undefined);
	let adding = $state(false);

	// Just detect basic link info (icon, title) when URL changes
	$effect(() => {
		if (url) {
			try {
				const info = detectLinkInfo(url);
				detectedTitle = info.title;
				detectedIconSvg = info.iconSvg;
				detectedIconHex = info.iconHex;
			} catch (e) {
				// Invalid URL, ignore
			}
		} else {
			detectedTitle = '';
			detectedIconSvg = undefined;
			detectedIconHex = undefined;
		}
	});

	async function fetchSocialData(url: string): Promise<any> {
		try {
			const response = await fetch('/api/social/fetch', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url })
			});

			if (response.ok) {
				const data = await response.json();
				return data;
			}
		} catch (e) {
			console.error('Failed to fetch social data:', e);
		}
		return undefined;
	}

	async function handleAdd() {
		if (!url) return;

		adding = true;
		let finalSocialData = undefined;
		let finalTitle = detectedTitle;

		try {
			// Fetch social/Open Graph data for ALL links
			finalSocialData = await fetchSocialData(url);

			// Update title if we got better data
			if (finalSocialData?.displayName) {
				finalTitle = finalSocialData.displayName;
			} else if (finalSocialData?.title) {
				finalTitle = finalSocialData.title;
			}
		} catch (e) {
			console.error('Error processing social data:', e);
		}

		// Add the link
		onAdd(url, finalTitle, detectedIconSvg, detectedIconHex, finalSocialData);

		// Reset and close
		url = '';
		socialData = undefined;
		adding = false;
		onClose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleAdd();
		}
	}
</script>

<Modal {open} {onClose} title={$t('editor.link_modal.title')}>
	<div class="space-y-4">
		<div>
			<label class="block text-sm font-medium text-text mb-2">{$t('editor.link_modal.url_label')}</label>
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
				<div class="flex-1">
					<p class="text-sm font-medium text-text">{detectedTitle}</p>
					<p class="text-xs text-muted truncate">{url}</p>
				</div>
			</div>
		{/if}

		<div class="flex justify-end gap-2">
			<Button variant="secondary" onclick={onClose} disabled={adding}>{$t('common.cancel')}</Button>
			<Button onclick={handleAdd} disabled={!url || adding}>
				{#if adding}
					<span class="flex items-center gap-2">
						<svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						{$t('editor.link_modal.adding')}
					</span>
				{:else}
					{$t('common.add')}
				{/if}
			</Button>
		</div>
	</div>
</Modal>
