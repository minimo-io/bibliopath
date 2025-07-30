<script lang="ts">
	import { AppConfig } from '$lib';
	import Header from '$lib/components/Header.svelte';
	import { fly } from 'svelte/transition';
	import '../app.css';

	let { children } = $props();

	let books = $state([]);
	let loading = $state(false);
	let error: string | null = $state(null);
	let currentPage = $state(1);
	let totalCount = $state(0);
	let nextUrl = $state(null);
	let previousUrl = $state(null);
	let searchQuery = $state('');
	let searchCount = $state(0);
	const totalPages = $derived(Math.ceil(totalCount / AppConfig.books_per_page));

	function executeSearch() {
		currentPage = 1;
		searchCount++;
		fetchBooks(AppConfig.base_index_url, 1);
	}

	// Fetch books from the API
	async function fetchBooks(url = AppConfig.base_index_url, page = 1) {
		loading = true;
		error = null;

		try {
			const searchParams = new URLSearchParams();
			if (page > 1) searchParams.set('page', page.toString());
			if (searchQuery.trim()) searchParams.set('search', searchQuery.trim());

			const finalUrl = url.includes('?') ? url : `${url}?${searchParams.toString()}`;

			const response = await fetch(finalUrl);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			books = data.results || [];
			totalCount = data.count || 0;
			nextUrl = data.next;
			previousUrl = data.previous;

			// Extract current page from URL
			if (data.next || data.previous) {
				const urlParams = new URLSearchParams(finalUrl.split('?')[1] || '');
				currentPage = parseInt(urlParams.get('page') || '1');
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			error = message;
			console.error('Error fetching books:', err);
		} finally {
			loading = false;
		}
	}

	// ✨ 2. Add a function to handle the 'Enter' key press.
	function handleSearchKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			executeSearch();
		}
	}

	// Create reader URL with book parameters
	function getReaderUrl(book) {
		const textUrl = getTextUrl(book);
		if (!textUrl) return '#';

		const params = new URLSearchParams({
			book: textUrl,
			title: book.title,
			author: book.authors.length > 0 ? book.authors[0].name : 'Unknown Author',
			id: book.id.toString()
		});
		const finalUrl = `/book?type=text&${params.toString()}`;

		return finalUrl;
	}

	// Handle pagination
	function goToPage(page) {
		if (page < 1 || page > totalPages) return;
		currentPage = page;
		fetchBooks(BASE_URL, page);
	}

	function nextPage() {
		if (nextUrl) {
			fetchBooks(nextUrl);
		}
	}

	function previousPage() {
		if (previousUrl) {
			fetchBooks(previousUrl);
		}
	}

	// Format download count
	function formatDownloadCount(count) {
		if (count >= 1000000) {
			return (count / 1000000).toFixed(1) + 'M';
		} else if (count >= 1000) {
			return (count / 1000).toFixed(1) + 'K';
		}
		return count.toString();
	}

	// Get book cover image
	function getBookCover(book) {
		return book.formats['image/jpeg'] || '/placeholder-book.jpg';
	}

	// Get readable format URL (prefer HTML, then EPUB, then plain text)
	function getReadableFormat(book) {
		return (
			book.formats['text/html'] ||
			book.formats['application/epub+zip'] ||
			book.formats['text/plain; charset=us-ascii'] ||
			'#'
		);
	}

	// Handle image error
	function handleImageError(event) {
		event.target.src = '/placeholder-book.jpg';
	}

	// Handle jump to page
	function handleJumpToPage(event) {
		if (event.key === 'Enter') {
			const page = parseInt(event.target.value);
			if (page >= 1 && page <= totalPages) {
				goToPage(page);
				event.target.value = '';
			}
		}
	}

	function jumpToPageClick(event) {
		const input = event.target.previousElementSibling;
		const page = parseInt(input.value);
		if (page >= 1 && page <= totalPages) {
			goToPage(page);
			input.value = '';
		}
	}

	function clearSearchAndShowAll() {
		searchQuery = '';
		fetchBooks();
	}

	// Get text format URL for our reader
	function getTextUrl(book) {
		return book.formats['text/plain; charset=us-ascii'] || book.formats['text/plain'] || null;
	}
</script>

<Header
	bind:searchQuery
	onSearchClick={executeSearch}
	onSearchKeydown={handleSearchKeydown}
	{loading}
	{searchCount}
/>

