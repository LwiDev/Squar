import type { PageServerLoad } from './$types';
import { getPagesCollection } from '$lib/db/collections';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const pagesCollection = getPagesCollection();
	const page = await pagesCollection.findOne({ slug: params.slug });

	if (!page) {
		throw error(404, 'Page not found');
	}

	// Vérifier si l'utilisateur connecté est le propriétaire
	const isOwner = locals.user?.id === page.userId;

	// Si visiteur ET page non publiée → 404
	if (!isOwner && !page.published) {
		throw error(404, 'Page not found');
	}

	return {
		page: {
			id: page.id,
			userId: page.userId,
			slug: page.slug,
			settings: page.settings,
			layout: page.layout,
			published: page.published
		},
		isOwner,
		user: locals.user
	};
};
