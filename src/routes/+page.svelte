<script lang="ts">
	import { browser } from '$app/environment';
	import { changeTheme } from '$lib';
	import { Search, Zap } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	let books = $state([]);
	let loading = $state(false);
	let error = $state(null);
	let currentPage = $state(1);
	let totalCount = $state(0);
	let nextUrl = $state(null);
	let previousUrl = $state(null);
	let searchQuery = $state('');
	let searchTimeout: number | null | undefined = null;

	// let pepe = $state()

	const BASE_URL = 'https://gutendex.com/books';
	const BOOKS_PER_PAGE = 32; // API returns up to 32 books per page

	let theme = $state('light');

	// Calculate total pages
	const totalPages = $derived(Math.ceil(totalCount / BOOKS_PER_PAGE));

	// Fetch books from the API
	async function fetchBooks(url = BASE_URL, page = 1) {
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
			error = err.message;
			console.error('Error fetching books:', err);
		} finally {
			loading = false;
		}
	}

	// Get text format URL for our reader
	function getTextUrl(book) {
		return book.formats['text/plain; charset=us-ascii'] || book.formats['text/plain'] || null;
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

	// Handle search
	function handleSearch() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			currentPage = 1;
			fetchBooks(BASE_URL, 1);
		}, 500);
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

	onMount(() => {
		if (browser) {
			const savedTheme = localStorage.getItem('bibliopath-theme') || 'dark';
			theme = changeTheme(savedTheme, false);
		}
		// fetch books from index
		fetchBooks();
	});
</script>

<svelte:head>
	<title>Bibliopath</title>
	<meta
		name="description"
		content="Books for the Open Web. Discover, read, and connect with open books and authors on a community-driven platform built for the future of publishing."
	/>
</svelte:head>

<div class="container mx-auto max-w-7xl p-4">
	<!-- Header -->
	<div class="mb-8 text-center">
		<h1 class="text-base-content mb-2 text-4xl font-bold"><a href="/">Bibliopath</a></h1>
		<p class="text-base-content/70 mx-auto text-sm md:w-1/2 md:text-base">
			<strong>Books for the Open Web</strong> // Over 70,000 free ebooks from Project Gutenberg + Creative
			Common books hostead at github/nostrgit as markdown. Discover, read, and connect with authors and
			readers on a Nostr community-driven platform built for the future of publishing & reading.
		</p>
		<div class="mx-auto flex w-fit items-center justify-between gap-5">
			<a
				target="_blank"
				rel="nofollow noopener"
				href="https://njump.me/nprofile1qqs8wftkcz9achdy8ascqtnk0v3rrcevda2klm8wqyd6xrlk8skc22gekra89"
				class="btn btn-sm mx-auto my-5 flex w-fit items-center"
			>
				<Zap class="h-4 text-[#FACE3C]" fill="#FACE3C" />
				<span> Consider zapping a coffee</span>
			</a>
			<!-- <div class="divider divider-horizontal">OR</div> -->
			<a
				target="_blank"
				rel="nofollow noopener"
				class="btn btn-sm btn-ghost"
				href="https://github.com/minimo-io/bibliopath?tab=readme-ov-file#to-do">Roadmap</a
			>
		</div>
	</div>

	<!-- Search Bar -->
	<div class="mx-5 mt-2 mb-6 flex flex-row justify-center">
		<div class="form-control w-full">
			<div class="input-group flex min-w-full justify-center">
				<input
					type="text"
					placeholder="Search books, authors, subjects..."
					class="input input-lg input-bordered mr-2 w-full max-w-md rounded-full placeholder:pl-1 placeholder:text-sm md:placeholder:pl-3 md:placeholder:text-base"
					bind:value={searchQuery}
					oninput={handleSearch}
				/>
				<button class="btn btn-lg btn-square btn-primary rounded-full" onclick={handleSearch}>
					<Search class="h-5" />
				</button>
			</div>
		</div>
	</div>

	<!-- Curated books -->
	<div class="hero-content flex-col lg:flex-row-reverse">
		<div>
			<h2 class="text-5xl font-bold">Curated books</h2>
			<p class="py-6 text-center">This will be markdown Github books</p>
		</div>
	</div>
	<ul class="text-center">
		<li>
			<a
				href="/book?type=markdown&{`book=${'https://raw.githubusercontent.com/mlschmitt/classic-books-markdown/main/Adam%20Smith/The%20Wealth%20of%20Nations.md&title=The%20Wealth%20of Nations&author=Adam%20Smith'}`}"
			>
				The Wealth of Nations - Adam Smith
			</a>
		</li>
		<li>
			<a
				href="/book?type=markdown&book=https://raw.githubusercontent.com/mlschmitt/classic-books-markdown/refs/heads/main/A.W.%20Tozer/The%20Pursuit%20of%20God.md&title=The%20Pursuit%20of%20God&author=A.W. Tozer"
				>The Pursuit of God - A.W. Tozer</a
			>
		</li>
	</ul>

	<div class="hero-content mt-10 flex-col lg:flex-row-reverse">
		<div>
			<h2 class="text-5xl font-bold">Gutemberg books</h2>
			<p class="py-6">Books below are fetched from the Project Gutemberg library.</p>
		</div>
	</div>

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
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6 shrink-0 stroke-current"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<span>Error loading books: {error}</span>
			<div>
				<button class="btn btn-sm btn-outline" onclick={() => fetchBooks()}> Try Again </button>
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
						<!-- <div class="card-actions mt-4 justify-end">
							<a
								href={getReadableFormat(book)}
								target="_blank"
								rel="noopener noreferrer"
								class="btn btn-primary btn-sm"
							>
								Read
							</a>
						</div> -->
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
	{#if books.length === 0 && !loading && !error}
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
	{/if}
</div>

<style>
	.line-clamp-1 {
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
	}

	.line-clamp-2 {
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
	}
</style>
