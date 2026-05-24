<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';
	import { Save, FileText, Bold, Italic, Heading1, Heading2, Link, Eye, FileEdit } from '@lucide/svelte';
	import { offlineBookService } from '$lib/services/offline.services';
	import { saveBook, loadSavedBooks } from '$lib/services/saved.services';
	import { mdToHtml } from '$lib/utils/markdown';

	let title = $state('');
	let author = $state('');
	let content = $state('');
	let loading = $state(true);
	let error = $state('');
	let editId = $state<string | null>(null);
	let viewMode: 'edit' | 'split' | 'preview' = $state('split');
	let textareaRef: HTMLTextAreaElement | undefined = $state();
	let savedBookCount = $state(0);

	let autoSaveId = $state<string | null>(null);
	let lastSavedSnapshot = $state<string | null>(null);

	// Always-running save state machine
	let saveState = $state<'counting' | 'saving' | 'saved'>('counting');
	let countdown = $state(5);

	const previewHtml = $derived(mdToHtml(content));

	function generateDraftId(): string {
		return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
	}

	async function performAutoSave(): Promise<void> {
		if (!content.trim()) return;
		const snapshot = JSON.stringify({ title, author, content });
		if (snapshot === lastSavedSnapshot) return;

		const id = autoSaveId || editId || generateDraftId();
		if (!autoSaveId && !editId) autoSaveId = id;

		try {
			await offlineBookService.saveBook({
				title: title.trim() || 'Untitled',
				author: author.trim() || 'Unknown',
				url: id,
				fileType: 'markdown',
				content: content.trim()
			});
			saveBook({
				title: title.trim() || 'Untitled',
				author: author.trim() || 'Unknown',
				url: id,
				fileType: 'markdown'
			});
			lastSavedSnapshot = snapshot;
			savedBookCount = loadSavedBooks().length;
		} catch (err) {
			console.error('Auto-save failed:', err);
		}
	}

	async function tick(): Promise<void> {
		if (saveState !== 'counting') return;

		countdown--;

		if (countdown <= 0) {
			saveState = 'saving';
			await performAutoSave();
			saveState = 'saved';
			await new Promise<void>((r) => setTimeout(r, 2000));
			saveState = 'counting';
			countdown = 5;
		}
	}

	let ticker: ReturnType<typeof setInterval> | undefined;

	onMount(async () => {
		if (!browser) return;

		await offlineBookService.init();
		savedBookCount = loadSavedBooks().length;

		const editParam = page.url.searchParams.get('edit');
		if (editParam) {
			editId = editParam;
			try {
				const book = await offlineBookService.getBook(editParam);
				if (book) {
					title = book.title;
					author = book.author;
					content = book.content;
					lastSavedSnapshot = JSON.stringify({ title, author, content });
				} else {
					error = 'Book not found in local storage.';
				}
			} catch (err) {
				console.error('Failed to load book for editing:', err);
				error = 'Failed to load book.';
			}
		}

		loading = false;
		ticker = setInterval(() => { tick(); }, 1000);
	});

	onDestroy(() => {
		if (ticker) clearInterval(ticker);
	});

	function wrapSelection(before: string, after: string) {
		if (!textareaRef) return;
		const start = textareaRef.selectionStart;
		const end = textareaRef.selectionEnd;
		const text = content;
		const selected = text.substring(start, end);
		const replacement = selected ? `${before}${selected}${after}` : before + after;
		content = text.substring(0, start) + replacement + text.substring(end);
		requestAnimationFrame(() => {
			textareaRef?.setSelectionRange(
				selected ? start + before.length : start + before.length,
				selected ? start + before.length + selected.length : start + before.length
			);
			textareaRef?.focus();
		});
	}

	function insertHeading(level: number) {
		if (!textareaRef) return;
		const start = textareaRef.selectionStart;
		const text = content;
		const lineStart = text.lastIndexOf('\n', start - 1) + 1;
		const prefix = '#'.repeat(level) + ' ';
		content = text.substring(0, lineStart) + prefix + text.substring(lineStart);
		requestAnimationFrame(() => {
			const pos = lineStart + prefix.length;
			textareaRef?.setSelectionRange(pos, pos);
			textareaRef?.focus();
		});
	}

	function insertLink() {
		if (!textareaRef) return;
		const start = textareaRef.selectionStart;
		const end = textareaRef.selectionEnd;
		const text = content;
		const selected = text.substring(start, end) || 'link text';
		const replacement = `[${selected}](url)`;
		content = text.substring(0, start) + replacement + text.substring(end);
		requestAnimationFrame(() => {
			const urlStart = start + selected.length + 3;
			textareaRef?.setSelectionRange(urlStart, urlStart + 3);
			textareaRef?.focus();
		});
	}

	async function handleSave() {
		if (!title.trim()) { error = 'Please enter a book title'; return; }
		if (!author.trim()) { error = 'Please enter an author name'; return; }
		if (!content.trim()) { error = 'Please write some content'; return; }

		error = '';
		const snapshot = JSON.stringify({ title, author, content });
		if (snapshot === lastSavedSnapshot) return;

		const id = editId || autoSaveId || generateDraftId();
		if (!autoSaveId && !editId) autoSaveId = id;

		countdown = 5; // ← reset counter immediately on manual save
		saveState = 'saving';
		try {
			await offlineBookService.saveBook({
				title: title.trim(),
				author: author.trim(),
				url: id,
				fileType: 'markdown',
				content: content.trim()
			});
			saveBook({
				title: title.trim(),
				author: author.trim(),
				url: id,
				fileType: 'markdown'
			});
			lastSavedSnapshot = snapshot;
			savedBookCount = loadSavedBooks().length;
			saveState = 'saved';
			await new Promise<void>((r) => setTimeout(r, 2000));
			saveState = 'counting';
			countdown = 5;
		} catch (err) {
			console.error('Failed to save book:', err);
			error = 'Failed to save book. Please try again.';
			saveState = 'counting';
		}
	}
