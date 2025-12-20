<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
		size?: 'sm' | 'md' | 'lg' | 'xl';
	}

	let { children, size = 'lg', class: className, ...rest }: Props = $props();

	const sizeClasses = {
		sm: 'max-w-2xl',
		md: 'max-w-4xl',
		lg: 'max-w-6xl',
		xl: 'max-w-7xl'
	};

	const classes = $derived(`w-full ${sizeClasses[size]} mx-auto px-4 sm:px-6 ${className || ''}`);
</script>

<div class={classes} {...rest}>
	{@render children()}
</div>
