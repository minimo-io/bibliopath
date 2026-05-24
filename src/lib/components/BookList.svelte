<!-- src/lib/components/BookList.svelte -->
<script lang="ts">
	import { Trash2, Clock, ExternalLink, BookOpen, WifiOff, Pen, FileDown } from '@lucide/svelte';
	import type { DisplayBook } from '$lib/types';
	import { formatBytes } from '$lib/utils/offline.utils';
	import { offlineBookService } from '$lib/services/offline.services';

	let { books, handleRemoveBook, generateBookUrl, getLastActivity, showActions = true } = $props<{
		books: any[];
		handleRemoveBook?: (book: any) => void;
		generateBookUrl: (book: any) => string;
		getLastActivity?: (
			book: any
		) => {
			text: string;
			timestamp: number;
		};
		showActions?: boolean;
	}>();

	async function downloadBookAsMd(book: any) {
		try {
			const offlineBook = await offlineBookService.getBook(book.url);
			if (!offlineBook?.content) {
				alert('Book content not found.');
				return;
			}
			const sanitized = book.title.replace(/[^a-zA-Z0-9 ]/g, '_');
			const blob = new Blob([offlineBook.content], { type: 'text/markdown' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${sanitized}.md`;
			a.click();
			URL.revokeObjectURL(url);
		} catch (err) {
			console.error('Failed to download book:', err);
			alert('Failed to download book.');
		}
	}
</script>

<div class="overflow-x-auto">
	<table class="table w-full">
		<!-- head -->
		<thead>
			<tr>
				<th>Title</th>
				<th>Author</th>
				{#if getLastActivity}
					<th>Last Activity</th>
				{/if}
				<th>Format</th>
				<th>Status</th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each books as book (book.url)}
				<tr class="hover">
										<td>
						<a href={generateBookUrl(book)} class="link link-hover">{book.title}</a>
					</td>
					<td>{book.author}</td>
					{#if getLastActivity}
						<td>{getLastActivity(book).text}</td>
					{/if}
					<td>
						<span class="badge badge-xs badge-outline">{book.fileType || book.type}</span>
					</td>
					<td>
						<div class="flex items-center gap-1">
							{#if book.isOffline}
								<div class="tooltip" data-tip="Available offline">
									<WifiOff size={14} class="text-success" />
								</div>
							{/if}
							{#if book.isOffline && book.contentSize}
								<span class="badge badge-xs badge-success">{formatBytes(book.contentSize)}</span>
							{/if}
						</div>
					</td>
					<td class="text-right">
						<div class="dropdown dropdown-left">

							<div tabindex="0" role="button" class="btn btn-ghost btn-xs btn-square">

								<svg

									xmlns="http://www.w3.org/2000/svg"

									width="24"

									height="24"

									viewBox="0 0 24 24"

									fill="none"

									stroke="currentColor"

									stroke-width="2"

									stroke-linecap="round"

									stroke-linejoin="round"

									class="lucide lucide-more-vertical"

									><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle

										cx="12"

										cy="19"

										r="1"

									/></svg

								>

							</div>

							<ul

								tabindex="0"

								class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"

							>

								<li>

									<a href={generateBookUrl(book)} class="btn btn-primary btn-xs">

										<BookOpen size={16} />

										{book.lastRead || book.lastAccessed ? 'Continue' : 'Start'}

									</a>

								</li>

								{#if showActions}

									{#if book.url?.startsWith('draft-')}
									<li>
										<a href="/write?edit={encodeURIComponent(book.url)}" class="btn btn-ghost btn-xs" title="Edit">
											<Pen size={14} />
											Edit
										</a>
									</li>
									<li>
										<button class="btn btn-ghost btn-xs" onclick={() => downloadBookAsMd(book)} title="Download .md">
											<FileDown size={14} />
											Download .md
										</button>
									</li>
								{:else}
									<li>
										<a href={book.url} target="_blank" rel="noopener noreferrer" class="btn btn-ghost btn-xs" title="Open original source">
											<ExternalLink size={16} />
											Open original source
										</a>
									</li>
								{/if}

									{#if handleRemoveBook}

										<li>

											<button

												class="btn btn-ghost btn-xs"

												onclick={() => handleRemoveBook(book)}

												title="Remove from library"

											>

												<Trash2 size={14} />

												Remove from library

											</button>

										</li>

									{/if}

								{/if}

							</ul>

						</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
