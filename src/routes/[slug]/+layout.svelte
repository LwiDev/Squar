<script lang="ts">
	let { children } = $props();
</script>

<div class="min-h-screen flex flex-col">
	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="py-4 border-t border-border bg-background">
		<div class="max-w-6xl mx-auto px-4 text-center">
			<p class="text-xs text-muted">
				Built with <a href="/" class="hover:text-text transition-colors">Squar.me</a> © {new Date().getFullYear()}
			</p>
		</div>
	</footer>
</div>
