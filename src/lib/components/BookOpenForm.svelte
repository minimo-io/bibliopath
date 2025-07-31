<script lang="ts">
	import { BookOpen } from '@lucide/svelte';

	let newBookUrl = $state('');
	let newBookType: 'markdown' | 'text' = $state('markdown');

	function openBook() {
		if (!newBookUrl.trim()) {
			alert('Please enter a book URL');
			return;
		}

		const bookUrl = `/book?book=${encodeURIComponent(newBookUrl.trim())}&type=${newBookType}`;
		window.location.href = bookUrl;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			openBook();
		}
	}
</script>

<section class="mb-12">
	<h2 class="mb-6 text-2xl font-bold">Open a Book</h2>
	<div class="card bg-base-200 shadow-sm">
		<div class="card-body">
			<div class="form-control">
				<label class="label" for="newBookUrlInput">
					<span class="label-text font-medium">Book URL</span>
				</label>
				<div class="flex flex-col gap-2 sm:flex-row">
					<input
						id="newBookUrlInput"
						type="url"
						placeholder="https://raw.githubusercontent.com/README.md or https://gutenberg.org/files/..."
						class="input input-bordered w-full sm:flex-grow"
						bind:value={newBookUrl}
						onkeydown={handleKeydown}
					/>
					<select class="select select-bordered w-full sm:w-auto" bind:value={newBookType}>
						<option value="markdown">Markdown</option>
						<option value="text">Plain Text</option>
					</select>
					<button class="btn btn-primary w-full sm:w-auto" onclick={openBook}>
						<BookOpen size={18} />
						Open Book
					</button>
				</div>
				<div class="label mt-3 md:mt-2">
					<span class="label-text-alt text-base-content/70 text-xs text-wrap">
						Supports Markdown files (.md) and plain text books from Project Gutenberg
					</span>
				</div>
			</div>
		</div>
	</div>
</section>
