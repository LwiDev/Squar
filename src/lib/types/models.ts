import type { ObjectId } from 'mongodb';

export type BlockType = 'text' | 'link' | 'image' | 'embed' | 'divider';

export interface Block {
	id: string;
	type: BlockType;
	x: number;
	y: number;
	w: number;
	h: number;
	data: Record<string, any>;
}

export interface PageSettings {
	title: string;
	description?: string;
	theme: {
		background: string;
		text: string;
		accent: string;
	};
	seo?: {
		metaTitle?: string;
		metaDescription?: string;
		ogImage?: string;
	};
}

export interface Page {
	_id?: ObjectId;
	id: string;
	userId: string;
	slug: string;
	settings: PageSettings;
	layout: Block[];
	published: boolean;
	updatedAt: Date;
	createdAt: Date;
}

export interface User {
	_id?: ObjectId;
	id: string;
	email: string;
	createdAt: Date;
}
