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
		// Download image
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 30000);

		const response = await fetch(imageUrl, {
			signal: controller.signal,
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
				'Accept': 'image/*',
				'Referer': 'https://www.instagram.com/'
			}
		}).finally(() => clearTimeout(timeoutId));

		if (!response.ok) {
			throw error(500, 'Failed to download image');
		}

		const buffer = Buffer.from(await response.arrayBuffer());

		// Optimize image
		const optimizedBuffer = await sharp(buffer)
			.resize(400, 400, {
				fit: 'cover',
				position: 'center'
			})
			.jpeg({ quality: 80, mozjpeg: true })
			.toBuffer();

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
