export interface VideoInfo {
	platform: 'youtube' | 'vimeo' | 'loom' | 'unknown';
	videoId: string;
	embedUrl: string;
}

export function parseVideoUrl(url: string): VideoInfo | null {
	try {
		const urlObj = new URL(url);

		// YouTube
		if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
			let videoId = '';
			if (urlObj.hostname.includes('youtu.be')) {
				videoId = urlObj.pathname.slice(1);
			} else {
				videoId = urlObj.searchParams.get('v') || '';
			}
			if (videoId) {
				return {
					platform: 'youtube',
					videoId,
					embedUrl: `https://www.youtube.com/embed/${videoId}`
				};
			}
		}

		// Vimeo
		if (urlObj.hostname.includes('vimeo.com')) {
			const videoId = urlObj.pathname.split('/').filter(Boolean).pop() || '';
			if (videoId) {
				return {
					platform: 'vimeo',
					videoId,
					embedUrl: `https://player.vimeo.com/video/${videoId}`
				};
			}
		}

		// Loom
		if (urlObj.hostname.includes('loom.com')) {
			const pathParts = urlObj.pathname.split('/');
			const videoId = pathParts[pathParts.length - 1] || '';
			if (videoId) {
				return {
					platform: 'loom',
					videoId,
					embedUrl: `https://www.loom.com/embed/${videoId}`
				};
			}
		}
	} catch (e) {
		return null;
	}

	return null;
}
