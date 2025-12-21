<script lang="ts">
	interface Props {
		orientation?: 'horizontal' | 'vertical';
		class?: string;
	}

	let { orientation = 'vertical', class: className = '' }: Props = $props();
</script>

<div
	class="{orientation === 'vertical' ? 'h-6 w-px' : 'h-px'} bg-border {className}"
></div>