</script>

<svelte:head>
	<title>{editId ? 'Edit Book' : 'Write a Book'} - Bibliopath</title>
	<meta name="description" content="Write and publish your own book with Bibliopath" />
</svelte:head>

{#if loading}
	<div class="flex justify-center items-center h-screen">
		<span class="loading loading-spinner loading-lg"></span>
	</div>
{:else}
	<div class="h-screen flex flex-col">
		<!-- Top bar -->
		<div class="bg-base-200 border-base-300 flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center">
			<div class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
				<input
					id="book-title"
					type="text"
					placeholder="Book Title"
					class="input input-bordered input-sm w-full sm:w-64"
					bind:value={title}
				/>
				<input
					id="book-author"
					type="text"
					placeholder="Author"
					class="input input-bordered input-sm w-full sm:w-48"
					bind:value={author}
				/>
			</div>

			<div class="flex items-center gap-2">
				<div class="join hidden sm:flex">
					<button
						class="join-item btn btn-sm"
						class:btn-active={viewMode === 'edit'}
						onclick={() => (viewMode = 'edit')}
						title="Edit mode"
					>
						<FileEdit size={14} />
						Edit
					</button>
					<button
						class="join-item btn btn-sm"
						class:btn-active={viewMode === 'split'}
						onclick={() => (viewMode = 'split')}
						title="Split view"
					>
						Split
					</button>
					<button
						class="join-item btn btn-sm"
						class:btn-active={viewMode === 'preview'}
						onclick={() => (viewMode = 'preview')}
						title="Preview mode"
					>
						<Eye size={14} />
						Preview
					</button>
				</div>

				<div class="divider divider-hider mx-1 hidden sm:block"></div>

				<a href="/saved" class="btn btn-ghost btn-sm">
					Saved
					{#if savedBookCount > 0}
						<span class="badge badge-xs badge-primary">{savedBookCount}</span>
					{/if}
				</a>

				<div class="divider divider-hider mx-1 hidden sm:block"></div>

				<!-- Always-visible save status -->
				{#if saveState === 'saving'}
					<span class="text-warning text-xs hidden sm:inline mr-2">Saving…</span>
				{:else if saveState === 'saved'}
					<span class="text-success text-xs hidden sm:inline mr-2">Saved</span>
				{:else}
					<span class="text-base-content/50 text-xs hidden sm:inline mr-2">Auto-save in {countdown}s</span>
				{/if}

				<button class="btn btn-primary btn-sm" class:btn-disabled={saveState === 'saving'} onclick={handleSave}>
					{#if saveState === 'saving'}
						<span class="loading loading-spinner loading-sm"></span>
						Saving…
					{:else}
						<Save size={16} />
						{editId ? 'Save Changes' : 'Save'}
					{/if}
				</button>
			</div>
		</div>

		{#if error}
			<div class="alert alert-error rounded-none">
				<FileText size={16} />
				<span>{error}</span>
			</div>
		{/if}

		<div class="flex flex-1 overflow-hidden">
			{#if viewMode === 'edit' || viewMode === 'split'}
				<div class="flex flex-1 flex-col overflow-hidden {viewMode === 'split' ? 'w-1/2' : ''}">
					<div class="bg-base-200 border-base-300 flex items-center gap-1 border-b px-2 py-1">
						<button class="btn btn-ghost btn-xs btn-square" onclick={() => insertHeading(1)} title="Heading 1">
							<Heading1 size={16} />
						</button>
						<button class="btn btn-ghost btn-xs btn-square" onclick={() => insertHeading(2)} title="Heading 2">
							<Heading2 size={16} />
						</button>
						<div class="divider divider-hider mx-0 h-5"></div>
						<button class="btn btn-ghost btn-xs btn-square" onclick={() => wrapSelection('**', '**')} title="Bold">
							<Bold size={16} />
						</button>
						<button class="btn btn-ghost btn-xs btn-square" onclick={() => wrapSelection('*', '*')} title="Italic">
							<Italic size={16} />
						</button>
						<div class="divider divider-hider mx-0 h-5"></div>
						<button class="btn btn-ghost btn-xs btn-square" onclick={insertLink} title="Insert link">
							<Link size={16} />
						</button>
					</div>

					<textarea
						bind:this={textareaRef}
						class="textarea textarea-ghost h-full w-full resize-none rounded-none border-0 font-mono leading-relaxed focus:outline-none"
						placeholder={"# Chapter 1\n\nOnce upon a time...\n\n## Section\n\nSome **bold** and *italic* text."}
						bind:value={content}
					></textarea>
				</div>
			{/if}

			{#if viewMode === 'preview' || viewMode === 'split'}
				<div class="overflow-y-auto border-base-300 p-6 {viewMode === 'split' ? 'w-1/2 border-l' : 'flex-1'}">
					{#if content.trim()}
						<div class="prose prose-sm max-w-none">
							{@html previewHtml}
						</div>
					{:else}
						<div class="text-base-content/50 flex h-full items-center justify-center">
							<p>Start typing to see a preview</p>
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<div class="bg-base-200 border-base-300 flex justify-center gap-1 border-t p-2 sm:hidden">
			<button class="btn btn-xs" class:btn-active={viewMode === 'edit'} onclick={() => (viewMode = 'edit')}>
				<FileEdit size={14} />
				Edit
			</button>
			<button class="btn btn-xs" class:btn-active={viewMode === 'split'} onclick={() => (viewMode = 'split')}>
				Split
			</button>
			<button class="btn btn-xs" class:btn-active={viewMode === 'preview'} onclick={() => (viewMode = 'preview')}>
				<Eye size={14} />
				Preview
			</button>
		</div>
	</div>
{/if}