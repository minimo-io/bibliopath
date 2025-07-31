<!-- src/lib/components/BookList.svelte -->
<script lang="ts">
	import { Trash2, Clock, ExternalLink, BookOpen, WifiOff } from '@lucide/svelte';
	import type { DisplayBook } from '$lib/types';
	import { formatBytes } from '$lib/utils/offline.utils';

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
					<td class="flex flex-col items-center gap-1">
						<a href={generateBookUrl(book)} class="btn btn-primary btn-xs">
							<BookOpen size={16} />
							{book.lastRead || book.lastAccessed ? 'Continue' : 'Start'}
						</a>
						{#if showActions}
							<a
								href={book.url}
								target="_blank"
								rel="noopener noreferrer"
								class="btn btn-ghost btn-xs btn-square"
								title="Open original source"
							>
								<ExternalLink size={16} />
							</a>
							{#if handleRemoveBook}
								<button
									class="btn btn-ghost btn-xs btn-square"
									onclick={() => handleRemoveBook(book)}
									title="Remove from library"
								>
									<Trash2 size={14} />
								</button>
							{/if}
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
