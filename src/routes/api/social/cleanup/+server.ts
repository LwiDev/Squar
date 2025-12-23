import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { minioClient } from '$lib/storage/minio';
import { MINIO_BUCKET } from '$env/static/private';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const { imageUrls, favicon } = await request.json();

	if (!imageUrls || !Array.isArray(imageUrls)) {
		throw error(400, 'imageUrls array is required');
	}

	try {
		// Collect all URLs to delete (images + favicon)
		const allUrls = [...imageUrls];
		if (favicon) {
			allUrls.push(favicon);
		}

		// Extract filenames from MinIO URLs and delete them
		const deletePromises = allUrls.map(async (url: string) => {
			try {
				// Extract filename from MinIO URL
				// Example: http://localhost:9000/bucket/social/instagram/abc123.jpg
				const urlObj = new URL(url);
				const filename = urlObj.pathname.split('/').slice(2).join('/'); // Remove /bucket/ part

				if (filename.startsWith('social/')) {
					await minioClient.removeObject(MINIO_BUCKET, filename);
					console.log('Deleted MinIO file:', filename);
				}
			} catch (e) {
				console.error('Failed to delete file:', url, e);
				// Don't fail the entire request if one file fails
			}
		});

		await Promise.all(deletePromises);

		return json({ success: true });
	} catch (e) {
		console.error('Cleanup error:', e);
		throw error(500, 'Failed to cleanup images');
	}
};
