import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { minioClient, getPublicUrl } from '$lib/storage/minio';
import { MINIO_BUCKET, X_BEARER_TOKEN } from '$env/static/private';
import { nanoid } from 'nanoid';
import sharp from 'sharp';

// Helper to download and upload Instagram image to MinIO
async function uploadInstagramImageToMinio(imageUrl: string, platform: string): Promise<string | null> {
	try {
		console.log('[MinIO] Downloading image:', imageUrl);
		// Download image
		const response = await fetch(imageUrl);
		if (!response.ok) {
			console.error('[MinIO] Failed to download image:', imageUrl, response.status);
			return null;
		}

		const buffer = Buffer.from(await response.arrayBuffer());
		console.log('[MinIO] Image downloaded, size:', buffer.length);

		// Optimize image with Sharp
		const optimizedBuffer = await sharp(buffer)
			.resize(400, 400, {
				fit: 'cover',
				position: 'center'
			})
			.jpeg({ quality: 80, mozjpeg: true })
			.toBuffer();

		console.log('[MinIO] Image optimized, size:', optimizedBuffer.length);

		// Generate unique filename
		const filename = `social/${platform}/${nanoid()}.jpg`;

		// Upload to MinIO
		console.log('[MinIO] Uploading to bucket:', MINIO_BUCKET, 'filename:', filename);
		await minioClient.putObject(
			MINIO_BUCKET,
			filename,
			optimizedBuffer,
			optimizedBuffer.length,
			{ 'Content-Type': 'image/jpeg' }
		);

		console.log('[MinIO] Upload successful');

		// Generate presigned URL (7 days expiry)
		const presignedUrl = await minioClient.presignedGetObject(
			MINIO_BUCKET,
			filename,
			7 * 24 * 60 * 60 // 7 days
		);

		console.log('[MinIO] Generated presigned URL:', presignedUrl);

		// Convert to public URL and return
		return getPublicUrl(presignedUrl);
	} catch (e) {
		console.error('[MinIO] Failed to upload image:', e);
		return null;
	}
}

export const POST: RequestHandler = async ({ request }) => {
	const { url } = await request.json();

	if (!url) {
		throw error(400, 'URL is required');
	}

	try {
		// Detect platform
		const urlObj = new URL(url);
		const hostname = urlObj.hostname.replace('www.', '');

		// Try platform-specific fetchers first
		if (hostname === 'instagram.com' || hostname.includes('instagram')) {
			return await fetchInstagramData(url);
		} else if (hostname === 'tiktok.com' || hostname === 'vm.tiktok.com') {
			return await fetchTikTokData(url);
		} else if (hostname === 'x.com' || hostname === 'twitter.com') {
			return await fetchTwitterData(url);
		} else {
			// Fallback to Open Graph for all other sites (Twitch, etc.)
			return await fetchOpenGraphData(url);
		}
	} catch (e: any) {
		console.error('Failed to fetch social data:', e);
		throw error(500, e.message || 'Failed to fetch social data');
	}
};

// Helper to upload OG image to MinIO
async function uploadOGImageToMinio(imageUrl: string): Promise<string | null> {
	try {
		console.log('[MinIO] Downloading OG image:', imageUrl);
		const response = await fetch(imageUrl);
		if (!response.ok) {
			console.error('[MinIO] Failed to download OG image:', imageUrl, response.status);
			return null;
		}

		const buffer = Buffer.from(await response.arrayBuffer());
		console.log('[MinIO] OG image downloaded, size:', buffer.length);

		const optimizedBuffer = await sharp(buffer)
			.resize(600, 315, {
				fit: 'cover',
				position: 'center'
			})
			.jpeg({ quality: 85, mozjpeg: true })
			.toBuffer();

		console.log('[MinIO] OG image optimized, size:', optimizedBuffer.length);

		const filename = `social/og/${nanoid()}.jpg`;

		console.log('[MinIO] Uploading OG image to bucket:', MINIO_BUCKET, 'filename:', filename);
		await minioClient.putObject(
			MINIO_BUCKET,
			filename,
			optimizedBuffer,
			optimizedBuffer.length,
			{ 'Content-Type': 'image/jpeg' }
		);

		console.log('[MinIO] OG image upload successful');

		const presignedUrl = await minioClient.presignedGetObject(
			MINIO_BUCKET,
			filename,
			7 * 24 * 60 * 60
		);

		console.log('[MinIO] Generated presigned URL for OG image');

		// Convert to public URL and return
		return getPublicUrl(presignedUrl);
	} catch (e) {
		console.error('[MinIO] Failed to upload OG image:', e);
		return null;
	}
}

