import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { minioClient, getPublicUrl } from '$lib/storage/minio';
import { MINIO_BUCKET } from '$env/static/private';
import { nanoid } from 'nanoid';
import sharp from 'sharp';

// Helper to download and upload OG image to MinIO
async function uploadOGImageToMinio(imageUrl: string): Promise<string | null> {
	try {
		console.log('[MinIO] Downloading OG image:', imageUrl);
		// Download image
		const response = await fetch(imageUrl);
		if (!response.ok) {
			console.error('[MinIO] Failed to download OG image:', imageUrl, response.status);
			return null;
		}

		const buffer = Buffer.from(await response.arrayBuffer());
		console.log('[MinIO] OG image downloaded, size:', buffer.length);

		// Optimize image with Sharp
		const optimizedBuffer = await sharp(buffer)
			.resize(600, 315, {
				fit: 'cover',
				position: 'center'
			})
			.jpeg({ quality: 85, mozjpeg: true })
			.toBuffer();

		console.log('[MinIO] OG image optimized, size:', optimizedBuffer.length);

		// Generate unique filename
		const filename = `social/og/${nanoid()}.jpg`;

		// Upload to MinIO
		console.log('[MinIO] Uploading OG image to bucket:', MINIO_BUCKET, 'filename:', filename);
		await minioClient.putObject(
			MINIO_BUCKET,
			filename,
			optimizedBuffer,
			optimizedBuffer.length,
			{ 'Content-Type': 'image/jpeg' }
		);

		console.log('[MinIO] OG image upload successful');

		// Generate direct public URL (bucket must be public)
		return getPublicUrl(filename);
	} catch (e) {
		console.error('[MinIO] Failed to upload OG image to MinIO:', e);
		return null;
	}
}

export const POST: RequestHandler = async ({ request }) => {
	const { url } = await request.json();

	if (!url) {
		throw error(400, 'URL is required');
	}

	try {
		console.log('Fetching Open Graph data for:', url);

		// Fetch the page
		const response = await fetch(url, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
			}
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch page: ${response.status}`);
		}

		const html = await response.text();

		// Extract Open Graph meta tags
		const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i)?.[1] ||
			html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:title"[^>]*>/i)?.[1];

		const ogDescription = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i)?.[1] ||
			html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:description"[^>]*>/i)?.[1];

		const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i)?.[1] ||
			html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:image"[^>]*>/i)?.[1];

		const ogSiteName = html.match(/<meta[^>]*property="og:site_name"[^>]*content="([^"]*)"[^>]*>/i)?.[1] ||
			html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:site_name"[^>]*>/i)?.[1];

		// Fallback to Twitter meta tags if OG not found
		const twitterTitle = html.match(/<meta[^>]*name="twitter:title"[^>]*content="([^"]*)"[^>]*>/i)?.[1] ||
			html.match(/<meta[^>]*content="([^"]*)"[^>]*name="twitter:title"[^>]*>/i)?.[1];

		const twitterDescription = html.match(/<meta[^>]*name="twitter:description"[^>]*content="([^"]*)"[^>]*>/i)?.[1] ||
			html.match(/<meta[^>]*content="([^"]*)"[^>]*name="twitter:description"[^>]*>/i)?.[1];

		const twitterImage = html.match(/<meta[^>]*name="twitter:image"[^>]*content="([^"]*)"[^>]*>/i)?.[1] ||
			html.match(/<meta[^>]*content="([^"]*)"[^>]*name="twitter:image"[^>]*>/i)?.[1];

		// Use OG data with Twitter fallback
		const title = ogTitle || twitterTitle || ogSiteName || new URL(url).hostname;
		const description = ogDescription || twitterDescription || '';
		let imageUrl = ogImage || twitterImage;

		console.log('Extracted metadata:', { title, description, hasImage: !!imageUrl });

		// Download and upload image to MinIO if found
		let minioImageUrl = null;
		if (imageUrl) {
			// Make relative URLs absolute
			if (imageUrl.startsWith('/')) {
				const urlObj = new URL(url);
				imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
			} else if (!imageUrl.startsWith('http')) {
				const urlObj = new URL(url);
				imageUrl = `${urlObj.protocol}//${urlObj.host}/${imageUrl}`;
			}

			console.log('Downloading OG image:', imageUrl);
			minioImageUrl = await uploadOGImageToMinio(imageUrl);
			console.log('Uploaded to MinIO:', minioImageUrl ? 'success' : 'failed');
		}

		return json({
			platform: 'opengraph',
			title,
			description,
			image: minioImageUrl,
			siteName: ogSiteName
		});
	} catch (e: any) {
		console.error('Open Graph fetch error:', e);
		throw error(500, e.message || 'Failed to fetch Open Graph data');
	}
};
