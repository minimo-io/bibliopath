<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { browser } from '$app/environment';
	import {
		BookOpen,
		Bookmark,
		Share2,
		Menu,
		X,
		Settings,
		ChevronLeft,
		ChevronRight
	} from '@lucide/svelte';

	interface Chapter {
		title: string;
		paragraphs: string[];
	}

	interface Bookmark {
		id: number;
		chapterIndex: number;
		timestamp: string;
		preview: string;
	}

	let loading = $state(true);
	let chapters: Chapter[] = $state([]);
	let currentChapterIndex = $state(0);
	let fontSize = $state(18);
	let theme = $state('light');
	let showSidebar = $state(false);
	let showSettings = $state(false);
	let readingProgress = $state(0);

	let bookmarks: Bookmark[] = $state([]);

	let readerContainer: HTMLDivElement | undefined;
	let chapterElements: HTMLDivElement[] = [];

	// Load book content on mount
	onMount(async () => {
		try {
			const response = await fetch(
				'https://api.allorigins.win/raw?url=https://www.gutenberg.org/files/11/11-0.txt'
			);
			const text = await response.text();

			// Restructure content into chapters
			const chapterRegex = /^(CHAPTER [IVX]+\.?.*$)/gm;
			const rawChapters = text.split(chapterRegex);

			let parsedChapters = [];
			// The first element is the content before the first chapter
			if (rawChapters[0].trim()) {
				parsedChapters.push({
					title: 'Beginning',
					paragraphs: formatParagraphs(rawChapters[0])
				});
			}

			for (let i = 1; i < rawChapters.length; i += 2) {
				const title = rawChapters[i].trim();
				const content = rawChapters[i + 1];
				if (content && content.trim()) {
					parsedChapters.push({
						title,
						paragraphs: formatParagraphs(content)
					});
				}
			}
			chapters = parsedChapters;

			// Load saved state
			if (browser) {
				const savedTheme = localStorage.getItem('bookstr-theme');
				if (savedTheme) changeTheme(savedTheme, false);

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
		} catch (error) {
			console.error('Error loading book:', error);
			loading = false;
		}
	});

	function formatParagraphs(content: string) {
		return content
			.split(/\n\s*\n/)
			.map((p) => p.trim().replace(/\s+/g, ' '))
			.filter((p) => p.length > 0);
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
			rootMargin: '0px 0px -80% 0px', // Trigger when chapter is in the top 20% of the viewport
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

	function goToBookmark(bookmark: Bookmark) {
		goToChapter(bookmark.chapterIndex);
		showSidebar = false;
	}

	// --- Settings ---

	function changeTheme(newTheme: string, save = true) {
		theme = newTheme;
		if (browser) {
			document.documentElement.setAttribute('data-theme', theme);
			if (save) {
				localStorage.setItem('bookstr-theme', theme);
			}
		}
	}

	function changeFontSize(newSize: number) {
		fontSize = newSize;
		if (browser) {
			localStorage.setItem('bookstr-fontsize', fontSize.toString());
		}
	}

	// Apply theme on mount
	onMount(() => {
		if (browser) {
			const savedTheme = localStorage.getItem('bookstr-theme') || 'light';
			changeTheme(savedTheme, false);
		}
	});
</script>

<svelte:head>
	<title>Bookstr Reader - Alice's Adventures in Wonderland</title>
	<meta name="description" content="Open source book reader for Project Gutenberg books" />
</svelte:head>

<div class="app" data-theme={theme}>
	<!-- Header -->
	<header class="header">
		<div class="header-content-wrapper">
			<div class="header-left">
				<button class="btn" onclick={() => (showSidebar = !showSidebar)}>
					{#if showSidebar}
						<X size={20} />
					{:else}
						<Menu size={20} />
					{/if}
				</button>

				<div class="book-info">
					<h1 class="book-title">Alice's Adventures in Wonderland</h1>
					<div class="book-meta">by Lewis Carroll</div>
				</div>
			</div>

			<div class="header-right">
				<button class="btn" onclick={addBookmark} title="Add Bookmark">
					<Bookmark size={20} />
				</button>

				<button class="btn" onclick={() => (showSettings = !showSettings)} title="Settings">
					<Settings size={20} />
				</button>

				<button class="btn" aria-label="Share">
					<Share2 size={20} />
				</button>
			</div>
		</div>

		<div class="progress-container">
			<div class="progress-bar">
				<div class="progress-fill" style="width: {readingProgress}%"></div>
			</div>
			<span class="progress-text">{Math.round(readingProgress)}%</span>
		</div>
	</header>

	<!-- Sidebar overlay -->
	{#if showSidebar}
		<button
			type="button"
			class="sidebar-overlay"
			onclick={() => (showSidebar = false)}
			aria-label="Close sidebar"
		></button>
	{/if}

	<!-- Sidebar -->
	<aside class="sidebar" class:open={showSidebar}>
		<div class="sidebar-header">
			<h2 class="sidebar-title">Table of Contents</h2>
			<button class="btn" onclick={() => (showSidebar = false)}>
				<X size={18} />
			</button>
		</div>

		<ul class="chapter-list">
			{#each chapters as chapter, index}
				<button
					type="button"
					class="chapter-item"
					class:active={index === currentChapterIndex}
					onclick={() => goToChapter(index)}
				>
					{chapter.title}
				</button>
			{/each}
		</ul>

		{#if bookmarks.length > 0}
			<div class="bookmarks-section">
				<h3 class="section-title">Bookmarks</h3>
				<ul class="bookmark-list">
					{#each bookmarks as bookmark}
						<button type="button" class="bookmark-item" onclick={() => goToBookmark(bookmark)}>
							<div class="bookmark-preview">{bookmark.preview}...</div>
							<div class="bookmark-date">{new Date(bookmark.timestamp).toLocaleDateString()}</div>
						</button>
					{/each}
				</ul>
			</div>
		{/if}
	</aside>

	<!-- Settings Panel -->
	{#if showSettings}
		<div class="settings-panel">
			<div class="settings-header">
				<h3>Reading Settings</h3>
				<button class="btn" onclick={() => (showSettings = false)}>
					<X size={18} />
				</button>
			</div>

			<div class="settings-content">
				<div class="setting-group">
					<h4>Theme</h4>
					<div class="theme-buttons">
						<button
							class="btn theme-btn"
							class:active={theme === 'light'}
							onclick={() => changeTheme('light')}
						>
							Light
						</button>
						<button
							class="btn theme-btn"
							class:active={theme === 'dark'}
							onclick={() => changeTheme('dark')}
						>
							Dark
						</button>
						<button
							class="btn theme-btn"
							class:active={theme === 'sepia'}
							onclick={() => changeTheme('sepia')}
						>
							Sepia
						</button>
					</div>
				</div>

				<div class="setting-group">
					<label for="font-size">Font Size: {fontSize}px</label>
					<input
						id="font-size"
						type="range"
						min="14"
						max="24"
						bind:value={fontSize}
						onchange={() => changeFontSize(fontSize)}
					/>
				</div>
			</div>
		</div>
	{/if}

	<!-- Main Content -->
	<main class="main-content">
		<div
			class="reader-container"
			bind:this={readerContainer}
			onscroll={handleScroll}
			style="font-size: {fontSize}px;"
		>
			{#if loading}
				<div class="loading">
					<BookOpen size={48} />
					<p>Loading book...</p>
				</div>
			{:else}
				<div class="reader-content">
					{#each chapters as chapter, i}
						<div class="chapter" data-chapter-index={i} bind:this={chapterElements[i]}>
							<h2 class="chapter-title">{chapter.title}</h2>
							{#each chapter.paragraphs as paragraph}
								<p>{paragraph}</p>
							{/each}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</main>
</div>

<style>
	:global(:root) {
		--bg-primary: #ffffff;
		--bg-secondary: #f8f9fa;
		--text-primary: #2c3e50;
		--text-secondary: #6c757d;
		--accent: #3498db;
		--accent-hover: #2980b9;
		--border: #dee2e6;
		--shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	:global([data-theme='dark']) {
		--bg-primary: #1a1a1a;
		--bg-secondary: #2d2d2d;
		--text-primary: #e4e4e4;
		--text-secondary: #a0a0a0;
		--accent: #4a9eff;
		--accent-hover: #3d8bfd;
		--border: #404040;
		--shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
	}

	:global([data-theme='sepia']) {
		--bg-primary: #f7f3e9;
		--bg-secondary: #f0ead6;
		--text-primary: #5d4037;
		--text-secondary: #8d6e63;
		--accent: #6d4c41;
		--accent-hover: #5d4037;
		--border: #d7ccc8;
		--shadow: 0 2px 10px rgba(93, 64, 55, 0.1);
	}

	:global(body) {
		font-family: 'Georgia', serif;
		margin: 0;
		padding: 0;
		background: var(--bg-primary);
		color: var(--text-primary);
		transition: all 0.3s ease;
	}

	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--bg-primary);
		color: var(--text-primary);
	}

	.header {
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--border);
		padding: 1rem 2rem 1.5rem; /* Adjusted padding-bottom for progress bar */
		display: flex;
		flex-direction: column; /* Stack children vertically */
		position: sticky;
		top: 0;
		z-index: 100;
		box-shadow: var(--shadow);
		height: 90px; /* Increased height to accommodate progress bar */
		justify-content: space-between; /* Distribute space between content and progress bar */
	}

	.header-content-wrapper {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding-bottom: 0.5rem; /* Space between content and progress bar */
		flex-wrap: nowrap; /* Prevent wrapping by default */
	}

	@media (max-width: 768px) {
		.header-content-wrapper {
			/* Revert to no wrapping, rely on flex-shrink for space distribution */
			flex-wrap: nowrap;
			justify-content: space-between;
		}
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-grow: 1; /* Allow it to grow and take available space */
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.book-info {
		max-width: 60%; /* Limit width to prevent overflow */
		overflow: hidden;
		text-overflow: ellipsis;
		/* white-space: nowrap; Removed to allow multi-line ellipsis */
	}

	.book-title {
		font-size: 1.2rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2; /* Limit to 2 lines */
		-webkit-box-orient: vertical;
		line-clamp: 2; /* Standard property */
		line-height: 1.3; /* Adjust as needed */
		max-height: 2.6em; /* 2 lines * line-height */
	}

	.book-meta {
		font-size: 0.9rem;
		color: var(--text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.progress-container {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		width: 100%;
		height: 5px; /* Height of the progress bar */
		background: var(--border);
		border-radius: 0;
		overflow: hidden;
		display: block; /* Ensure it takes full width */
		margin: 0; /* Remove any default margins */
	}

	.progress-bar {
		width: 100%;
		height: 100%;
		background: var(--border);
		border-radius: 0;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--accent);
		border-radius: 0;
		transition: width 0.3s ease;
	}

	.progress-text {
		display: none; /* Hide text as it's now a thin bar */
	}

	.btn {
		background: none;
		border: none;
		padding: 0.5rem;
		border-radius: 6px;
		cursor: pointer;
		color: var(--text-secondary);
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.btn:hover {
		background: var(--border);
		color: var(--text-primary);
	}

	.sidebar-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.5);
		z-index: 150;
	}

	.sidebar {
		width: 300px;
		background: var(--bg-secondary);
		border-right: 1px solid var(--border);
		padding: 1.5rem;
		position: fixed;
		left: -300px;
		top: 0;
		height: 100vh;
		overflow-y: auto;
		transition: left 0.3s ease;
		z-index: 200;
		box-shadow: var(--shadow);
	}

	.sidebar.open {
		left: 0;
	}

	.sidebar-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border);
	}

	.sidebar-title {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
	}

	.chapter-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.chapter-item {
		display: block;
		width: 100%;
		text-align: left;
		padding: 0.75rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s ease;
		border: 1px solid transparent;
		margin-bottom: 0.25rem;
	}

	.chapter-item:hover {
		background: var(--bg-primary);
		border-color: var(--border);
	}

	.chapter-item.active {
		background: var(--accent);
		color: white;
	}

	.bookmarks-section {
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}

	.section-title {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: var(--text-primary);
	}

	.bookmark-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.bookmark-item {
		padding: 0.75rem;
		border-radius: 6px;
		border: 1px solid var(--border);
		margin-bottom: 0.5rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.bookmark-item:hover {
		background: var(--bg-primary);
	}

	.bookmark-preview {
		font-size: 0.9rem;
		line-height: 1.4;
		margin-bottom: 0.25rem;
		color: var(--text-primary);
	}

	.bookmark-date {
		font-size: 0.8rem;
		color: var(--text-secondary);
	}

	.settings-panel {
		position: fixed;
		top: 0;
		right: 0;
		width: 350px;
		height: 100vh;
		background: var(--bg-secondary);
		border-left: 1px solid var(--border);
		padding: 1.5rem;
		z-index: 200;
		box-shadow: var(--shadow);
		overflow-y: auto;
	}

	.settings-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border);
	}

	.settings-header h3 {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.setting-group {
		margin-bottom: 2rem;
	}

	.setting-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: var(--text-primary);
	}

	.theme-buttons {
		display: flex;
		gap: 0.5rem;
	}

	.theme-btn {
		flex: 1;
		padding: 0.75rem 1rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--bg-primary);
		color: var(--text-primary);
	}

	.theme-btn.active {
		background: var(--accent);
		color: white;
		border-color: var(--accent);
	}

	input[type='range'] {
		width: 100%;
		margin-top: 0.5rem;
	}

	.main-content {
		flex: 1;
		display: flex;
		justify-content: center;
		overflow: hidden;
	}

	.reader-container {
		flex: 1;
		max-width: 800px;
		padding: 2rem;
		overflow-y: auto;
		height: calc(100vh - 80px); /* Adjust for fixed header */
		scroll-padding-top: 80px; /* Leave space for the sticky header */
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 50vh;
		gap: 1rem;
		color: var(--text-secondary);
	}

	.reader-content {
		line-height: 1.8;
		max-width: 100%;
	}

	.chapter {
		margin-bottom: 4rem;
	}

	.chapter-title {
		font-size: 1.8rem;
		font-weight: bold;
		margin-bottom: 2rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--border);
	}

	.reader-content p {
		margin-bottom: 1.5rem;
		text-align: justify;
		text-indent: 2rem;
		word-wrap: break-word;
	}

	@media (max-width: 768px) {
		.header {
			padding: 0.5rem; /* Reduced padding */
			height: 60px;
		}

		.header-left {
			flex-shrink: 1;
			min-width: 0;
			gap: 0.25rem; /* Reduced gap */
		}

		.book-info {
			overflow: hidden;
			text-overflow: ellipsis;
			/* Removed white-space: nowrap to allow multi-line ellipsis */
			flex-shrink: 1; /* Ensure it shrinks */
			min-width: 0; /* Allow content to shrink below its intrinsic size */
		}

		.book-title {
			font-size: 1rem;
			overflow: hidden;
			text-overflow: ellipsis;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			line-clamp: 2; /* Standard property */
			line-height: 1.3; /* Adjust as needed */
			max-height: 2.6em; /* 2 lines * line-height */
		}

		.book-meta {
			display: none; /* Hide book meta on mobile to save space */
		}

		.header-right {
			flex-shrink: 0; /* Prevent buttons from shrinking */
			gap: 0.25rem; /* Reduced gap */
		}

		.progress-container {
			display: block; /* Show progress bar on mobile */
			height: 3px; /* Adjust height for mobile */
		}

		.progress-text {
			display: none; /* Keep text hidden */
		}

		.reader-container {
			padding: 1rem;
			height: calc(100vh - 60px);
			scroll-padding-top: 60px;
		}

		.reader-content p {
			text-indent: 1rem;
		}

		.sidebar {
			width: 280px;
		}

		.settings-panel {
			width: 100%;
		}
	}
</style>
