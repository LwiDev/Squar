<script lang="ts">
	import { Button, Input, Card } from '$lib/components/ui';
	import { Container } from '$lib/components/layout';
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let slug = $state('');
	let loading = $state(false);
</script>

<Container size="sm" class="flex items-center justify-center py-10 md:py-20">
	<Card class="w-full max-w-md p-8">
		<div class="mb-6">
			<h1 class="text-3xl font-bold mb-2">Choose your username</h1>
			<p class="text-muted">
				This will be your page URL. You can change it later.
			</p>
		</div>

		<form
			method="POST"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}
			class="space-y-4"
		>
			<div>
				<label for="slug" class="block text-sm font-medium mb-2">Username</label>
				<div class="flex items-center gap-2 mb-2">
					<span class="text-sm text-muted whitespace-nowrap">squar.me/</span>
					<Input
						id="slug"
						name="slug"
						type="text"
						value={slug}
						oninput={(e) => {
							slug = e.currentTarget.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
							e.currentTarget.value = slug;
						}}
						placeholder="yourname"
						required
						disabled={loading}
						class="flex-1"
					/>
				</div>
				<p class="text-xs text-muted">
					Lowercase letters, numbers, and hyphens only (3-30 characters)
				</p>
			</div>

			{#if form?.error}
				<p class="text-sm text-red-500">{form.error}</p>
			{/if}

			<Button type="submit" class="w-full" disabled={loading || !slug}>
				{loading ? 'Creating...' : 'Continue'}
			</Button>
		</form>

		<p class="mt-6 text-center text-xs text-muted">
			You'll be able to change your username anytime in the editor
		</p>
	</Card>
</Container>
