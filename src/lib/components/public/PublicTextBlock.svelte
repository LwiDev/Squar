<script lang="ts">
	import type { Block } from '$lib/types/models';

	interface Props {
		block: Block;
	}

	let { block }: Props = $props();

	const text = block.data.text || 'Text block';
</script>

<div class="h-full w-full p-4 flex items-center">
	<p class="text-base leading-relaxed">{text}</p>
</div>
