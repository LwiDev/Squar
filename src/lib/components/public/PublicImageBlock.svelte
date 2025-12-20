<script lang="ts">
	import type { Block } from '$lib/types/models';

	interface Props {
		block: Block;
	}

	let { block }: Props = $props();

	const imageUrl = block.data.imageUrl || '';
</script>

{#if imageUrl}
	<div class="h-full w-full overflow-hidden rounded-md">
		<img src={imageUrl} alt="" class="h-full w-full object-cover" />
	</div>
{/if}
