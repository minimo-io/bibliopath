<script lang="ts">
	import { browser } from '$app/environment';
	import { AppConfig, changeTheme } from '$lib';
	import Header from '$lib/components/Header.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	let books = $state([]);
	let loading = $state(false);
	let error: string | null = $state(null);
	let currentPage = $state(1);
	let totalCount = $state(0);
	let nextUrl = $state(null);
	let previousUrl = $state(null);
	let searchQuery = $state('');
	let searchCount = $state(0);

	const BASE_URL = AppConfig.base_index_url;

	let theme = $state('light');

	// Calculate total pages
	const totalPages = $derived(Math.ceil(totalCount / AppConfig.books_per_page));

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
			const message = err instanceof Error ? err.message : String(err);
			error = message;
			console.error('Error fetching books:', err);
		} finally {
			loading = false;
		}
	}

	// ✨ 1. This is now our single, immediate search function.
	function executeSearch() {
		currentPage = 1;
		searchCount++;
		fetchBooks(BASE_URL, 1);
	}

	onMount(() => {
		if (browser) {
			const savedTheme = localStorage.getItem('bibliopath-theme') || 'dark';
			theme = changeTheme(savedTheme, false);
		}
		// fetch books from index

		// fetchBooks();
		executeSearch();
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

	<!-- Curated books -->
	<div class="hero-content flex-col lg:flex-row-reverse">
		<div>
			<h2 class="text-2xl font-bold md:text-4xl">Curated books (test)</h2>
			<p class="py-6 text-center">👇 This will be markdown Github books</p>
		</div>
	</div>
	<ul class="text-center">
		<li>
			<a
				href="/book?type=markdown&{`book=${'https://raw.githubusercontent.com/mlschmitt/classic-books-markdown/main/Adam%20Smith/The%20Wealth%20of%20Nations.md&title=The%20Wealth%20of Nations&author=Adam%20Smith'}`}"
			>
				The Wealth of Nations (1776) - Adam Smith
			</a>
		</li>
		<li>
			<a
				href="/book?type=markdown&{`book=${'https://raw.githubusercontent.com/mlschmitt/classic-books-markdown/refs/heads/main/Alexis%20de%20Tocqueville/Democracy%20in%20America.md&title=Democracy%20in%20America&author=Alexis%20de%20Tocqueville'}`}"
			>
				Democracy in America (1835) - Alexis de Tocqueville
			</a>
		</li>

		<li>
			<a
				href="/book?type=markdown&book=https://raw.githubusercontent.com/mlschmitt/classic-books-markdown/refs/heads/main/Ayn%20Rand/Anthem.md&title=Anthem&author=Ayn Rand"
				>Anthem (1938) - Ayn Rand</a
			>
		</li>
		<li>
			<a
				href="/book?type=markdown&book=https://raw.githubusercontent.com/mlschmitt/classic-books-markdown/refs/heads/main/Charles%20Baudelaire/Les%20Fleurs%20du%20mal.md&title=Les Fleurs du mal&author=Charles Baudelaire"
				>Les Fleurs du mal (1857) - Charles Baudelaire</a
			>
		</li>

		<li>
			<a
				href="/book?type=markdown&{`book=${'https://raw.githubusercontent.com/mlschmitt/classic-books-markdown/refs/heads/main/H.P.%20Lovecraft/The%20Call%20of%20Cthulhu.md&title=The Call of Cthulhu&author= H.P. Lovecraft'}`}"
			>
				The Call of Cthulhu (1926) - H.P. Lovecraft
			</a>
		</li>
	</ul>

	<!-- <div class="hero-content mt-10 flex-col lg:flex-row-reverse">
		<div>
			<h2 class="text-2xl font-bold md:text-4xl">Gutemberg books</h2>
			<p class="py-6">Books below are fetched from the Project Gutemberg library.</p>
		</div>
	</div> -->
</div>
