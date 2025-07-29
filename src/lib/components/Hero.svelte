<script>
	import { AppConfig } from '$lib';
	import { Zap } from '@lucide/svelte';
</script>

<!-- Header -->
<div class="mb-8 text-center">
	<p class="text-base-content/70 mx-auto text-sm md:w-1/2 md:text-lg">
		<strong>Books for the Open Web</strong> > Discover, read, and connect with authors and readers on
		a Nostr community-driven platform built for the future of publishing & reading.
	</p>
	<div class="mx-auto flex w-fit items-center justify-between gap-5">
		<a
			target="_blank"
			rel="nofollow noopener"
			href="https://njump.me/nprofile1qqs8wftkcz9achdy8ascqtnk0v3rrcevda2klm8wqyd6xrlk8skc22gekra89"
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
			href={AppConfig.links.about}>About</a
		>
	</div>
</div>
