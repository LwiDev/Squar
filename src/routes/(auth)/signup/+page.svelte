<script lang="ts">
	import { Button, Input, Card } from '$lib/components/ui';
	import { Container } from '$lib/components/layout';
	import PageHead from '$lib/components/PageHead.svelte';
	import { signUp } from '$lib/auth/client';
	import { goto, invalidateAll } from '$app/navigation';
	import { nanoid } from 'nanoid';
    import { t } from 'svelte-i18n';

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSignup() {
		if (!email || !password || !confirmPassword) {
			error = 'auth.fields_required';
			return;
		}

		if (password !== confirmPassword) {
			error = 'auth.passwords_mismatch';
			return;
		}

		if (password.length < 8) {
			error = 'auth.password_min_length';
			return;
		}

		loading = true;
		error = '';

		try {
			await signUp({
				email,
				password,
				name: email.split('@')[0]
			});

			// Create empty page for the user
			const slug = `user-${nanoid(8)}`;
			await fetch('/api/pages', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					slug,
					settings: {
						title: 'My Page',
						description: '',
						theme: {
							background: '#ffffff',
							text: '#111111',
							accent: '#000000'
						}
					},
					layout: [],
					published: false
				})
			});

			await invalidateAll();
			goto(`/${slug}`);
		} catch (e: any) {
			error = e.message || 'auth.failed_create';
		} finally {
			loading = false;
		}
	}
</script>

<PageHead
	title={$t('auth.create_account')}
	description={$t('auth.create_account_title')}
/>

<Container size="sm" class="flex items-center justify-center py-10 md:py-20">
	<Card class="w-full max-w-md p-8">
		<div class="mb-6">
			<h1 class="text-3xl font-bold mb-2">{$t('auth.create_account')}</h1>
			<p class="text-muted">{$t('auth.create_account_title')}</p>
		</div>

		<form onsubmit={(e) => { e.preventDefault(); handleSignup(); }} class="space-y-4">
			<div>
				<label for="email" class="block text-sm font-medium mb-1.5">{$t('auth.email')}</label>
				<Input
					id="email"
					type="email"
					value={email}
					oninput={(e) => email = e.currentTarget.value}
					placeholder="you@example.com"
					disabled={loading}
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium mb-1.5">{$t('auth.password')}</label>
				<Input
					id="password"
					type="password"
					value={password}
					oninput={(e) => password = e.currentTarget.value}
					placeholder="••••••••"
					disabled={loading}
				/>
			</div>

			<div>
				<label for="confirm-password" class="block text-sm font-medium mb-1.5"
					>{$t('auth.confirm_password')}</label
				>
				<Input
					id="confirm-password"
					type="password"
					value={confirmPassword}
					oninput={(e) => confirmPassword = e.currentTarget.value}
					placeholder="••••••••"
					disabled={loading}
				/>
			</div>

			{#if error}
				<p class="text-sm text-red-500">{$t(error)}</p>
			{/if}

			<Button type="submit" class="w-full" disabled={loading}>
				{loading ? $t('auth.creating_account') : $t('auth.create_account_button')}
			</Button>
		</form>

		<p class="mt-6 text-center text-sm text-muted">
			{$t('auth.has_account')}
			<a href="/login" class="text-text hover:underline font-medium">{$t('auth.sign_in')}</a>
		</p>
	</Card>
</Container>