<div class="container mx-auto max-w-7xl">
	<!-- Loading State -->
	{#if loading}
		<div class="flex items-center justify-center py-12">
			<span class="loading loading-spinner loading-lg text-primary"></span>
			<span class="ml-4 text-lg">Finding books...</span>
		</div>
	{/if}

	<!-- Error State -->
	{#if error}
		<div class="alert alert-error mb-6">
			XXX
			<span>Error loading books: {error}</span>
			<div>
				<button class="btn btn-sm btn-outline" onclick={() => fetchBooks()}> Try Again </button>
			</div>
		</div>
	{/if}

	<!-- Results Info -->
	{#if totalCount > 0 && !loading}
		<div in:fly={{ y: 50, duration: 500 }} class="mb-6 text-center">
			<div class="stats stats-horizontal shadow">
				<div class="stat">
					<div class="stat-title">Total Books</div>
					<div class="stat-value text-primary text-lg md:text-3xl">
						{totalCount.toLocaleString()}
					</div>
				</div>
				<div class="stat">
					<div class="stat-title">Current Page</div>
					<div class="stat-value text-secondary text-lg md:text-3xl">{currentPage}</div>
				</div>
				<div class="stat">
					<div class="stat-title">Total Pages</div>
					<div class="stat-value text-accent text-lg md:text-3xl">
						{totalPages.toLocaleString()}
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Books Grid -->
	{#if books.length > 0 && !loading}
		<div
			class="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
		>
			{#each books as book (book.id)}
				<div
					class="card card-compact bg-base-100 shadow-xl transition-shadow duration-300 hover:shadow-2xl"
				>
					<figure class="px-4 pt-4">
						<img
							src={getBookCover(book)}
							alt={book.title}
							class="h-48 w-full rounded-lg object-cover"
							loading="lazy"
							onerror={handleImageError}
						/>
					</figure>

					<div class="card-body">
						<h2 class="card-title line-clamp-2 text-sm" title={book.title}>
							{book.title}
						</h2>

						{#if book.authors.length > 0}
							<p class="text-base-content/70 line-clamp-1 text-xs">
								by {book.authors.map((author) => author.name).join(', ')}
							</p>
						{/if}

						<!-- Pills -->
						{#if book.subjects.length > 0}
							<div class="mt-2 flex flex-wrap gap-1">
								{#each book.subjects.slice(0, 2) as subject}
									<span
										class="badge badge-outline badge-xs truncate overflow-hidden text-left"
										title={subject}
									>
										{subject}
									</span>
								{/each}
								{#if book.subjects.length > 2}
									<span class="badge badge-ghost badge-xs">
										+{book.subjects.length - 2} more
									</span>
								{/if}
							</div>
						{/if}

						<div class="mt-2 flex items-center justify-between">
							<span class="text-base-content/60 text-xs">
								📥 {formatDownloadCount(book.download_count)}
							</span>
							<div class="flex gap-1">
								{#each book.languages as lang}
									<span class="badge badge-primary badge-xs">{lang.toUpperCase()}</span>
								{/each}
							</div>
						</div>

						<!-- Actions -->
						<div class="card-actions mt-4 justify-end">
							{#if getTextUrl(book)}
								<a href={getReaderUrl(book)} class="btn btn-primary btn-sm"> Read </a>
							{:else}
								<a
									href={book.formats['text/html'] || book.formats['application/epub+zip'] || '#'}
									target="_blank"
									rel="noopener noreferrer"
									class="btn btn-outline btn-sm"
								>
									View Online
								</a>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Pagination -->
		<div class="flex w-full justify-center">
			<div class="join">
				<button
					class="join-item btn"
					class:btn-disabled={!previousUrl}
					onclick={previousPage}
					disabled={!previousUrl}
				>
					«
				</button>

				<!-- Show page numbers around current page -->
				{#each Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
					const startPage = Math.max(1, currentPage - 5);
					const endPage = Math.min(totalPages, startPage + 9);
					return startPage + i;
				}).filter((page) => page <= totalPages) as pageNum}
					<button
						class="join-item btn"
						class:btn-active={pageNum === currentPage}
						onclick={() => goToPage(pageNum)}
					>
						{pageNum}
					</button>
				{/each}

				<button
					class="join-item btn"
					class:btn-disabled={!nextUrl}
					onclick={nextPage}
					disabled={!nextUrl}
				>
					»
				</button>
			</div>
		</div>

		<!-- Quick Jump to Page -->
		<div class="mt-4 flex justify-center">
			<div class="form-control">
				<label class="label">
					<span class="label-text">Jump to page:</span>
				</label>
				<div class="input-group input-group-sm">
					<input
						type="number"
						placeholder="Page #"
						class="input input-bordered input-sm w-24"
						min="1"
						max={totalPages}
						onkeydown={handleJumpToPage}
					/>
					<button class="btn btn-sm" onclick={jumpToPageClick}> Go </button>
				</div>
			</div>
		</div>
	{/if}

	<!-- No Results -->
	<!-- {#if books.length === 0 && !loading && !error}
		<div class="py-12 text-center">
			<div class="mb-4 text-6xl">📚</div>
			<h2 class="mb-2 text-2xl font-bold">No books found</h2>
			<p class="text-base-content/70">Try adjusting your search terms or browse all books</p>
			{#if searchQuery}
				<button class="btn btn-primary mt-4" onclick={clearSearchAndShowAll}>
					Show All Books
				</button>
			{/if}
		</div>
	{/if} -->
</div>

{@render children()}

<style>
	.line-clamp-1 {
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
		line-clamp: 1;
	}

	.line-clamp-2 {
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}
</style>
