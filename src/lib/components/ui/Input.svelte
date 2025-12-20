<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { Eye, EyeOff } from 'lucide-svelte';

	interface Props extends HTMLInputAttributes {
		error?: string;
	}

	let { error, type, class: className, ...rest }: Props = $props();

	let showPassword = $state(false);
	let inputType = $derived(type === 'password' && showPassword ? 'text' : type);

	const baseClasses =
		'w-full h-10 px-3 text-sm text-text bg-background border rounded-md transition-all duration-200 focus:outline-none focus:border-text focus:ring-1 focus:ring-text';

	const classes = $derived(
		`${baseClasses} ${error ? 'border-red-500' : 'border-border'} ${type === 'password' ? 'pr-10' : ''} ${className || ''}`
	);
</script>

<div class="w-full relative">
	<input class={classes} type={inputType} {...rest} />

	{#if type === 'password'}
		<button
			type="button"
			class="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
			onclick={() => showPassword = !showPassword}
			tabindex="-1"
		>
			{#if showPassword}
				<EyeOff size={18} />
			{:else}
				<Eye size={18} />
			{/if}
		</button>
	{/if}

	{#if error}
		<p class="mt-1 text-xs text-red-500">{error}</p>
	{/if}
</div>
