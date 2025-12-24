import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { minioClient, getPublicUrl } from '$lib/storage/minio';
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

		console.log('[MinIO] Uploading file:', filename, 'size:', file.size);

		// Convert file to buffer
		const buffer = Buffer.from(await file.arrayBuffer());

		// Upload to MinIO
		await minioClient.putObject(MINIO_BUCKET, filename, buffer, file.size, {
			'Content-Type': file.type
		});

		console.log('[MinIO] File uploaded successfully');

		// Generate direct public URL (bucket must be public)
		const publicUrl = getPublicUrl(filename);

		return json({ url: publicUrl, filename });
	} catch (e) {
		console.error('[MinIO] Upload error:', e);
		throw error(500, 'Failed to upload image');
	}
};
