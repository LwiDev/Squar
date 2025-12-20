<script lang="ts">
	import type { Block } from '$lib/types/models';

	interface Props {
		block: Block;
	}

	let { block }: Props = $props();

	const imageUrl = block.data.imageUrl || '';
</script>

{#if imageUrl}
	<div class="h-full w-full overflow-hidden rounded-md bg-secondary/50">
		<img src={imageUrl} alt="" class="h-full w-full object-contain" />
	</div>
{/if}
