import type { PageServerLoad } from './$types';
import { getPagesCollection } from '$lib/db/collections';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const pagesCollection = getPagesCollection();
	const page = await pagesCollection.findOne({ slug: params.slug, published: true });

	if (!page) {
		throw error(404, 'Page not found');
	}

	return {
		page: {
			slug: page.slug,
			settings: page.settings,
			layout: page.layout
		}
	};
};
