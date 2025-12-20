import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { url } = await request.json();

	if (!url) {
		throw error(400, 'URL is required');
	}

	try {
		// Detect platform
		const urlObj = new URL(url);
		const hostname = urlObj.hostname.replace('www.', '');

		if (hostname === 'instagram.com') {
			return await fetchInstagramData(url);
		} else if (hostname === 'tiktok.com' || hostname === 'vm.tiktok.com') {
			return await fetchTikTokData(url);
		} else {
			throw error(400, 'Unsupported platform');
		}
	} catch (e: any) {
		console.error('Failed to fetch social data:', e);
		throw error(500, e.message || 'Failed to fetch social data');
	}
};

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

		// Try Instagram's internal API
		const apiUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
		console.log('Trying Instagram API:', apiUrl);

		const apiResponse = await fetch(apiUrl, {
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

				// Get images
				const posts = user.edge_owner_to_timeline_media?.edges || [];
				const images = posts.slice(0, 6).map((post: any) =>
					post.node?.display_url || post.node?.thumbnail_src
				).filter(Boolean);

				console.log('Extracted images:', images.length);

				return json({
					platform: 'instagram',
					username: userData.username,
					displayName: userData.displayName,
					bio: userData.bio,
					images: images
				});
			}
		}

		// Fallback: return basic data
		console.log('API failed, returning basic data');
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
	try {
		const response = await fetch(url, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
			}
		});

		if (!response.ok) {
			throw new Error('Failed to fetch TikTok page');
		}

		const html = await response.text();

		// Extract username from URL
		const username = url.match(/tiktok\.com\/@([^/]+)/)?.[1] || '';

		return json({
			platform: 'tiktok',
			username: username.replace('@', ''),
			displayName: username,
			bio: '',
			images: []
		});
	} catch (e: any) {
		console.error('TikTok fetch error:', e);
		throw new Error('Failed to fetch TikTok data');
	}
}
