import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { minioClient, getPublicUrl } from '$lib/storage/minio';
import { MINIO_BUCKET } from '$env/static/private';
import { nanoid } from 'nanoid';
import sharp from 'sharp';

export const POST: RequestHandler = async ({ request }) => {
	const { imageUrl, platform = 'social' } = await request.json();

	if (!imageUrl) {
		throw error(400, 'Image URL is required');
	}

	try {
		// Use images.weserv.nl as a proxy to bypass Instagram IP blocking
		// This service downloads the image for us and optimizes it
		const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}&w=400&h=400&fit=cover&output=jpg&q=80`;

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 30000);

		const response = await fetch(proxyUrl, {
			signal: controller.signal
		}).finally(() => clearTimeout(timeoutId));

		if (!response.ok) {
			throw error(500, 'Failed to download image');
		}

		// Image is already optimized by weserv.nl, just get the buffer
		const optimizedBuffer = Buffer.from(await response.arrayBuffer());

		// Generate unique filename
		const filename = `social/${platform}/${nanoid()}.jpg`;

		// Upload to MinIO
		await minioClient.putObject(
			MINIO_BUCKET,
			filename,
			optimizedBuffer,
			optimizedBuffer.length,
			{ 'Content-Type': 'image/jpeg' }
		);

		// Generate presigned URL
		const presignedUrl = await minioClient.presignedGetObject(
			MINIO_BUCKET,
			filename,
			7 * 24 * 60 * 60
		);

		// Convert to public URL
		const publicUrl = getPublicUrl(presignedUrl);

		return json({ url: publicUrl });
	} catch (e) {
		console.error('[Upload from URL] Error:', e);
		throw error(500, 'Failed to upload image');
	}
};
