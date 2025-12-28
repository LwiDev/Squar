import * as simpleIcons from 'simple-icons';

// Custom icons for platforms not in simple-icons
const customIcons: Record<string, { svg: string; hex: string }> = {
	linkedin: {
		svg: '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>',
		hex: '0A66C2'
	}
};

// Map common domain patterns to simple-icons slugs
const domainToIconMap: Record<string, string> = {
	'instagram.com': 'instagram',
	'twitter.com': 'x',
	'x.com': 'x',
	'facebook.com': 'facebook',
	'linkedin.com': 'linkedin',
	'github.com': 'github',
	'youtube.com': 'youtube',
	'tiktok.com': 'tiktok',
	'twitch.tv': 'twitch',
	'discord.com': 'discord',
	'discord.gg': 'discord',
	'reddit.com': 'reddit',
	'pinterest.com': 'pinterest',
	'snapchat.com': 'snapchat',
	'spotify.com': 'spotify',
	'apple.com': 'apple',
	'google.com': 'google',
	'gmail.com': 'gmail',
	'behance.net': 'behance',
	'dribbble.com': 'dribbble',
	'figma.com': 'figma',
	'notion.so': 'notion',
	'medium.com': 'medium',
	'substack.com': 'substack',
	'patreon.com': 'patreon',
	'ko-fi.com': 'kofi',
	'buymeacoffee.com': 'buymeacoffee'
};

// Map domain to display name
const domainToNameMap: Record<string, string> = {
	'instagram.com': 'Instagram',
	'twitter.com': 'X',
	'x.com': 'X',
	'facebook.com': 'Facebook',
	'linkedin.com': 'LinkedIn',
	'github.com': 'GitHub',
	'youtube.com': 'YouTube',
	'tiktok.com': 'TikTok',
	'twitch.tv': 'Twitch',
	'discord.com': 'Discord',
	'discord.gg': 'Discord',
	'reddit.com': 'Reddit',
	'pinterest.com': 'Pinterest',
	'snapchat.com': 'Snapchat',
	'spotify.com': 'Spotify',
	'apple.com': 'Apple',
	'google.com': 'Google',
	'gmail.com': 'Gmail',
	'behance.net': 'Behance',
	'dribbble.com': 'Dribbble',
	'figma.com': 'Figma',
	'notion.so': 'Notion',
	'medium.com': 'Medium',
	'substack.com': 'Substack',
	'patreon.com': 'Patreon',
	'ko-fi.com': 'Ko-fi',
	'buymeacoffee.com': 'Buy Me a Coffee'
};

export interface LinkInfo {
	url: string;
	title: string;
	iconSvg?: string;
	iconHex?: string;
}

export function detectLinkInfo(url: string): LinkInfo {
	try {
		const urlObj = new URL(url);
		const hostname = urlObj.hostname.replace('www.', '');

		// Check if we have a mapping for this domain
		const iconSlug = domainToIconMap[hostname];
		const displayName = domainToNameMap[hostname];

		if (iconSlug && displayName) {
			// Check custom icons first
			const customIcon = customIcons[iconSlug];
			if (customIcon) {
				return {
					url,
					title: displayName,
					iconSvg: customIcon.svg,
					iconHex: customIcon.hex
				};
			}

			// Try simple-icons
			// @ts-ignore - simple-icons typing is weird
			const icon = simpleIcons[`si${iconSlug.charAt(0).toUpperCase()}${iconSlug.slice(1)}`];

			if (icon) {
				return {
					url,
					title: displayName,
					iconSvg: icon.svg,
					iconHex: icon.hex
				};
			}
		}

		// Fallback: use domain as title
		const domain = hostname.split('.')[0];
		const fallbackTitle = domain.charAt(0).toUpperCase() + domain.slice(1);

		return {
			url,
			title: fallbackTitle
		};
	} catch (e) {
		// Invalid URL, return as-is
		return {
			url,
			title: 'Link'
		};
	}
}