// Helper to upload favicon to MinIO
async function uploadFaviconToMinio(faviconUrl: string): Promise<string | null> {
	try {
		console.log('[MinIO] Downloading favicon:', faviconUrl);
		const response = await fetch(faviconUrl);
		if (!response.ok) {
			console.error('[MinIO] Failed to download favicon:', faviconUrl, response.status);
			return null;
		}

		const buffer = Buffer.from(await response.arrayBuffer());
		console.log('[MinIO] Favicon downloaded, size:', buffer.length);

		// Try to process as image, if it fails, it might be SVG or unsupported format
		let optimizedBuffer;
		let ext = 'png';

		try {
			optimizedBuffer = await sharp(buffer)
				.resize(128, 128, {
					fit: 'contain',
					background: { r: 0, g: 0, b: 0, alpha: 0 },
					kernel: sharp.kernel.lanczos3 // Best quality resize
				})
				.png({ quality: 100, compressionLevel: 9 })
				.toBuffer();
			console.log('[MinIO] Favicon optimized, size:', optimizedBuffer.length);
		} catch (e) {
			// If sharp fails (e.g., SVG), just use the original
			console.log('[MinIO] Favicon optimization failed, using original');
			optimizedBuffer = buffer;
			ext = faviconUrl.endsWith('.svg') ? 'svg' : 'png';
		}

		const filename = `social/favicon/${nanoid()}.${ext}`;
		const contentType = ext === 'svg' ? 'image/svg+xml' : 'image/png';

		console.log('[MinIO] Uploading favicon to bucket:', MINIO_BUCKET, 'filename:', filename);
		await minioClient.putObject(
			MINIO_BUCKET,
			filename,
			optimizedBuffer,
			optimizedBuffer.length,
			{ 'Content-Type': contentType }
		);

		console.log('[MinIO] Favicon upload successful');

		const presignedUrl = await minioClient.presignedGetObject(
			MINIO_BUCKET,
			filename,
			7 * 24 * 60 * 60
		);

		console.log('[MinIO] Generated presigned URL for favicon');

		// Convert to public URL and return
		return getPublicUrl(presignedUrl);
	} catch (e) {
		console.error('[MinIO] Failed to upload favicon:', e);
		return null;
	}
}

