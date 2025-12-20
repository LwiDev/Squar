import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPagesCollection } from '$lib/db/collections';

// GET /api/pages/:id - Get a single page
export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const pagesCollection = getPagesCollection();
	const page = await pagesCollection.findOne({ id: params.id, userId: locals.user.id });

	if (!page) {
		throw error(404, 'Page not found');
	}

	return json(page);
};

// PUT /api/pages/:id - Update a page
export const PUT: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const body = await request.json();
	const { slug, settings, layout, published } = body;

	const pagesCollection = getPagesCollection();

	// Verify ownership
	const existingPage = await pagesCollection.findOne({ id: params.id, userId: locals.user.id });
	if (!existingPage) {
		throw error(404, 'Page not found');
	}

	// If slug is being updated, check uniqueness
	if (slug !== undefined && slug !== existingPage.slug) {
		const slugTaken = await pagesCollection.findOne({ slug });
		if (slugTaken) {
			throw error(409, 'Slug already taken');
		}
	}

	const updateData: any = {
		updatedAt: new Date()
	};

	if (slug !== undefined) updateData.slug = slug;
	if (settings !== undefined) updateData.settings = settings;
	if (layout !== undefined) updateData.layout = layout;
	if (published !== undefined) updateData.published = published;

	const result = await pagesCollection.findOneAndUpdate(
		{ id: params.id, userId: locals.user.id },
		{ $set: updateData },
		{ returnDocument: 'after' }
	);

	if (!result) {
		throw error(404, 'Page not found');
	}

	return json(result);
};

// DELETE /api/pages/:id - Delete a page
export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const pagesCollection = getPagesCollection();
	const result = await pagesCollection.deleteOne({ id: params.id, userId: locals.user.id });

	if (result.deletedCount === 0) {
		throw error(404, 'Page not found');
	}

	return json({ success: true });
};
