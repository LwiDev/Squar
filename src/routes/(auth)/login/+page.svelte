<script lang="ts">
    import { Button, Input, Card } from "$lib/components/ui";
    import { Container } from "$lib/components/layout";
    import PageHead from "$lib/components/PageHead.svelte";
    import { signIn } from "$lib/auth/client";
    import { goto, invalidateAll } from "$app/navigation";

    let email = $state("");
    let password = $state("");
    let error = $state("");
    let loading = $state(false);

    async function handleLogin() {
        if (!email || !password) {
            error = "Email and password are required";
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
            goto("/editor");
        } catch (e) {
            error = "Invalid email or password";
        } finally {
            loading = false;
        }
    }
</script>

<PageHead
    title="Login"
    description="Sign in to your Squar account"
/>

<Container size="sm" class="flex items-center justify-center py-10 md:py-20">

	<Card class="w-full max-w-md p-8">
        <div class="mb-6">
            <h1 class="text-3xl font-bold mb-2">Login</h1>
            <p class="text-muted">Sign in to your Squar.me account</p>
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
                    >Email</label
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
                    >Password</label
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
                <p class="text-sm text-red-500">{error}</p>
            {/if}

            <Button type="submit" class="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
            </Button>
        </form>

        <p class="mt-6 text-center text-sm text-muted">
            Don't have an account?
            <a href="/signup" class="text-text hover:underline font-medium"
                >Sign up</a
            >
        </p>
    </Card>
</Container>
