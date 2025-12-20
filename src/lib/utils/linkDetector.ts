import * as simpleIcons from 'simple-icons';

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
