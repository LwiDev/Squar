<script lang="ts">
	import type { PageSettings } from '$lib/types/models';

	interface Props {
		settings: PageSettings;
	}

	let { settings }: Props = $props();

	const photo = $derived(settings.profilePhoto);
	const visibility = $derived(photo?.visibility || 'letter');
	const size = $derived(photo?.size || 'medium');
	const shape = $derived(photo?.shape || 'circle');

	// Extract first letter from title for fallback
	const firstLetter = $derived(settings.title?.charAt(0).toUpperCase() || 'S');

	// Shape classes
	const shapeClasses = {
		circle: 'rounded-full',
		square: 'rounded-none',
		rounded: 'rounded-xl'
	};

	// Responsive size classes (mobile-first)
	const responsiveSizeMap = {
		small: 'w-12 h-12 sm:w-16 sm:h-16',
		medium: 'w-16 h-16 sm:w-24 sm:h-24',
		large: 'w-20 h-20 sm:w-32 sm:h-32'
	};

	const textSizeMap = {
		small: 'text-lg sm:text-xl',
		medium: 'text-xl sm:text-2xl',
		large: 'text-2xl sm:text-4xl'
	};
</script>

{#if visibility === 'photo' && photo?.url}
	<img
		src={photo.url}
		alt="{settings.title} profile"
		class="{responsiveSizeMap[size]} {shapeClasses[shape]} object-cover"
	/>
{:else if visibility === 'letter'}
	<!-- Stylized letter (matching EditorToolbar style) -->
	<div
		class="{responsiveSizeMap[size]} {shapeClasses[shape]} bg-accent text-white flex items-center justify-center font-bold {textSizeMap[
			size
		]}"
	>
		{firstLetter}
	</div>
{/if}
