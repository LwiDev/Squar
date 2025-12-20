import type { LayoutServerLoad } from './$types';
import { getPagesCollection } from '$lib/db/collections';

export const load: LayoutServerLoad = async ({ locals }) => {
	let page = null;

	if (locals.user) {
		try {
			const pagesCollection = getPagesCollection();
			const p = await pagesCollection.findOne(
				{ userId: locals.user.id },
				{ projection: { slug: 1, published: 1 } }
			);

			if (p) {
				page = {
					slug: p.slug,
					published: p.published
				};
			}
		} catch (e) {
			console.error('Failed to fetch user page for layout', e);
		}
	}

	return {
		user: locals.user,
		page
	};
};
