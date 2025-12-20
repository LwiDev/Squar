<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		children: Snippet;
		position?: 'top' | 'bottom';
		maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
	}

	let { children, position = 'top', maxWidth = '2xl', class: className, ...rest }: Props = $props();

	const maxWidthClasses = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl',
		'2xl': 'max-w-2xl'
	};

	const positionClasses = $derived(
		position === 'top'
			? 'sticky top-4 mb-4 mt-4'
			: 'fixed bottom-4'
	);

	const classes = $derived(
		`${positionClasses} z-40 w-full px-4 pointer-events-none ${className || ''}`
	);
</script>

<div class={classes} {...rest}>
	<div
		class="bg-background/70 backdrop-blur-xl border border-border rounded-sm px-4 py-2 shadow-sm pointer-events-auto {maxWidthClasses[maxWidth]} mx-auto"
	>
		{@render children()}
	</div>
</div>
