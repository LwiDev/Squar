<script lang="ts">
    import { Button, Input, Card } from "$lib/components/ui";
    import { Container } from "$lib/components/layout";
    import PageHead from "$lib/components/PageHead.svelte";
    import { signIn } from "$lib/auth/client";
    import { goto, invalidateAll } from "$app/navigation";
    import { page } from "$app/stores";
    import { t } from "svelte-i18n";

    let email = $state("");
    let password = $state("");
    let error = $state("");
    let loading = $state(false);

    async function handleLogin() {
        if (!email || !password) {
            error = "auth.fields_required";
            return;
        }

        loading = true;
        error = "";

        try {
            await signIn({
                email,
                password,
            });
            await invalidateAll();
            // Redirect to user's page after login
            if ($page.data.page?.slug) {
                goto(`/${$page.data.page.slug}`);
            }
        } catch (e) {
            error = "auth.invalid_credentials";
        } finally {
            loading = false;
        }
    }
</script>

<PageHead
    title={$t('common.login')}
    description={$t('auth.sign_in_title')}
/>

<Container size="sm" class="flex items-center justify-center py-10 md:py-20">

	<Card class="w-full max-w-md p-8">
        <div class="mb-6">
            <h1 class="text-3xl font-bold mb-2">{$t('common.login')}</h1>
            <p class="text-muted">{$t('auth.sign_in_title')}</p>
        </div>

        <form
            onsubmit={(e) => {
                e.preventDefault();
                handleLogin();
            }}
            class="space-y-4"
        >
            <div>
                <label for="email" class="block text-sm font-medium mb-1.5"
                    >{$t('auth.email')}</label
                >
                <Input
                    id="email"
                    type="email"
                    value={email}
                    oninput={(e) => (email = e.currentTarget.value)}
                    placeholder="you@example.com"
                    disabled={loading}
                />
            </div>

            <div>
                <label for="password" class="block text-sm font-medium mb-1.5"
                    >{$t('auth.password')}</label
                >
                <Input
                    id="password"
                    type="password"
                    value={password}
                    oninput={(e) => (password = e.currentTarget.value)}
                    placeholder="••••••••"
                    disabled={loading}
                />
            </div>

            {#if error}
                <p class="text-sm text-red-500">{$t(error)}</p>
            {/if}

            <Button type="submit" class="w-full" disabled={loading}>
                {loading ? $t('auth.signing_in') : $t('auth.sign_in_button')}
            </Button>
        </form>

        <p class="mt-6 text-center text-sm text-muted">
            {$t('auth.no_account')}
            <a href="/signup" class="text-text hover:underline font-medium"
                >{$t('auth.signup')}</a
            >
        </p>
    </Card>
</Container>
