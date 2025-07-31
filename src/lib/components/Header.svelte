<script lang="ts">
	import { browser } from '$app/environment';
	import { AppConfig } from '$lib';
	import type { SavedBook } from '$lib/types';
	import { Bell, Heart, Menu, Origami, Search } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { loadSavedBooks } from '$services/saved.services';

	let { searchQuery = $bindable(''), onSearchClick, onSearchKeydown } = $props();

	let savedBooks: SavedBook[] = $state([]);

	onMount(() => {
		savedBooks = loadSavedBooks();
	});
</script>

<div class="bg-base-100 flex h-16 items-center justify-between px-4 shadow-sm">
	<div class="flex flex-shrink-0 items-center">
		<div class="dropdown">
			<div tabindex="0" role="button" aria-label="Open menu" class="btn btn-ghost btn-circle">
				<Menu class="h-5" />
			</div>
			<ul
				class="menu menu-sm dropdown-content bg-base-200 rounded-box border-base-300 z-10 mt-3 w-52 border p-2 shadow"
			>
				<li>
					<a href="/saved" class="flex gap-1">
						<Heart class="h-[15px] text-red-600" fill="red" />
						Saved
					</a>
				</li>
				<div class="divider my-0"></div>
				<li><a href="/">Homepage</a></li>

				<li><a target="_blank" href={AppConfig.links.roadmap}>Roadmap</a></li>
				<li>
					<a target="_blank" rel="noopener" href={AppConfig.links.about}>About</a>
				</li>
			</ul>
		</div>
		<a class="btn btn-ghost ml-2 text-xl md:text-2xl" href="/">
			<Origami class="h-5 md:h-6" />
			Bibliopath
		</a>
	</div>

	<div class="hidden flex-1 justify-center sm:flex">
		<div class="form-control w-full max-w-5xl">
			<div class="relative">
				<input
					id="search"
					type="text"
					placeholder="Search books, authors, subjects..."
					class="input input-bordered input-sm md:input-md w-full pr-12"
					bind:value={searchQuery}
					onkeydown={onSearchKeydown}
				/>
				<button
					class="btn btn-ghost btn-sm btn-square absolute top-1/2 right-2 z-10 -translate-y-1/2"
					onclick={onSearchClick}
					aria-label="Execute search"
				>
					<Search class="h-5" />
				</button>
			</div>
		</div>
	</div>

	<div class="flex flex-shrink-0 items-center gap-2">
		<!-- Saved -->
		<a href="/saved" aria-label="Configs" class="btn btn-ghost btn-circle">
			<div class="indicator">
				<Heart class="h-5" />
				<span class="badge badge-xs badge-primary indicator-item">{savedBooks.length}</span>
			</div>
		</a>
		<!-- Notifications  -->
		<button aria-label="Notifications" class="btn btn-ghost btn-circle">
			<div class="indicator">
				<Bell class="h-5" />
				<span class="badge badge-xs badge-primary indicator-item">0</span>
			</div>
		</button>
	</div>
</div>

<div class="rounded-none px-0 sm:hidden">
	<div class="relative w-full">
		<input
			id="search"
			type="text"
			placeholder="Search books, authors, subjects..."
			class="input w-full rounded-none border-x-0 pr-12"
			bind:value={searchQuery}
			onkeydown={onSearchKeydown}
		/>
		<button
			class="btn btn-ghost btn-sm btn-square absolute top-1/2 right-2 z-10 -translate-y-1/2"
			onclick={onSearchClick}
			aria-label="Execute mobile search"
		>
			<Search class="h-5" />
		</button>
	</div>
</div>
