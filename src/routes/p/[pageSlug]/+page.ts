import { error } from '@sveltejs/kit';

export const prerender = true;

export async function load({ params }) {
	try {
		const { pageSlug } = params;
		const post = await import(`../../../lib/content/pages/${pageSlug}.md`);

		return {
			content: post.default,
			meta: post.metadata
		};
	} catch (e) {
		error(404, 'Page not found');
	}
}
