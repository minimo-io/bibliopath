<!-- src/routes/book/+page.svelte -->
<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { browser } from '$app/environment';
	import {
		Bookmark,
		BookOpen,
		Share2,
		Menu,
		X,
		Settings,
		ChevronLeft,
		CircleX,
		RotateCcw,
		Volume2,
		Info,
		Heart
	} from '@lucide/svelte';
	import { page } from '$app/state';
	import { changeTheme, shareCurrentUrl } from '$lib';
	import { HTTP_STATUS_TEXT, type BookmarkEntry, type Chapter, type SavedBook } from '$lib/types';

	// --- Props ---
	let { data }: { data: { title: string; author: string } } = $props();

	// --- State (Reactive using Runes) ---
	let loading = $state(true);
	let error = $state(false);
	let errorDetails = $state('');
	let chapters: Chapter[] = $state([]);
	let currentChapterIndex = $state(0);
	let fontSize = $state(18);
	let theme = $state('dark'); // Default, will be overridden by loadSavedState

	let showSidebar = $state(false);
	let readingProgress = $state(0);
	let bookmarks: BookmarkEntry[] = $state([]);
	let savedBooks: SavedBook[] = $state([]);
	let isBookSaved = $state(false);
	let readerContainer: HTMLDivElement | null = $state(null);
	let chapterElements: HTMLDivElement[] = $state([]);
	let fileType: 'markdown' | 'text' = $state('markdown');

	// --- Lifecycle ---
	onMount(async () => {
		try {
			// Stop any potential previous speech if component reloads
			if (typeof window !== 'undefined' && window.speechSynthesis) {
				window.speechSynthesis.cancel();
			}
			if (browser) {
				// Load theme first to prevent flash and apply immediately
				const savedTheme = localStorage.getItem('bibliopath-theme') || 'dark';
				// Apply theme immediately using the imported function
				changeTheme(savedTheme, false); // false means don't save again, we just loaded it
				theme = savedTheme; // Update local state variable for UI reactivity
			}

			// Get URL parameters
			const bookUrl = page.url.searchParams.get('book');
			fileType = (page.url.searchParams.get('type') || 'markdown') as 'markdown' | 'text';

			if (!bookUrl) {
				throw new Error('No book URL provided');
			}

			// Fetch book content
			let text: string;
			if (fileType === 'markdown') {
				const response = await fetch(bookUrl);
				if (!response.ok) {
					const statusText = HTTP_STATUS_TEXT[response.status] || 'Unknown Error';
					throw new Error(
						`Failed to fetch markdown book content: ${response.status} ${statusText}`
					);
				}
				text = await response.text();
			} else {
				// Use proxy for other files (like Project Gutenberg)
				const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(bookUrl)}`;
				const response = await fetch(proxyUrl);
				if (!response.ok)
					throw new Error(`Failed to fetch text book content via proxy: ${response.status}`);
				text = await response.text();
			}

			// Parse content based on file type
			let parsedChapters: Chapter[] = [];
			if (fileType === 'markdown') {
				parsedChapters = parseMarkdown(text);
			} else {
				parsedChapters = parsePlainText(text);
			}
			chapters = parsedChapters;

			// Load saved state from localStorage
			loadOtherSavedState();
			loadSavedBooks();

			loading = false;
			await tick(); // Wait for DOM to render

			// Setup IntersectionObserver after content is rendered
			setupIntersectionObserver();

			// Restore reading position
			restoreReadingPosition();
		} catch (err) {
			console.error('Error loading book:', err);
			error = true;
			errorDetails = err as string;
			loading = false;
		}
	});

	// --- Helper Functions for Parsing ---
	function parseMarkdown(text: string): Chapter[] {
		const parsedChapters: Chapter[] = [];
		const headingRegex = /^(#{1,3})\s+(.*)$/gm;
		const parts = text.split(headingRegex);

		// Content before first heading
		if (parts[0]?.trim()) {
			parsedChapters.push({
				title: 'Introduction',
				level: 0,
				paragraphs: formatParagraphs(parts[0])
			});
		}

		// Process heading groups (level marker, title, content)
		for (let i = 1; i < parts.length; i += 3) {
			const levelMarker = parts[i];
			const title = parts[i + 1]?.trim();
			const content = parts[i + 2];

			if (title) {
				const level = levelMarker ? levelMarker.length : 0;
				parsedChapters.push({
					title,
					level,
					paragraphs: content ? formatParagraphs(content) : []
				});
			}
		}
		return parsedChapters;
	}

	function parsePlainText(text: string): Chapter[] {
		const parsedChapters: Chapter[] = [];
		const chapterRegex = /^(CHAPTER [IVX]+\.?.*$)/gm;
		const rawChapters = text.split(chapterRegex);

		// Content before first chapter
		if (rawChapters[0]?.trim()) {
			parsedChapters.push({
				title: 'Beginning',
				level: 0,
				paragraphs: formatParagraphs(rawChapters[0])
			});
		}

		// Process chapter pairs (title, content)
		for (let i = 1; i < rawChapters.length; i += 2) {
			const title = rawChapters[i]?.trim();
			const content = rawChapters[i + 1];

			if (title && content?.trim()) {
				parsedChapters.push({
					title,
					level: 0, // Plain text chapters don't have nested levels
					paragraphs: formatParagraphs(content)
				});
			}
		}
		return parsedChapters;
	}

	function formatParagraphs(content: string) {
		return content
			.split(/\n\s*\n/)
			.map((p) => p.trim().replace(/\s+/g, ' '))
			.filter((p) => p.length > 0);
	}

	// --- Inline Markdown Rendering ---
	function renderMarkdownInline(text: string): string {
		if (!text) return '';
		// Correctly escape HTML entities FIRST
		let escapedText = text.replace(/&/g, '&amp;').replace(/</g, '<').replace(/>/g, '>');
		// Then apply Markdown transformations
		return escapedText
			.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold **text**
			.replace(/__(.*?)__/g, '<strong>$1</strong>') // Bold __text__
			.replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic *text*
			.replace(/_(.*?)_/g, '<em>$1</em>'); // Italic _text_
	}

	// --- State Management (LocalStorage) ---
	function loadOtherSavedState() {
		if (!browser) return;

		const savedFontSize = localStorage.getItem('bookstr-fontsize');
		if (savedFontSize) fontSize = parseInt(savedFontSize, 10);

		const savedBookmarks = localStorage.getItem('bookstr-bookmarks');
		if (savedBookmarks) {
			try {
				bookmarks = JSON.parse(savedBookmarks);
			} catch (e) {
				console.error('Failed to parse bookmarks from localStorage:', e);
				bookmarks = []; // Reset on error
			}
		}
	}

	function loadSavedBooks() {
		if (!browser) return;

		const saved = localStorage.getItem('bibliopath-saved-books');
		if (saved) {
			try {
				savedBooks = JSON.parse(saved);
				const currentBookUrl = page.url.searchParams.get('book');
				if (currentBookUrl) {
					isBookSaved = savedBooks.some((book) => book.url === currentBookUrl);
				}
			} catch (e) {
				console.error('Failed to parse saved books from localStorage:', e);
				savedBooks = [];
			}
		}
	}

	function saveCurrentBook() {
		if (!browser) return;

		const bookUrl = page.url.searchParams.get('book');
		if (!bookUrl) {
			alert('No book URL found to save');
			return;
		}

		const existingBook = savedBooks.find((book) => book.url === bookUrl);
		if (existingBook) {
			existingBook.lastRead = new Date().toISOString();
		} else {
			const newSavedBook: SavedBook = {
				id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
				title: data.title,
				author: data.author,
				url: bookUrl,
				fileType: fileType,
				savedAt: new Date().toISOString(),
				lastRead: new Date().toISOString()
			};
			savedBooks = [...savedBooks, newSavedBook];
		}

		try {
			localStorage.setItem('bibliopath-saved-books', JSON.stringify(savedBooks));
			isBookSaved = true;
		} catch (e) {
			console.error('Failed to save book to localStorage:', e);
			alert('Failed to save book. Please try again.');
		}
	}

	function removeCurrentBook() {
		if (!browser) return;

		const bookUrl = page.url.searchParams.get('book');
		if (!bookUrl) return;

		savedBooks = savedBooks.filter((book) => book.url !== bookUrl);

		try {
			localStorage.setItem('bibliopath-saved-books', JSON.stringify(savedBooks));
			isBookSaved = false;
		} catch (e) {
			console.error('Failed to remove book from localStorage:', e);
			alert('Failed to remove book. Please try again.');
		}
	}

	function saveBookmarks() {
		if (browser) {
			try {
				localStorage.setItem('bookstr-bookmarks', JSON.stringify(bookmarks));
			} catch (e) {
				console.error('Failed to save bookmarks to localStorage:', e);
			}
		}
	}

	function saveReadingPosition(index: number) {
		if (browser) {
			try {
				localStorage.setItem('bookstr-position', index.toString());
			} catch (e) {
				console.error('Failed to save reading position to localStorage:', e);
			}
		}
	}

	function restoreReadingPosition() {
		if (!browser || chapters.length === 0) return;
		const savedPosition = localStorage.getItem('bookstr-position');
		if (savedPosition) {
			const savedChapterIndex = parseInt(savedPosition, 10);
			if (!isNaN(savedChapterIndex) && chapters[savedChapterIndex]) {
				goToChapter(savedChapterIndex, 'auto');
			}
		}
	}

	// --- Scrolling and Chapter Tracking ---
	function goToChapter(chapterIndex: number, behavior: ScrollBehavior = 'smooth') {
		const targetElement = chapterElements[chapterIndex];
		if (targetElement) {
			targetElement.scrollIntoView({ behavior, block: 'start' });
			showSidebar = false;
		}
	}

	let observer: IntersectionObserver | undefined;
	function setupIntersectionObserver() {
		if (observer) {
			observer.disconnect();
			observer = undefined;
		}

		if (!readerContainer) return;

		const options = {
			root: readerContainer,
			rootMargin: '0px 0px -80% 0px',
			threshold: 0.0
		};

		observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const indexStr = (entry.target as HTMLElement).dataset.chapterIndex;
					const index = indexStr ? parseInt(indexStr, 10) : -1;
					if (!isNaN(index) && index >= 0) {
						currentChapterIndex = index;
						saveReadingPosition(index);
					}
				}
			});
		}, options);

		chapterElements.forEach((el) => {
			if (el) observer?.observe(el);
		});
	}

	function handleScroll() {
		if (!readerContainer) return;
		const { scrollTop, scrollHeight, clientHeight } = readerContainer;
		const scrollableHeight = scrollHeight - clientHeight;
		readingProgress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;
	}

	// --- Bookmarks ---
	function addBookmark() {
		const newBookmark: BookmarkEntry = {
			id: Date.now(),
			chapterIndex: currentChapterIndex,
			timestamp: new Date().toISOString(),
			preview: chapters[currentChapterIndex]?.paragraphs[0]?.slice(0, 100) || 'Chapter start'
		};
		bookmarks = [...bookmarks, newBookmark];
		saveBookmarks();
	}

	function goToBookmark(bookmark: BookmarkEntry) {
		goToChapter(bookmark.chapterIndex);
		showSidebar = false;
	}

	function removeBookmark(bookmarkId: number) {
		bookmarks = bookmarks.filter((b) => b.id !== bookmarkId);
		saveBookmarks();
	}

	// --- Settings ---
	function changeFontSize(newSize: number) {
		fontSize = newSize;
		if (browser) {
			try {
				localStorage.setItem('bookstr-fontsize', fontSize.toString());
			} catch (e) {
				console.error('Failed to save font size to localStorage:', e);
			}
		}
	}

	function updateTheme(newTheme: string, save = true) {
		theme = newTheme;
		changeTheme(newTheme, save);
	}

	// --- UI Interactions ---
	function showAudioSoonAlert() {
		alert('Audio feature coming soon!');
	}
</script>

<svelte:head>
	<title>{data.title} by {data.author} - Bibliopath</title>
</svelte:head>

<div class="drawer lg:drawer-open min-h-screen" data-theme={theme}>
	<!-- Drawer toggle -->
	<input id="sidebar-drawer" type="checkbox" class="drawer-toggle" bind:checked={showSidebar} />

	<!-- Drawer sidebar -->
	<div class="drawer-side z-40">
		<label for="sidebar-drawer" class="drawer-overlay"></label>
		<aside class="bg-base-200 min-h-full w-80 p-6">
			<!-- Sidebar header -->
			<div class="border-base-300 mb-6 flex items-center justify-between border-b pb-4">
				<h2 class="text-lg font-semibold">Table of Contents</h2>
				<button class="btn btn-sm btn-ghost md:hidden" onclick={() => (showSidebar = false)}>
					<X size={18} />
				</button>
				<a href="/" class="btn btn-sm btn-ghost">
					<ChevronLeft size={18} /> Back
				</a>
			</div>

			<!-- Chapter list -->
			<div class="mb-6 space-y-1">
				{#each chapters as chapter, index (index)}
					<button
						class="btn btn-ghost h-auto w-full justify-start px-4 py-3 text-left
                               {index === currentChapterIndex ? 'btn-primary' : ''}
                               {chapter.level === 1
							? 'pl-4 font-bold'
							: chapter.level === 2
								? 'pl-8'
								: chapter.level === 3
									? 'pl-12'
									: 'pl-4'}"
						onclick={() => goToChapter(index)}
					>
						<span class="truncate">
							{chapter.title}
						</span>
					</button>
				{/each}
			</div>

			<!-- Bookmarks section -->
			{#if bookmarks.length > 0}
				<div class="border-base-300 border-t pt-6">
					<h3 class="mb-4 text-base font-semibold">Bookmarks</h3>
					<div class="space-y-2">
						{#each bookmarks as bookmark (bookmark.id)}
							<div class="card bg-base-100 shadow-sm">
								<div class="card-body p-4">
									<p class="mb-2 line-clamp-2 text-sm">{bookmark.preview}...</p>
									<div class="flex items-center justify-between">
										<span class="text-base-content/70 text-xs">
											{new Date(bookmark.timestamp).toLocaleDateString()}
										</span>
										<div class="flex gap-1">
											<button class="btn btn-xs btn-primary" onclick={() => goToBookmark(bookmark)}>
												Go
											</button>
											<button
												class="btn btn-xs btn-error btn-outline"
												onclick={() => removeBookmark(bookmark.id)}
											>
												×
											</button>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</aside>
	</div>

	<!-- Main content -->
	<div class="drawer-content flex flex-col">
		<!-- Header -->
		<header class="navbar bg-base-200 border-base-300 sticky top-0 z-30 border-b shadow-sm">
			<div class="navbar-start">
				<label for="sidebar-drawer" class="btn btn-square btn-ghost lg:hidden">
					<Menu size={20} />
				</label>
				<div class="ml-4 flex-1 overflow-hidden">
					<h1 title={data.title} class="line-clamp-2 text-base leading-tight font-bold md:text-lg">
						{data.title}
					</h1>
					<!-- Full info modal -->
					<dialog id="my_modal_2" class="modal">
						<div class="modal-box">
							<p class="py-4">{data.title}</p>
							by
							<p class="py-4 text-sm italic">{data.author}</p>
						</div>
						<form method="dialog" class="modal-backdrop">
							<button>close</button>
						</form>
					</dialog>
					<p class="text-base-content/70 hidden truncate text-sm sm:block">by {data.author}</p>
				</div>
			</div>
			<div class="navbar-end gap-0 md:gap-2">
				<button class="btn btn-ghost btn-circle" onclick={addBookmark} title="Add Bookmark">
					<Bookmark size={20} />
				</button>

				<!-- Save/Remove book button -->
				<button
					class="btn btn-ghost btn-circle"
					onclick={isBookSaved ? removeCurrentBook : saveCurrentBook}
					title={isBookSaved ? 'Remove from Library' : 'Save to Library'}
				>
					{#if isBookSaved}
						<Heart size={20} class="fill-current text-red-500" />
					{:else}
						<Heart size={20} />
					{/if}
				</button>

				<!-- Settings dropdown -->
				<div class="dropdown dropdown-end">
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<label tabindex="0" class="btn btn-ghost btn-circle">
						<Settings size={20} />
					</label>
					<div
						class="dropdown-content card card-compact bg-base-100 border-base-300 z-[1] w-80 border p-4 shadow"
					>
						<div class="card-body">
							<h3 class="card-title mb-4 text-base">Reading Settings</h3>

							<!-- Theme selector -->
							<div class="form-control mb-4">
								<!-- svelte-ignore a11y_label_has_associated_control -->
								<label class="label">
									<span class="label-text font-medium">Theme</span>
								</label>
								<div class="join join-horizontal w-full">
									<button
										class="btn join-item flex-1 {theme === 'light' ? 'btn-primary' : 'btn-outline'}"
										onclick={() => updateTheme('light')}
									>
										Light
									</button>
									<button
										class="btn join-item flex-1 {theme === 'dark' ? 'btn-primary' : 'btn-outline'}"
										onclick={() => updateTheme('dark')}
									>
										Dark
									</button>
								</div>
							</div>

							<!-- Font size -->
							<div class="form-control">
								<label for="font-size-slider" class="label">
									<span class="label-text font-medium">Font Size: {fontSize}px</span>
								</label>
								<input
									type="range"
									min="14"
									max="28"
									class="range range-primary"
									bind:value={fontSize}
									onchange={() => changeFontSize(fontSize)}
									id="font-size-slider"
								/>
								<div class="text-base-content/70 mt-1 flex w-full justify-between px-2 text-xs">
									<span>14px</span>
									<span>21px</span>
									<span>28px</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<button class="btn btn-ghost btn-circle" title="Share" onclick={() => shareCurrentUrl()}>
					<Share2 size={20} />
				</button>
				<button
					onclick={() =>
						(document.getElementById('my_modal_2') as HTMLDialogElement | null)?.showModal()}
					class="btn btn-ghost btn-circle"
					title="Book Info"
				>
					<Info size={20} />
				</button>
			</div>

			<!-- Progress bar -->
			<div class="bg-base-300 absolute right-0 bottom-0 left-0 h-1">
				<div
					class="bg-primary h-full transition-all duration-300 ease-out"
					style="width: {readingProgress}%;"
				></div>
			</div>
		</header>

		<!-- Main reader content -->
		<main class="bg-base-100 flex flex-1 justify-center">
			<div
				class="w-full max-w-4xl overflow-y-auto px-6 py-8"
				bind:this={readerContainer}
				onscroll={handleScroll}
				style="font-size: {fontSize}px; height: calc(100vh - 65px);"
			>
				{#if loading}
					<div class="flex h-full flex-col items-center justify-center gap-6">
						<div class="flex flex-col items-center gap-2">
							<BookOpen size={48} class="text-base-content/50" />
							<p class="text-lg font-medium">Downloading book...</p>
						</div>
						<div class="loading loading-spinner loading-lg text-primary"></div>
					</div>
				{:else if error}
					<div class="flex h-full flex-col items-center justify-center gap-6">
						<div class="flex flex-col items-center gap-2">
							<CircleX size={48} class="text-base-content/50" />
							<div class="text-center">
								<p class="text-lg font-medium">Error loading the book</p>
								{#if errorDetails}
									<p class="text-xs">{errorDetails}</p>
								{/if}
							</div>
							<button onclick={() => window.location.reload()} class="btn btn-sm btn-primary">
								<RotateCcw size={18} /> Re-try
							</button>
						</div>
					</div>
				{:else}
					<div class="prose prose-lg max-w-none leading-relaxed">
						{#each chapters as chapter, i (i)}
							<div class="chapter mb-16" data-chapter-index={i} bind:this={chapterElements[i]}>
								<!-- Chapter header with title and audio button -->
								<div class="border-base-300 mb-8 flex items-center justify-between border-b pb-3">
									<h2
										class="font-bold {chapter.level === 1
											? 'text-4xl'
											: chapter.level === 2
												? 'text-2xl'
												: chapter.level === 3
													? 'text-xl'
													: 'text-3xl'}"
									>
										{chapter.title}
									</h2>
									<!-- Simple "Soon" audio button -->
									<button
										class="btn btn-ghost btn-circle btn-sm"
										onclick={showAudioSoonAlert}
										title="Listen to this chapter"
										aria-label="Listen to {chapter.title} (Coming Soon)"
									>
										<Volume2 size={18} />
									</button>
								</div>

								{#if chapter.paragraphs.length > 0}
									{#each chapter.paragraphs as paragraph, pIndex (pIndex)}
										<p class="mb-6 text-justify indent-8 leading-relaxed">
											{#if fileType === 'markdown'}
												{@html renderMarkdownInline(paragraph)}
											{:else}
												{paragraph}
											{/if}
										</p>
									{/each}
								{:else if chapter.title === 'Introduction' || chapter.title === 'Beginning'}
									<p class="text-base-content/70 mb-6 text-justify italic">
										No content for this section.
									</p>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</main>
	</div>
</div>

<style>
	/* Custom styles for better typography */
	.prose p {
		color: inherit;
		font-family: 'Georgia', serif;
		hyphens: auto;
		word-wrap: break-word;
	}
	.prose h2 {
		color: inherit;
		font-family: 'Georgia', serif;
	}
	/* Custom line clamp utility */
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	/* Mobile responsive adjustments */
	@media (max-width: 768px) {
		.prose {
			font-size: 1rem;
		}
		.prose p {
			text-indent: 1.5rem;
		}
	}
</style>
