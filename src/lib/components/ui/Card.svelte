<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { children, class: className, ...rest }: Props = $props();

	const classes = $derived(`bg-background border border-border rounded-md ${className || ''}`);
</script>

<div class={classes} {...rest}>
	{@render children()}
</div>
