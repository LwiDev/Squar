<script lang="ts">
	import type { Block } from '$lib/types/models';

	interface Props {
		block: Block;
	}

	let { block }: Props = $props();

	const text = block.data.text || 'Heading';
</script>

<div class="h-full w-full p-4 flex items-center">
	<h2 class="text-2xl font-bold">{text}</h2>
</div>
