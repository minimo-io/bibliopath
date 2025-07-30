<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { BookOpen, Trash2, Clock, Plus, ExternalLink } from '@lucide/svelte';
	import type { SavedBook } from '$lib/types';
	import { loadSavedBooks, removeBook as removeBookService } from '$lib/services/saved.services';

	let savedBooks: SavedBook[] = $state([]);
	let newBookUrl = $state('');
	let newBookType: 'markdown' | 'text' = $state('markdown');

	let searchQuery = $state('');

	onMount(() => {
		savedBooks = loadSavedBooks();
	});

	function generateBookUrl(book: SavedBook): string {
		return `/book?book=${encodeURIComponent(book.url)}&type=${book.fileType}&author=${book.author}&title=${book.title}`;
	}

	function handleRemoveBook(bookId: string) {
		if (!confirm('Are you sure you want to remove this book from your library?')) {
			return;
		}
		removeBookService(bookId);
		savedBooks = savedBooks.filter((book) => book.id !== bookId);
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function getTimeAgo(dateString: string): string {
		const now = new Date().getTime();
		const date = new Date(dateString).getTime();
		const diffInMs = now - date;
		const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

		if (diffInDays === 0) return 'Today';
		if (diffInDays === 1) return 'Yesterday';
		if (diffInDays < 7) return `${diffInDays} days ago`;
		if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
		return `${Math.floor(diffInDays / 30)} months ago`;
	}

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

<svelte:head>
	<title>Saved Books - Bibliopath</title>
	<meta name="description" content="Your stuff" />
</svelte:head>

<div class="bg-base-100 min-h-screen">
	<main class="container mx-auto max-w-6xl px-4 py-8">
		<!-- Quick Open Section -->
		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-bold">Open a Book</h2>
			<div class="card bg-base-200 shadow-sm">
				<div class="card-body">
					<div class="form-control">
						<label class="label">
							<span class="label-text font-medium">Book URL</span>
						</label>
						<div class="flex gap-2">
							<input
								type="url"
								placeholder="https://example.com/book.md or https://gutenberg.org/files/..."
								class="input input-bordered flex-1"
								bind:value={newBookUrl}
								onkeydown={handleKeydown}
							/>
							<select class="select select-bordered" bind:value={newBookType}>
								<option value="markdown">Markdown</option>
								<option value="text">Plain Text</option>
							</select>
							<button class="btn btn-primary" onclick={openBook}>
								<BookOpen size={18} />
								Open Book
							</button>
						</div>
						<div class="label">
							<span class="label-text-alt text-base-content/70">
								Supports Markdown files (.md) and plain text books from Project Gutenberg
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Saved Books Section -->
		{#if savedBooks.length > 0}
			<section class="mb-12">
				<div class="mb-6 flex items-center justify-between">
					<h2 class="text-2xl font-bold">Your Library</h2>
					<span class="badge badge-primary">
						{savedBooks.length} book{savedBooks.length !== 1 ? 's' : ''}
					</span>
				</div>

				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each savedBooks as book (book.id)}
						<div class="card bg-base-200 shadow-sm transition-shadow hover:shadow-md">
							<div class="card-body p-4">
								<div class="mb-3 flex items-start justify-between">
									<div class="min-w-0 flex-1">
										<h3 class="mb-1 line-clamp-2 text-base leading-tight font-semibold">
											{book.title}
										</h3>
										<p class="text-base-content/70 truncate text-sm">
											by {book.author}
										</p>
									</div>
									<button
										class="btn btn-ghost btn-xs btn-circle ml-2"
										onclick={() => handleRemoveBook(book.id)}
										title="Remove from library"
									>
										<Trash2 size={14} />
									</button>
								</div>

								<div class="text-base-content/60 mb-3 flex items-center gap-2 text-xs">
									<Clock size={12} />
									<span>
										{#if book.lastRead}
											Read {getTimeAgo(book.lastRead)}
										{:else}
											Saved {getTimeAgo(book.savedAt)}
										{/if}
									</span>
									<span class="badge badge-xs badge-outline">
										{book.fileType}
									</span>
								</div>

								<div class="card-actions justify-between">
									<a href={generateBookUrl(book)} class="btn btn-primary btn-sm flex-1">
										<BookOpen size={16} />
										{book.lastRead ? 'Continue Reading' : 'Start Reading'}
									</a>
									<a
										href={book.url}
										target="_blank"
										rel="noopener noreferrer"
										class="btn btn-ghost btn-sm btn-square"
										title="Open original source"
									>
										<ExternalLink size={16} />
									</a>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{:else}
			<section class="mb-12">
				<div class="card bg-base-200">
					<div class="card-body py-12 text-center">
						<BookOpen size={48} class="text-base-content/50 mx-auto mb-4" />
						<h3 class="mb-2 text-lg font-semibold">No Saved Books Yet</h3>
						<p class="text-base-content/70 mb-4">
							Start reading a book and click the heart icon to save it to your library
						</p>
					</div>
				</div>
			</section>
		{/if}

		<!-- Examples Section -->
		<section class="mb-12">
			<h2 class="mb-6 text-2xl font-bold">Try These Examples</h2>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="card bg-base-200 shadow-sm">
					<div class="card-body">
						<h3 class="card-title text-lg">Project Gutenberg</h3>
						<p class="text-base-content/70 mb-4 text-sm">
							Classic literature from the public domain
						</p>
						<div class="space-y-2">
							<a
								href="/book?book=https://www.gutenberg.org/files/1342/1342-0.txt&type=text"
								class="btn btn-outline btn-sm w-full justify-start"
							>
								Pride and Prejudice by Jane Austen
							</a>
							<a
								href="/book?book=https://www.gutenberg.org/files/11/11-0.txt&type=text"
								class="btn btn-outline btn-sm w-full justify-start"
							>
								Alice's Adventures in Wonderland
							</a>
							<a
								href="/book?book=https://www.gutenberg.org/files/84/84-0.txt&type=text"
								class="btn btn-outline btn-sm w-full justify-start"
							>
								Frankenstein by Mary Shelley
							</a>
						</div>
					</div>
				</div>

				<div class="card bg-base-200 shadow-sm">
					<div class="card-body">
						<h3 class="card-title text-lg">Markdown Books</h3>
						<p class="text-base-content/70 mb-4 text-sm">
							Books formatted in Markdown with proper chapter structure
						</p>
						<div class="space-y-2">
							<div class="text-base-content/60 bg-base-300 rounded p-2 text-xs">
								Add your own Markdown book URLs above to get started
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	</main>

	<!-- Footer -->
	<footer class="footer footer-center bg-base-300 text-base-content/70 p-4">
		<div>
			<p>Built with ❤️ for book lovers everywhere</p>
		</div>
	</footer>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
