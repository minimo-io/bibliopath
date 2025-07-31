<!-- src/lib/components/BookList.svelte -->
<script lang="ts">
	import { Trash2, Clock, ExternalLink, BookOpen, WifiOff } from '@lucide/svelte';
	import type { DisplayBook } from '$lib/types';
	import { formatBytes } from '$lib/utils/offline.utils';

	let { books, handleRemoveBook, generateBookUrl, getLastActivity } = $props<{
		books: DisplayBook[];
		handleRemoveBook: (book: DisplayBook) => void;
		generateBookUrl: (book: DisplayBook) => string;
		getLastActivity: (
			book: DisplayBook
		) => {
			text: string;
			timestamp: number;
		};
	}>();
</script>

<div class="overflow-x-auto">
	<table class="table w-full">
		<!-- head -->
		<thead>
			<tr>
				<th>Title</th>
				<th>Author</th>
				<th>Last Activity</th>
				<th>Format</th>
				<th>Status</th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each books as book (book.url)}
				<tr class="hover">
					<td>{book.title}</td>
					<td>{book.author}</td>
					<td>{getLastActivity(book).text}</td>
					<td>
						<span class="badge badge-xs badge-outline">{book.fileType}</span>
					</td>
					<td>
						{#if book.isOffline}
							<div class="tooltip" data-tip="Available offline">
								<WifiOff size={14} class="text-success" />
							</div>
						{/if}
						{#if book.isOffline && book.contentSize}
							<span class="badge badge-xs badge-success">{formatBytes(book.contentSize)}</span>
						{/if}
					</td>
					<td class="flex items-center gap-1">
						<a href={generateBookUrl(book)} class="btn btn-primary btn-xs">
							<BookOpen size={16} />
							{book.lastRead || book.lastAccessed ? 'Continue' : 'Start'}
						</a>
						<a
							href={book.url}
							target="_blank"
							rel="noopener noreferrer"
							class="btn btn-ghost btn-xs btn-square"
							title="Open original source"
						>
							<ExternalLink size={16} />
						</a>
						<button
							class="btn btn-ghost btn-xs btn-square"
							onclick={() => handleRemoveBook(book)}
							title="Remove from library"
						>
							<Trash2 size={14} />
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
