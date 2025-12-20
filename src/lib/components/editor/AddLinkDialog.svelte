<script lang="ts">
	import { Modal, Input, Button } from '$lib/components/ui';
	import { detectLinkInfo } from '$lib/utils/linkDetector';

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
	let fetching = $state(false);

	// Detect link info when URL changes
	$effect(() => {
		if (url) {
			const info = detectLinkInfo(url);
			detectedTitle = info.title;
			detectedIconSvg = info.iconSvg;
			detectedIconHex = info.iconHex;

			// Fetch social data for supported platforms (Instagram, TikTok)
			const hostname = new URL(url).hostname.replace('www.', '');
			if (hostname === 'instagram.com' || hostname === 'tiktok.com' || hostname === 'vm.tiktok.com') {
				fetchSocialData(url);
			} else {
				socialData = undefined;
			}
		} else {
			detectedTitle = '';
			detectedIconSvg = undefined;
			detectedIconHex = undefined;
			socialData = undefined;
		}
	});

	async function fetchSocialData(url: string) {
		fetching = true;
		try {
			const response = await fetch('/api/social/fetch', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url })
			});

			if (response.ok) {
				const data = await response.json();
				socialData = data;
				// Update title with username if available
				if (data.username) {
					detectedTitle = data.displayName || data.username;
				}
			}
		} catch (e) {
			console.error('Failed to fetch social data:', e);
		} finally {
			fetching = false;
		}
	}

	function handleAdd() {
		if (url) {
			onAdd(url, detectedTitle, detectedIconSvg, detectedIconHex, socialData);
			url = '';
			socialData = undefined;
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
			<div class="space-y-3">
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
						{#if socialData?.username}
							<p class="text-xs text-muted">@{socialData.username}</p>
						{:else}
							<p class="text-xs text-muted truncate">{url}</p>
						{/if}
					</div>
					{#if fetching}
						<div class="text-xs text-muted">Loading...</div>
					{/if}
				</div>

				{#if socialData?.images && socialData.images.length > 0}
					<div class="grid grid-cols-3 gap-2">
						{#each socialData.images.slice(0, 6) as image}
							<div class="aspect-square bg-secondary/50 rounded overflow-hidden">
								<img src={`/api/proxy-image?url=${encodeURIComponent(image)}`} alt="" class="w-full h-full object-cover" />
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<div class="flex justify-end gap-2">
			<Button variant="secondary" onclick={onClose}>Cancel</Button>
			<Button onclick={handleAdd} disabled={!url}>Add</Button>
		</div>
	</div>
</Modal>
