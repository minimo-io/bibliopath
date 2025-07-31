<script lang="ts">
	import { browser } from '$app/environment';
	import { AppConfig, changeTheme } from '$lib';
	import Header from '$lib/components/Header.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import BookOpenForm from '$lib/components/BookOpenForm.svelte';
	import { LayoutGrid, List } from '@lucide/svelte';

	import curatedBooks from '../data/books-curated.json';

	let isGridView = $state(true); // New state for view switcher

	let theme = $state('light');

	onMount(() => {
		if (browser) {
			const savedTheme = localStorage.getItem('bibliopath-theme') || 'dark';
			theme = changeTheme(savedTheme, false);
		}
	});
</script>

<svelte:head>
	<title>Bibliopath</title>
	<meta
		name="description"
		content="Bibliopath is a tool and a platform for Open reading & Open publishing. We help authors publish Books for the Open Web and Readers to have control over their books."
	/>
</svelte:head>

<div class="container mx-auto max-w-7xl p-4">
	<!-- Header -->
	<Hero />

	<!-- Quick Open Section -->
	<BookOpenForm />

	<!-- Curated books -->
	<div class="mb-4 flex items-center justify-between">
		<div class="hero-content flex-col lg:flex-row-reverse">
			<div>
				<h2 class="text-2xl font-bold md:text-4xl">Curated books (test)</h2>
				<p class="py-6 text-center">👇 This will be markdown Github books</p>
			</div>
		</div>
		<div class="btn-group">
			<button
				class="btn btn-sm"
				class:btn-primary={isGridView}
				class:btn-ghost={!isGridView}
				onclick={() => (isGridView = true)}
			>
				<LayoutGrid size={18} />
				Grid
			</button>
			<button
				class="btn btn-sm"
				class:btn-primary={!isGridView}
				class:btn-ghost={isGridView}
				onclick={() => (isGridView = false)}
			>
				<List size={18} />
				List
			</button>
		</div>
	</div>

	{#if isGridView}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
			{#each curatedBooks as book}
				<div class="card bg-base-200 shadow-sm">
					<figure class="hidden">
						<img
							src={book.cover || '/placeholder-book.jpg'}
							alt="Book Cover"
							class="h-48 w-full object-cover"
						/>
					</figure>
					<div class="card-body p-4">
						<h3 class="card-title line-clamp-2 text-lg">{book.title}</h3>
						<p class="text-base-content/70 text-sm">by {book.author}</p>
						<div class="card-actions mt-2 justify-end">
							<a
								href="/book?type=markdown&book={book.url}&title={book.title}&author={book.author}"
								class="btn btn-primary btn-sm"
							>
								Read Book
							</a>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4">
			{#each curatedBooks as book}
				<div class="card card-side bg-base-200 flex-row shadow-sm">
					<figure>
						<img
							src={book.cover || '/placeholder-book.jpg'}
							alt="Book Cover"
							class="rounded-l-box hidden h-auto w-24 object-cover md:block"
						/>
					</figure>
					<div class="card-body flex-grow p-4">
						<h3 class="card-title line-clamp-2 text-lg">{book.title}</h3>
						<p class="text-base-content/70 text-sm">by {book.author}</p>
						<div class="card-actions mt-2 justify-end">
							<a
								href="/book?type=markdown&book={book.url}&title={book.title}&author={book.author}"
								class="btn btn-primary btn-sm"
							>
								Read Book
							</a>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- <div class="hero-content mt-10 flex-col lg:flex-row-reverse">
		<div>
			<h2 class="text-2xl font-bold md:text-4xl">Gutemberg books</h2>
			<p class="py-6">Books below are fetched from the Project Gutemberg library.</p>
		</div>
	</div> -->
</div>
