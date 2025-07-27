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
		Volume2 // Import the Volume2 icon for the audio button
	} from '@lucide/svelte';
	import { page } from '$app/state';
	import { changeTheme, shareCurrentUrl } from '$lib';

	interface BookmarkEntry {
		id: number;
		chapterIndex: number;
		timestamp: string;
		preview: string;
	}

	interface Chapter {
		title: string;
		level: number; // 0 for no specific level, 1 for h1, 2 for h2, 3 for h3
		paragraphs: string[];
	}

	let loading = $state(true);
	let error = $state(false);
	let chapters: Chapter[] = $state([]);
	let currentChapterIndex = $state(0);
	let fontSize = $state(18);
	let theme = $state('light');
	let showSidebar = $state(false);
	let showSettings = $state(false);
	let readingProgress = $state(0);
	let bookmarks: BookmarkEntry[] = $state([]);
	let readerContainer: HTMLDivElement | undefined;
	let chapterElements: HTMLDivElement[] = [];
	let { data }: { data: { title: string; author: string } } = $props();

	// Declare fileType as a reactive state variable so it's accessible in the template
	let fileType = $state<'markdown' | 'text'>('markdown');

	// Load book content on mount
	onMount(async () => {
		try {
			// Stop any potential previous speech if component reloads
			if (typeof window !== 'undefined' && window.speechSynthesis) {
				window.speechSynthesis.cancel();
			}

			const bookUrl = page.url.searchParams.get('book');
			// Assign the determined file type to the reactive state variable
			fileType = (page.url.searchParams.get('type') || 'markdown') as 'markdown' | 'text'; // 'markdown' or 'text'

			if (!bookUrl) {
				throw new Error('No book URL provided');
			}

			let text: string;

			// Fetch content based on file type
			if (fileType === 'markdown') {
				// Direct fetch for GitHub markdown files
				const response = await fetch(bookUrl);
				if (!response.ok) throw new Error('Failed to fetch book content');
				text = await response.text();
			} else {
				// Use proxy for other files (like Project Gutenberg)
				const response = await fetch(
					`https://api.allorigins.win/raw?url=${encodeURIComponent(bookUrl)}`
				);
				if (!response.ok) throw new Error('Failed to fetch book content');
				text = await response.text();
			}

			let parsedChapters: Chapter[] = [];

			if (fileType === 'markdown') {
				// Parse all markdown headings (h1, h2, h3) as chapters
				const headingRegex = /^(#{1,3})\s+(.*)$/gm;
				const parts = text.split(headingRegex);

				// If there's content before the first heading
				if (parts[0]?.trim()) {
					parsedChapters.push({
						title: 'Introduction',
						level: 0, // No heading level
						paragraphs: formatParagraphs(parts[0])
					});
				}

				// Process heading groups (level, title, content)
				for (let i = 1; i < parts.length; i += 3) {
					const levelMarker = parts[i]; // This is the '#' characters
					const title = parts[i + 1];
					const content = parts[i + 2];

					// Determine level based on the number of '#' characters
					const level = levelMarker ? levelMarker.length : 0;

					if (title?.trim()) {
						parsedChapters.push({
							title: title.trim(),
							level, // 1 for h1, 2 for h2, 3 for h3
							paragraphs: content ? formatParagraphs(content) : []
						});
					}
				}
			} else {
				// Handle plain text files with CHAPTER pattern
				const chapterRegex = /^(CHAPTER [IVX]+\.?.*$)/gm;
				const rawChapters = text.split(chapterRegex);

				// The first element is the content before the first chapter
				if (rawChapters[0].trim()) {
					parsedChapters.push({
						title: 'Beginning',
						level: 0,
						paragraphs: formatParagraphs(rawChapters[0])
					});
				}

				for (let i = 1; i < rawChapters.length; i += 2) {
					const title = rawChapters[i]?.trim();
					const content = rawChapters[i + 1];
					if (title && content?.trim()) {
						parsedChapters.push({
							title,
							level: 0, // No specific level for CHAPTER headings
							paragraphs: formatParagraphs(content)
						});
					}
				}
			}

			chapters = parsedChapters;

			// Rest of your existing code remains the same...
			// Load saved state
			if (browser) {
				const savedTheme = localStorage.getItem('bibliopath-theme') || 'dark';
				changeTheme(savedTheme, false);
				const savedFontSize = localStorage.getItem('bookstr-fontsize');
				if (savedFontSize) fontSize = parseInt(savedFontSize);
				const savedBookmarks = localStorage.getItem('bookstr-bookmarks');
				if (savedBookmarks) bookmarks = JSON.parse(savedBookmarks);
			}

			loading = false;
			await tick(); // Wait for DOM to render

			// Setup IntersectionObserver after content is rendered
			setupIntersectionObserver();

			// Restore reading position
			if (browser) {
				const savedPosition = localStorage.getItem('bookstr-position');
				if (savedPosition) {
					const savedChapterIndex = parseInt(savedPosition);
					if (chapters[savedChapterIndex]) {
						goToChapter(savedChapterIndex, 'auto');
					}
				}
			}
		} catch (err) {
			console.error('Error loading book:', err);
			error = true;
			loading = false;
		}
	});

	function formatParagraphs(content: string) {
		return content
			.split(/\n\s*\n/) // FIXED: Split on blank lines (paragraph separators) - NOT /\s*/
			.map((p) => p.trim().replace(/\s+/g, ' ')) // Normalize whitespace within each paragraph
			.filter((p) => p.length > 0); // Remove empty paragraphs
	}

	// Add this function for basic inline Markdown rendering
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

	// Function to show the "Soon" alert for audio
	function showAudioSoonAlert() {
		alert('Audio feature coming soon!');
	}

	// --- Scrolling and Chapter Tracking ---
	function goToChapter(chapterIndex: number, behavior: ScrollBehavior = 'smooth') {
		const targetElement = chapterElements[chapterIndex];
		if (targetElement) {
			const scrollOptions: ScrollIntoViewOptions = { behavior, block: 'start' };
			targetElement.scrollIntoView(scrollOptions);
			showSidebar = false;
		}
	}

	let observer: IntersectionObserver;

	function setupIntersectionObserver() {
		if (observer) observer.disconnect();

		const options = {
			root: readerContainer,
			rootMargin: '0px 0px -80% 0px',
			threshold: 0.0
		};

		observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const index = parseInt((entry.target as HTMLElement).dataset.chapterIndex || '0');
					currentChapterIndex = index;
					if (browser) {
						localStorage.setItem('bookstr-position', index.toString());
					}
				}
			});
		}, options);

		chapterElements.forEach((el) => {
			if (el) observer.observe(el);
		});
	}

	function handleScroll() {
		if (!readerContainer) return;

		const { scrollTop, scrollHeight, clientHeight } = readerContainer;
		const scrollableHeight = scrollHeight - clientHeight;

		if (scrollableHeight > 0) {
			readingProgress = (scrollTop / scrollableHeight) * 100;
		} else {
			readingProgress = 0;
		}
	}

	// --- Bookmarks ---
	function addBookmark() {
		const newBookmark = {
			id: Date.now(),
			chapterIndex: currentChapterIndex,
			timestamp: new Date().toISOString(),
			preview: chapters[currentChapterIndex]?.paragraphs[0]?.slice(0, 100) || 'Chapter start'
		};
		bookmarks = [...bookmarks, newBookmark];
		if (browser) {
			localStorage.setItem('bookstr-bookmarks', JSON.stringify(bookmarks));
		}
	}

	function goToBookmark(bookmark: BookmarkEntry) {
		goToChapter(bookmark.chapterIndex);
		showSidebar = false;
	}

	function removeBookmark(bookmarkId: number) {
		bookmarks = bookmarks.filter((b) => b.id !== bookmarkId);
		if (browser) {
			localStorage.setItem('bookstr-bookmarks', JSON.stringify(bookmarks));
		}
	}

	// --- Settings ---
	function changeFontSize(newSize: number) {
		fontSize = newSize;
		if (browser) {
			localStorage.setItem('bookstr-fontsize', fontSize.toString());
		}
	}

	function changeThemeX(newTheme: string, save = true) {
		theme = newTheme;
		if (browser) {
			document.documentElement.setAttribute('data-theme', newTheme);
			if (save) {
				localStorage.setItem('bibliopath-theme', newTheme);
			}
		}
	}

	// Apply theme on mount
	onMount(() => {
		if (browser) {
			const savedTheme = localStorage.getItem('bibliopath-theme') || 'dark';
			changeThemeX(savedTheme, false);
		}
	});
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
						class="btn btn-ghost h-auto w-full justify-start px-4 py-3 text-left {index ===
						currentChapterIndex
							? 'btn-primary'
							: ''} {chapter.level === 1
							? 'pl-4 font-bold'
							: chapter.level === 2
								? 'pl-8'
								: chapter.level === 3
									? 'pl-12'
									: 'pl-4'}"
						onclick={() => goToChapter(index)}
					>
						<span class="truncate">
							<!-- Add visual indicators for heading levels -->
							{chapter.level === 1
								? '◗ ' // H1 indicator
								: chapter.level === 2
									? '◈ ' // H2 indicator
									: chapter.level === 3
										? '◇ ' // H3 indicator
										: ''}
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
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<h1
						onclick={() =>
							(document.getElementById('my_modal_2') as HTMLDialogElement | null)?.showModal()}
						title={data.title}
						class="line-clamp-2 cursor-pointer text-base leading-tight font-bold md:text-lg"
					>
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
			<div class="navbar-end gap-2">
				<button class="btn btn-ghost btn-circle" onclick={addBookmark} title="Add Bookmark">
					<Bookmark size={20} />
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
										onclick={() => changeThemeX('light')}
									>
										Light
									</button>
									<button
										class="btn join-item flex-1 {theme === 'dark' ? 'btn-primary' : 'btn-outline'}"
										onclick={() => changeThemeX('dark')}
									>
										Dark
									</button>
									<!-- <button
                                        class="btn join-item flex-1 {theme === 'coffee'
                                            ? 'btn-primary'
                                            : 'btn-outline'}"
                                        onclick={() => changeThemeX('coffee')}
                                    >
                                        Sepia
                                    </button> -->
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
			</div>
			<!-- Progress bar -->
			<div class="bg-base-300 absolute right-0 bottom-0 left-0 h-1">
				<div
					class="bg-primary h-full transition-all duration-300 ease-out"
					style="width: {readingProgress}%"
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
							<p class="text-lg font-medium">Error loading the book</p>
							<button onclick={() => location.reload()} class="btn btn-sm btn-primary">
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
										<!-- Add visual indicators for heading levels -->
										{chapter.level === 1
											? '◗ ' // H1 indicator
											: chapter.level === 2
												? '◈ ' // H2 indicator
												: chapter.level === 3
													? '◇ ' // H3 indicator
													: ''}
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
								{#each chapter.paragraphs as paragraph}
									<p class="mb-6 text-justify indent-8 leading-relaxed">
										<!-- Conditionally render Markdown based on fileType -->
										{#if fileType === 'markdown'}
											{@html renderMarkdownInline(paragraph)}
										{:else}
											{paragraph}
										{/if}
									</p>
								{:else}
									<!-- Handle chapters with no paragraphs -->
									{#if chapter.title === 'Introduction'}
										<p class="mb-6 text-justify italic text-base-content/70">
											No content before first heading
										</p>
									{/if}
								{/each}
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
