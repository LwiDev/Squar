import type { PageServerLoad } from './$types';
import { getPagesCollection } from '$lib/db/collections';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	const pagesCollection = getPagesCollection();
	const page = await pagesCollection.findOne({ userId: locals.user.id });

	if (!page) {
		throw redirect(303, '/signup');
	}

	return {
		user: locals.user,
		page: {
			id: page.id,
			slug: page.slug,
			settings: page.settings,
			layout: page.layout,
			published: page.published
		}
	};
};
