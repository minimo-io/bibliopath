<script lang="ts">
	import { browser } from '$app/environment';
	import { changeTheme } from '$lib';
	import { onMount } from 'svelte';

	let theme = $state('light');

	onMount(() => {
		if (browser) {
			const savedTheme = localStorage.getItem('bibliopath-theme') || 'dark';
			theme = changeTheme(savedTheme, false);
		}
		// fetch books from index

		// fetchBooks();
		// executeSearch();
	});
</script>

SEARCH WILL BE DONE HERE
