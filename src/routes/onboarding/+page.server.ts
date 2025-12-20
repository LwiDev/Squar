import type { PageServerLoad, Actions } from './$types';
import { getPagesCollection } from '$lib/db/collections';
import { redirect, fail } from '@sveltejs/kit';
import type { Page } from '$lib/types/models';
import { nanoid } from 'nanoid';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	// Check if user already has a page
	const pagesCollection = getPagesCollection();
	const existingPage = await pagesCollection.findOne({ userId: locals.user.id });

	if (existingPage) {
		throw redirect(303, '/editor');
	}

	return {
		user: locals.user
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const slug = formData.get('slug')?.toString().toLowerCase().trim();

		if (!slug) {
			return fail(400, { error: 'Username is required' });
		}

		// Validate slug format (alphanumeric and hyphens only)
		if (!/^[a-z0-9-]+$/.test(slug)) {
			return fail(400, { error: 'Username can only contain lowercase letters, numbers, and hyphens' });
		}

		if (slug.length < 3) {
			return fail(400, { error: 'Username must be at least 3 characters' });
		}

		if (slug.length > 30) {
			return fail(400, { error: 'Username must be less than 30 characters' });
		}

		// Check if slug is already taken
		const pagesCollection = getPagesCollection();
		const existingPage = await pagesCollection.findOne({ slug });

		if (existingPage) {
			return fail(409, { error: 'This username is already taken' });
		}

		// Create page with chosen slug
		const newPage: Page = {
			id: nanoid(),
			userId: locals.user.id,
			slug,
			settings: {
				title: 'My Page',
				description: '',
				theme: {
					background: '#ffffff',
					text: '#111111',
					accent: '#000000'
				}
			},
			layout: [],
			published: false,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		await pagesCollection.insertOne(newPage);

		throw redirect(303, '/editor');
	}
};
