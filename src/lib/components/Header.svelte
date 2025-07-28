<script lang="ts">
	import { Bell, Menu, Origami, Search } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let {
		searchQuery = $bindable(''),
		onSearchClick,
		onSearchKeydown,
		loading = false,
		searchCount
	} = $props();

	onMount(() => {});
</script>

<div class="bg-base-100 flex h-16 items-center justify-between px-4 shadow-sm">
	<div class="flex flex-shrink-0 items-center">
		<div class="dropdown">
			<div tabindex="0" role="button" aria-label="Open menu" class="btn btn-ghost btn-circle">
				<Menu class="h-5" />
			</div>
			<ul class="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow">
				<li><a href="/">Homepage</a></li>
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
					class:input-disabled={loading}
					bind:value={searchQuery}
					onkeydown={onSearchKeydown}
					disabled={loading && searchCount > 1}
				/>
				<button
					class="btn btn-ghost btn-sm btn-square absolute top-1/2 right-2 z-10 -translate-y-1/2"
					class:btn-disabled={loading}
					onclick={onSearchClick}
					disabled={loading}
					aria-label="Execute search"
				>
					<Search class="h-5" />
				</button>
			</div>
		</div>
	</div>

	<div class="flex flex-shrink-0 items-center gap-2">
		<button aria-label="Notifications" class="btn btn-ghost btn-circle">
			<div class="indicator">
				<Bell class="h-5" />
				<span class="badge badge-xs badge-primary indicator-item"></span>
			</div>
		</button>
	</div>
</div>

<div class="p-4 sm:hidden">
	<div class="relative w-full">
		<input
			type="text"
			placeholder="Search books, authors, subjects..."
			class="input input-bordered w-full pr-12"
			class:input-disabled={loading}
			bind:value={searchQuery}
			onkeydown={onSearchKeydown}
			disabled={loading && searchCount > 1}
		/>
		<button
			class="btn btn-ghost btn-sm btn-square absolute top-1/2 right-2 z-10 -translate-y-1/2"
			class:btn-disabled={loading}
			onclick={onSearchClick}
			disabled={loading}
			aria-label="Execute mobile search"
		>
			<Search class="h-5" />
		</button>
	</div>
</div>
