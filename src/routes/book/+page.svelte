<!-- src/routes/book/+page.svelte -->
<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { browser } from '$app/environment';
	import {
		BookOpen,
		Menu,
		X,
		Settings,
		ChevronLeft,
		CircleX,
		RotateCcw,
		Volume2,
		Info,
		Heart,
		Download,
		Trash2,
		Wifi,
		WifiOff,
		EllipsisVertical
	} from '@lucide/svelte';
	import { page } from '$app/state';
	import { changeTheme, shareCurrentUrl } from '$lib';
	import { HTTP_STATUS_TEXT, type BookFileType, type Chapter, type SavedBook } from '$lib/types';
	import { loadSavedBooks, saveBook, removeBook } from '$lib/services/saved.services';
	import { offlineBookService } from '$lib/services/offline.services';
	import { getOfflineStats, isOfflineStorageSupported } from '$lib/utils/offline.utils';

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
	let savedBooks: SavedBook[] = $state([]);
	let isBookSaved = $state(false);
	let readerContainer: HTMLDivElement | null = $state(null);
	let chapterElements: HTMLDivElement[] = $state([]);
	let fileType: BookFileType = $state('markdown');

	// --- Offline functionality state ---
	let isBookDownloaded = $state(false);
	let isDownloading = $state(false);
	let isLoadedFromOffline = $state(false);
	let bookContent = $state(''); // Store raw book content
	let offlineStats = $state({ count: 0, totalSize: '0 Bytes', totalSizeBytes: 0 });

	// --- Scroll position tracking ---
	let scrollPositionSaveTimeout: number | null = $state(null);
	let isRestoringPosition = $state(false);

	// --- Lifecycle ---
	onMount(async () => {
		try {
			// Stop any potential previous speech if component reloads
			if (typeof window !== 'undefined' && window.speechSynthesis) {
				window.speechSynthesis.cancel();
			}

			// Initialize IndexedDB
			await offlineBookService.init();

			if (browser) {
				// Load theme first to prevent flash and apply immediately
				const savedTheme = localStorage.getItem('bibliopath-theme') || 'dark';
				console.log(`Saved theme... ${savedTheme}`);
				// Apply theme immediately using the imported function
				changeTheme(savedTheme, false);
				theme = savedTheme; // Update local state variable for UI reactivity
			}

			// Get URL parameters
			const bookUrl = page.url.searchParams.get('book');
			fileType = (page.url.searchParams.get('type') || 'markdown') as BookFileType;

			if (!bookUrl) {
				console.error('No book URL provided');
				throw new Error('No book URL provided');
			}

			// Check if book is already downloaded offline
			isBookDownloaded = await offlineBookService.isBookDownloaded(bookUrl);

			let text: string;

			// Try to load from offline storage first, as all book types can be stored there.
			if (isBookDownloaded) {
				const offlineBook = await offlineBookService.getBook(bookUrl);

				if (offlineBook) {
					text = offlineBook.content;
					isLoadedFromOffline = true;
					bookContent = text;
					console.log('📖 Loaded book from offline storage');
				} else {
					// This is an inconsistent state. The book was detected but couldn't be retrieved.
					// For EPUBs, this is a fatal error as they can't be fetched from a network.
					if (fileType === 'epub') {
						throw new Error(
							'Inconsistent state: EPUB book metadata found, but content is missing from offline storage.'
						);
					}
					// For other types, we can try to fall back to a network fetch.
					console.warn(
						'Inconsistent state: Book was marked as downloaded, but not found. Fetching from network.'
					);
					isLoadedFromOffline = false;
					text = await fetchBookFromNetwork(bookUrl);
				}
			} else {
				// If the book is not in offline storage...
				if (fileType === 'epub') {
					// EPUBs *must* be in offline storage because they are uploaded by the user.
					// They don't have a remote URL to fetch from.
					throw new Error(
						'EPUB content not found in offline storage. Please upload the file again.'
					);
				} else {
					// For other book types, fetch them from their remote URL.
					text = await fetchBookFromNetwork(bookUrl);
				}
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
			loadSavedBooksState();

			// Load offline stats
			if (isOfflineStorageSupported()) {
				offlineStats = await getOfflineStats();
			}

			loading = false;
			await tick(); // Wait for DOM to render

			// Setup IntersectionObserver after content is rendered
			setupIntersectionObserver();

			// Restore reading position (now includes exact scroll position)
			restoreReadingPosition();
		} catch (err) {
			console.error('Error loading book:', err);
			error = true;
			errorDetails = err as string;
			loading = false;
		}
	});

	// --- Network fetch function ---
	async function fetchBookFromNetwork(bookUrl: string): Promise<string> {
		let text: string;
		if (fileType === 'markdown') {
			const response = await fetch(bookUrl);
			if (!response.ok) {
				const statusText = HTTP_STATUS_TEXT[response.status] || 'Unknown Error';
				throw new Error(`Failed to fetch markdown book content: ${response.status} ${statusText}`);
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

		bookContent = text; // Store the raw content
		return text;
	}

	// --- Offline functionality ---
	async function downloadBookOffline() {
		const bookUrl = page.url.searchParams.get('book');
		if (!bookUrl || !bookContent) {
			alert('Cannot download: Book content not available');
			return;
		}

		isDownloading = true;
		try {
			await offlineBookService.saveBook({
				title: data.title,
				author: data.author,
				url: bookUrl,
				fileType: fileType,
				content: bookContent
			});

			isBookDownloaded = true;
			console.log('📚 Book downloaded for offline reading');

			// Update offline stats
			offlineStats = await getOfflineStats();

			// Show success message
			if (browser) {
				// Simple success indication - you could replace with a toast notification
				const originalTitle = document.title;
				document.title = '✓ Downloaded - ' + originalTitle;
				setTimeout(() => {
					document.title = originalTitle;
				}, 2000);
			}
		} catch (error) {
			console.error('Failed to download book:', error);
			alert('Failed to download book for offline reading');
		} finally {
			isDownloading = false;
		}
	}

	async function removeOfflineBook() {
		const bookUrl = page.url.searchParams.get('book');
		if (!bookUrl) return;

		try {
			await offlineBookService.removeBook(bookUrl);
			isBookDownloaded = false;
			// Update offline stats
			offlineStats = await getOfflineStats();
			console.log('🗑️ Offline book removed');
		} catch (error) {
			console.error('Failed to remove offline book:', error);
			alert('Failed to remove offline book');
		}
	}

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
	}

	function loadSavedBooksState() {
		if (!browser) return;

		const books = loadSavedBooks();
		savedBooks = books;
		const currentBookUrl = page.url.searchParams.get('book');
		if (currentBookUrl) {
			isBookSaved = savedBooks.some((book) => book.url === currentBookUrl);
		}
	}

	function handleSaveBook() {
		const bookUrl = page.url.searchParams.get('book');
		if (!bookUrl) {
			alert('No book URL found to save');
			return;
		}

		const bookToSave = {
			title: data.title,
			author: data.author,
			url: bookUrl,
			fileType: fileType
		};

		saveBook(bookToSave);
		isBookSaved = true;
	}

	function handleRemoveBook() {
		const bookUrl = page.url.searchParams.get('book');
		if (!bookUrl) return;

		removeBook(bookUrl);
		isBookSaved = false;
	}

	// --- Enhanced Reading Position Management ---
	function getBookKey(): string {
		const bookUrl = page.url.searchParams.get('book');
		return `bookstr-position-${bookUrl ? btoa(bookUrl).replace(/[^a-zA-Z0-9]/g, '') : 'default'}`;
	}

	function saveReadingPosition(chapterIndex: number, scrollTop: number) {
		if (!browser) return;

		try {
			const positionData = {
				chapterIndex,
				scrollTop,
				timestamp: Date.now()
			};
			localStorage.setItem(getBookKey(), JSON.stringify(positionData));
		} catch (e) {
			console.error('Failed to save reading position to localStorage:', e);
		}
	}

	function saveScrollPositionDebounced() {
		if (!readerContainer || isRestoringPosition) return;

		// Clear existing timeout
		if (scrollPositionSaveTimeout !== null) {
			clearTimeout(scrollPositionSaveTimeout);
		}

		// Set new timeout to save position after user stops scrolling
		scrollPositionSaveTimeout = setTimeout(() => {
			const scrollTop = readerContainer?.scrollTop || 0;
			saveReadingPosition(currentChapterIndex, scrollTop);
			scrollPositionSaveTimeout = null;
		}, 500); // Save 500ms after user stops scrolling
	}

	function restoreReadingPosition() {
		if (!browser || chapters.length === 0 || !readerContainer) return;

		try {
			const savedPositionData = localStorage.getItem(getBookKey());
			if (savedPositionData) {
				const { chapterIndex, scrollTop } = JSON.parse(savedPositionData);

				if (!isNaN(chapterIndex) && chapters[chapterIndex] && !isNaN(scrollTop)) {
					isRestoringPosition = true;

					// Set current chapter index
					currentChapterIndex = chapterIndex;

					// Use requestAnimationFrame to ensure DOM is fully rendered
					requestAnimationFrame(() => {
						if (readerContainer) {
							readerContainer.scrollTop = scrollTop;
							// Allow scroll events to be processed again after restoration
							setTimeout(() => {
								isRestoringPosition = false;
							}, 100);
						}
					});
				}
			}
		} catch (e) {
			console.error('Failed to restore reading position:', e);
			isRestoringPosition = false;
		}
	}

	// --- Scrolling and Chapter Tracking ---
	function goToChapter(chapterIndex: number, behavior: ScrollBehavior = 'smooth') {
		const targetElement = chapterElements[chapterIndex];
		if (targetElement) {
			// Clear any pending scroll position saves
			if (scrollPositionSaveTimeout !== null) {
				clearTimeout(scrollPositionSaveTimeout);
				scrollPositionSaveTimeout = null;
			}

			// Temporarily disable position saving during programmatic navigation
			isRestoringPosition = true;
			targetElement.scrollIntoView({ behavior, block: 'start' });
			showSidebar = false;

			// Re-enable position saving after navigation completes and save the new position
			setTimeout(
				() => {
					isRestoringPosition = false;
					// Save the new position after programmatic navigation
					if (readerContainer) {
						const scrollTop = readerContainer.scrollTop;
						saveReadingPosition(chapterIndex, scrollTop);
					}
				},
				behavior === 'smooth' ? 1000 : 100
			);
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
				if (entry.isIntersecting && !isRestoringPosition) {
					const indexStr = (entry.target as HTMLElement).dataset.chapterIndex;
					const index = indexStr ? parseInt(indexStr, 10) : -1;
					if (!isNaN(index) && index >= 0) {
						currentChapterIndex = index;
						// Only save position if we're not in the middle of programmatic navigation
						saveScrollPositionDebounced();
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

		// Save scroll position with debouncing
		saveScrollPositionDebounced();
	}

	// // --- Bookmarks ---
	// function addBookmark() {
	// 	const newBookmark: BookmarkEntry = {
	// 		id: Date.now(),
	// 		chapterIndex: currentChapterIndex,
	// 		timestamp: new Date().toISOString(),
	// 		preview: chapters[currentChapterIndex]?.paragraphs[0]?.slice(0, 100) || 'Chapter start'
	// 	};
	// 	bookmarks = [...bookmarks, newBookmark];
	// 	saveBookmarks();
	// }

	// function goToBookmark(bookmark: BookmarkEntry) {
	// 	goToChapter(bookmark.chapterIndex);
	// 	showSidebar = false;
	// }

	// function removeBookmark(bookmarkId: number) {
	// 	bookmarks = bookmarks.filter((b) => b.id !== bookmarkId);
	// 	saveBookmarks();
	// }

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
				<button onclick={() => window.history.back()} class="btn btn-xs btn-primary">
					<ChevronLeft size={18} /> Back
				</button>
			</div>

			<!-- Connection status indicator -->
			{#if isLoadedFromOffline}
				<div class="alert alert-info mb-4 py-2">
					<WifiOff size={16} />
					<span class="text-sm">Reading offline</span>
				</div>
			{:else}
				<div class="alert alert-success mb-4 py-2">
					<Wifi size={16} />
					<span class="text-sm">Online</span>
				</div>
			{/if}

			<!-- Offline storage stats -->
			{#if offlineStats.count > 0}
				<div class="stats stats-vertical mb-4 w-full text-xs">
					<div class="stat py-2">
						<div class="stat-title text-xs">Offline Books</div>
						<div class="stat-value text-lg">{offlineStats.count}</div>
						<div class="stat-desc">{offlineStats.totalSize} stored</div>
					</div>
				</div>
			{/if}

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
				<!-- Download/Remove offline book button -->
				{#if !loading && !error && bookContent}
					{#if isBookDownloaded}
						<div class="dropdown dropdown-end">
							<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
							<div class="tooltip tooltip-bottom" data-tip="Save locally">
								<label tabindex="0" class="btn btn-ghost btn-circle">
									<Download size={20} class="text-success" />
								</label>
							</div>
							<div
								class="dropdown-content card card-compact bg-base-100 border-base-300 z-[1] w-48 border p-2 shadow"
							>
								<div class="card-body">
									<p class="text-success mb-2 text-sm">✓ Available offline</p>
									<button
										class="btn btn-sm btn-error btn-outline w-full"
										onclick={removeOfflineBook}
										title="Remove offline copy"
									>
										<Trash2 size={16} />
										Remove offline
									</button>
								</div>
							</div>
						</div>
					{:else}
						<div class="tooltip tooltip-bottom" data-tip="Download for offline reading">
							<button
								class="btn btn-ghost btn-circle"
								onclick={downloadBookOffline}
								disabled={isDownloading}
							>
								{#if isDownloading}
									<div class="loading loading-spinner loading-sm"></div>
								{:else}
									<Download size={20} />
								{/if}
							</button>
						</div>
					{/if}
				{:else}
					<!-- Disabled download button when book isn't loaded -->
					<div class="tooltip tooltip-bottom" data-tip="Download unavailable">
						<button class="btn btn-ghost btn-circle" disabled>
							<Download size={20} class="opacity-30" />
						</button>
					</div>
				{/if}

				<!-- Save/Remove book button -->
				<button
					class="btn btn-ghost btn-circle"
					onclick={isBookSaved ? handleRemoveBook : handleSaveBook}
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
										onclick={() => {
											theme = 'light';
											changeTheme('light', true);
										}}
									>
										Light
									</button>
									<button
										class="btn join-item flex-1 {theme === 'dark' ? 'btn-primary' : 'btn-outline'}"
										onclick={() => {
											theme = 'dark';
											changeTheme('dark', true);
										}}
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

				<!-- <button class="btn btn-ghost btn-circle" title="Share" onclick={() => shareCurrentUrl()}>
					<Share2 size={20} />
				</button> -->

				<!-- More actions -->
				<!-- <button
					onclick={() =>
						(document.getElementById('my_modal_2') as HTMLDialogElement | null)?.showModal()}
					class="btn btn-ghost btn-circle"
					title="Book Info"
				>
					<EllipsisVertical size={20} />
				</button> -->

				<div class="dropdown dropdown-end">
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<label tabindex="0" class="btn btn-ghost btn-circle">
						<EllipsisVertical size={20} />
					</label>
					<div
						class="dropdown-content card card-compact bg-base-100 border-base-300 z-[1] w-48 border p-2 shadow"
					>
						<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
						<ul
							tabindex="0"
							class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
						>
							<li>
								<button
									onclick={() =>
										(
											document.getElementById('my_modal_2') as HTMLDialogElement | null
										)?.showModal()}
									title="Book Info"
								>
									Book Info
								</button>
							</li>
							<li>
								<button title="Share" onclick={() => shareCurrentUrl()}> Share </button>
							</li>
						</ul>
					</div>
				</div>
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
							<p class="text-lg font-medium">
								{isLoadedFromOffline ? 'Loading from offline storage...' : 'Downloading book...'}
							</p>
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
		.prose p {
			text-indent: 1.5rem;
		}
	}
</style>