async function fetchOpenGraphData(url: string) {
	try {
		console.log('Fetching Open Graph data for:', url);

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
		const urlObj = new URL(url);

		// Extract Open Graph meta tags
		const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i)?.[1] ||
			html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:title"[^>]*>/i)?.[1];

		const ogDescription = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i)?.[1] ||
			html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:description"[^>]*>/i)?.[1];

		const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i)?.[1] ||
			html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:image"[^>]*>/i)?.[1];

		const ogSiteName = html.match(/<meta[^>]*property="og:site_name"[^>]*content="([^"]*)"[^>]*>/i)?.[1] ||
			html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:site_name"[^>]*>/i)?.[1];

		// Fallback to Twitter meta tags
		const twitterTitle = html.match(/<meta[^>]*name="twitter:title"[^>]*content="([^"]*)"[^>]*>/i)?.[1];
		const twitterDescription = html.match(/<meta[^>]*name="twitter:description"[^>]*content="([^"]*)"[^>]*>/i)?.[1];
		const twitterImage = html.match(/<meta[^>]*name="twitter:image"[^>]*content="([^"]*)"[^>]*>/i)?.[1];

		// Extract favicon - prioritize high-res apple-touch-icon (180x180+)
		let faviconUrl = html.match(/<link[^>]*rel="apple-touch-icon"[^>]*href="([^"]*)"[^>]*>/i)?.[1] ||
			html.match(/<link[^>]*href="([^"]*)"[^>]*rel="apple-touch-icon"[^>]*>/i)?.[1] ||
			html.match(/<link[^>]*rel="icon"[^>]*sizes="[^"]*192[^"]*"[^>]*href="([^"]*)"[^>]*>/i)?.[1] ||
			html.match(/<link[^>]*rel="icon"[^>]*href="([^"]*)"[^>]*>/i)?.[1] ||
			html.match(/<link[^>]*href="([^"]*)"[^>]*rel="icon"[^>]*>/i)?.[1] ||
			html.match(/<link[^>]*rel="shortcut icon"[^>]*href="([^"]*)"[^>]*>/i)?.[1] ||
			html.match(/<link[^>]*href="([^"]*)"[^>]*rel="shortcut icon"[^>]*>/i)?.[1];

		// Fallback to /favicon.ico
		if (!faviconUrl) {
			faviconUrl = `${urlObj.protocol}//${urlObj.host}/favicon.ico`;
		} else if (faviconUrl.startsWith('/')) {
			faviconUrl = `${urlObj.protocol}//${urlObj.host}${faviconUrl}`;
		} else if (!faviconUrl.startsWith('http')) {
			faviconUrl = `${urlObj.protocol}//${urlObj.host}/${faviconUrl}`;
		}

		let rawTitle = ogTitle || twitterTitle || ogSiteName || urlObj.hostname;

		// Clean up title: remove common suffixes like " - Overview", " | GitHub", etc.
		let title = rawTitle;
		const separators = [' - ', ' | ', ' : '];
		for (const sep of separators) {
			if (title.includes(sep)) {
				title = title.split(sep)[0];
				break;
			}
		}

		const description = ogDescription || twitterDescription || '';
		let imageUrl = ogImage || twitterImage;

		console.log('Extracted OG metadata:', { title, description, hasImage: !!imageUrl, hasFavicon: !!faviconUrl });

		// Download and upload image to MinIO if found
		let minioImageUrl = null;
		if (imageUrl) {
			// Make relative URLs absolute
			if (imageUrl.startsWith('/')) {
				imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
			} else if (!imageUrl.startsWith('http')) {
				imageUrl = `${urlObj.protocol}//${urlObj.host}/${imageUrl}`;
			}

			console.log('Downloading OG image:', imageUrl);
			minioImageUrl = await uploadOGImageToMinio(imageUrl);
			console.log('Uploaded to MinIO:', minioImageUrl ? 'success' : 'failed');
		}

		// Download and upload favicon to MinIO
		let minioFaviconUrl = null;
		if (faviconUrl) {
			console.log('Downloading favicon:', faviconUrl);
			minioFaviconUrl = await uploadFaviconToMinio(faviconUrl);
			console.log('Favicon uploaded to MinIO:', minioFaviconUrl ? 'success' : 'failed');
		}

		return json({
			platform: 'opengraph',
			title,
			description,
			image: minioImageUrl,
			siteName: ogSiteName,
			favicon: minioFaviconUrl,
			images: minioImageUrl ? [minioImageUrl] : []
		});
	} catch (e: any) {
		console.error('Open Graph fetch error:', e);
		// Return basic data on error
		return json({
			platform: 'opengraph',
			title: new URL(url).hostname,
			description: '',
			image: null,
			favicon: null,
			images: []
		});
	}
}

