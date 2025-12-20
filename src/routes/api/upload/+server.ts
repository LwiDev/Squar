import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { minioClient } from '$lib/storage/minio';
import { MINIO_BUCKET } from '$env/static/private';
import { nanoid } from 'nanoid';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const formData = await request.formData();
	const file = formData.get('file') as File;

	if (!file) {
		throw error(400, 'No file provided');
	}

	// Validate file type
	if (!file.type.startsWith('image/')) {
		throw error(400, 'File must be an image');
	}

	// Validate file size (max 5MB)
	if (file.size > 5 * 1024 * 1024) {
		throw error(400, 'File size must be less than 5MB');
	}

	try {
		// Generate unique filename
		const ext = file.name.split('.').pop();
		const filename = `${locals.user.id}/${nanoid()}.${ext}`;

		// Convert file to buffer
		const buffer = Buffer.from(await file.arrayBuffer());

		// Upload to MinIO
		await minioClient.putObject(MINIO_BUCKET, filename, buffer, file.size, {
			'Content-Type': file.type
		});

		// Generate public URL
		const url = await minioClient.presignedGetObject(MINIO_BUCKET, filename, 7 * 24 * 60 * 60); // 7 days

		return json({ url: url.split('?')[0] + `?t=${Date.now()}`, filename });
	} catch (e) {
		console.error('Upload error:', e);
		throw error(500, 'Failed to upload image');
	}
};
