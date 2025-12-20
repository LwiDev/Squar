<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import { page } from "$app/stores";
    import logo from "$lib/assets/images/logos/logo.png";
    import { Button } from "$lib/components/ui";
    import { signOut } from "$lib/auth/client";
    import FloatingBar from "./FloatingBar.svelte";

    async function handleSignOut() {
        await signOut();
        await invalidateAll();
        goto("/");
    }
</script>

<FloatingBar position="top">
    <div class="flex items-center justify-between h-12">
            <div
                class="flex items-center gap-2 hover:opacity-70 transition-opacity cursor-pointer pl-2"
                onclick={() => goto("/")}
                role="button"
                tabindex="0"
                onkeydown={(e) => e.key === "Enter" && goto("/")}
            >
                <img
                    src={logo}
                    loading="lazy"
                    alt="Squar Logo"
                    class="w-5 h-auto"
                />
                <h1 class="text-sm font-bold tracking-tight">SQUAR</h1>
            </div>
            <nav class="flex items-center gap-1 pr-1">
                {#if $page.data.user}
                    <a href="/dashboard">
                        <Button variant="primary" size="sm" class="h-8 text-xs"
                            >Dashboard</Button
                        >
                    </a>
                    <Button
                        variant="secondary"
                        size="sm"
                        onclick={handleSignOut}
                        class="h-8 text-xs">Sign out</Button
                    >
                {:else}
                    <Button
                        size="sm"
                        onclick={() => goto("/signup")}
                        class="h-8 text-xs px-6 font-bold tracking-wide"
                    >
                        Join Squar
                    </Button>
                {/if}
            </nav>
        </div>
</FloatingBar>
