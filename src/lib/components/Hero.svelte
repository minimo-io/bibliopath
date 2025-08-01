<script>
	import { AppConfig } from '$lib';
	import { Zap } from '@lucide/svelte';
</script>

<!-- Header -->
<div class="mb-8 text-center">
	<p class="text-base-content/70 mx-auto text-sm md:w-1/2 md:text-lg">
		<strong>Books for the Open Web</strong> > Bibliopath is a Nostr-powered web-based ebook reader designed
		for freedom and a platform for authors to permissionless publish Creative Common books for the open-web,
		so readers can fund them and their books via zaps.
	</p>
	<div class="mx-auto flex w-fit items-center justify-between gap-5">
		<a
			target="_blank"
			rel="nofollow noopener"
			href={AppConfig.links.donate}
			class="btn btn-sm mx-auto my-5 flex w-fit items-center"
		>
			<Zap class="h-4 text-[#FACE3C]" fill="#FACE3C" />
			<span> Consider zapping a coffee</span>
		</a>
		<!-- <div class="divider divider-horizontal">OR</div> -->
		<a
			target="_blank"
			rel="nofollow noopener"
			class="btn btn-sm btn-ghost"
			href={AppConfig.links.about}>Learn more</a
		>
	</div>
</div>
