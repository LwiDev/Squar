<script lang="ts">
	let { children } = $props();
</script>

<div class="min-h-screen flex flex-col">
	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="w-full border-t border-border bg-background py-6">
		<div class="max-w-6xl mx-auto px-4">
			<div class="text-center">
				<p class="text-[10px] uppercase tracking-[0.2em] text-muted/40 font-bold">
					© {new Date().getFullYear()} <a href="/" class="hover:text-text/60 transition-colors">Squar.me</a> — Built for the open web.
				</p>
			</div>
		</div>
	</footer>
</div>