async function fetchInstagramData(url: string) {
	try {
		console.log('Fetching Instagram data for URL:', url);

		// Extract username from URL
		let username = '';
		const patterns = [
			/instagram\.com\/([^/?#]+)/i,
			/instagr\.am\/([^/?#]+)/i,
			/@([a-zA-Z0-9._]+)/
		];

		for (const pattern of patterns) {
			const match = url.match(pattern);
			if (match && match[1]) {
				username = match[1].replace('@', '');
				break;
			}
		}

		if (!username && url && !url.includes('/')) {
			username = url.replace('@', '');
		}

		console.log('Extracted username:', username);

		if (!username) {
			throw new Error('Invalid Instagram URL');
		}

		// Try Instagram's internal API with retry logic
		const apiUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
		console.log('Trying Instagram API:', apiUrl);

		let apiResponse;
		let lastError;
		const maxRetries = 3;

		// Retry with exponential backoff
		for (let attempt = 0; attempt < maxRetries; attempt++) {
			if (attempt > 0) {
				const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Max 5s
				console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
				await new Promise(resolve => setTimeout(resolve, delay));
			}

			apiResponse = await fetch(apiUrl, {
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
					'X-IG-App-ID': '936619743392459',
					'Accept': '*/*',
					'Accept-Language': 'en-US,en;q=0.9',
					'Sec-Fetch-Dest': 'empty',
					'Sec-Fetch-Mode': 'cors',
					'Sec-Fetch-Site': 'same-origin'
				}
			});

			console.log('API response status:', apiResponse.status);

			if (apiResponse.ok) {
				break; // Success, exit retry loop
			}

			if (apiResponse.status === 401) {
				lastError = new Error('Instagram API returned 401 (Unauthorized)');
				continue; // Retry on 401
			}

			// For other errors, don't retry
			break;
		}

		if (apiResponse && apiResponse.ok) {
			const data = await apiResponse.json();
			console.log('API response keys:', Object.keys(data));

			if (data.data?.user) {
				const user = data.data.user;
				console.log('Successfully got user data from API!');

				const userData = {
					username: user.username,
					displayName: user.full_name || username,
					bio: user.biography || ''
				};

				// Get images from Instagram
				const posts = user.edge_owner_to_timeline_media?.edges || [];
				const instagramImageUrls = posts.slice(0, 6).map((post: any) =>
					post.node?.display_url || post.node?.thumbnail_src
				).filter(Boolean);

				console.log('Extracted images:', instagramImageUrls.length);

				// Upload images to MinIO
				console.log('Uploading images to MinIO...');
				const uploadPromises = instagramImageUrls.map(url =>
					uploadInstagramImageToMinio(url, 'instagram')
				);
				const minioUrls = await Promise.all(uploadPromises);
				const images = minioUrls.filter(Boolean) as string[];

				console.log('Uploaded to MinIO:', images.length);

				return json({
					platform: 'instagram',
					username: userData.username,
					displayName: userData.displayName,
					bio: userData.bio,
					images: images
				});
			}
		}

		// Fallback: return basic data (API failed after retries or returned no user data)
		if (lastError) {
			console.log('API failed after retries:', lastError.message);
		} else {
			console.log('API returned no user data, returning basic data');
		}
		return json({
			platform: 'instagram',
			username: username,
			displayName: username,
			bio: '',
			images: []
		});

	} catch (e: any) {
		console.error('Instagram fetch error:', e);
		const username = url.match(/instagram\.com\/([^/?]+)/)?.[1] || '';
		return json({
			platform: 'instagram',
			username: username.replace('@', ''),
			displayName: username,
			bio: '',
			images: []
		});
	}
}

async function fetchTikTokData(url: string) {
	// TikTok requires their API or headless browser to get videos
	// For now, fallback to Open Graph to get at least the profile image
	console.log('TikTok detected - using Open Graph fallback');
	return await fetchOpenGraphData(url);
}

async function fetchTwitterData(url: string) {
	// Twitter/X: Just extract username from URL, no fetch needed
	// Nitter instances are unreliable, Twitter API is $100/mois
	// For now, keep it simple: just show @username
	console.log('Twitter/X detected - using basic mode (username only)');

	const username = url.match(/(?:x\.com|twitter\.com)\/([^/?]+)/)?.[1] || '';

	return json({
		platform: 'twitter',
		username,
		displayName: `@${username}`, // Use @username as display name
		description: '',
		image: null,
		images: []
	});
}
