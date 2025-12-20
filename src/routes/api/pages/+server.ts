import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPagesCollection } from '$lib/db/collections';
import type { Page } from '$lib/types/models';
import { nanoid } from 'nanoid';

// GET /api/pages - List all pages for the authenticated user
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const pagesCollection = getPagesCollection();
	const pages = await pagesCollection
		.find({ userId: locals.user.id })
		.sort({ updatedAt: -1 })
		.toArray();

	return json(pages);
};

// POST /api/pages - Create a new page
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const body = await request.json();
	const { slug, settings } = body;

	if (!slug || !settings?.title) {
		throw error(400, 'Slug and title are required');
	}

	// Check if slug already exists
	const pagesCollection = getPagesCollection();
	const existingPage = await pagesCollection.findOne({ slug });

	if (existingPage) {
		throw error(409, 'Slug already exists');
	}

	const newPage: Page = {
		id: nanoid(),
		userId: locals.user.id,
		slug,
		settings: {
			title: settings.title,
			description: settings.description || '',
			theme: settings.theme || {
				background: '#ffffff',
				text: '#111111',
				accent: '#000000'
			},
			seo: settings.seo || {}
		},
		layout: [],
		published: false,
		createdAt: new Date(),
		updatedAt: new Date()
	};

	await pagesCollection.insertOne(newPage);

	return json(newPage, { status: 201 });
};
