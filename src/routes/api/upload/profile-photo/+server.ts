import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { minioClient } from '$lib/storage/minio';
import { MINIO_BUCKET } from '$env/static/private';
import { nanoid } from 'nanoid';
import sharp from 'sharp';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const formData = await request.formData();
	const file = formData.get('file') as File;
	const oldFilename = formData.get('oldFilename') as string | null;

	if (!file) {
		throw error(400, 'No file provided');
	}

	// Validate file type
	if (!file.type.startsWith('image/')) {
		throw error(400, 'File must be an image');
	}

	// Validate file size (max 10MB before optimization)
	if (file.size > 10 * 1024 * 1024) {
		throw error(400, 'File size must be less than 10MB');
	}

	try {
		// Convert file to buffer
		const buffer = Buffer.from(await file.arrayBuffer());

		// Optimize image with Sharp
		const optimizedBuffer = await sharp(buffer)
			.resize(512, 512, {
				fit: 'cover',
				position: 'center'
			})
			.jpeg({ quality: 85, mozjpeg: true })
			.toBuffer();

		// Generate unique filename
		const filename = `${locals.user.id}/profile-${nanoid()}.jpg`;

		// Upload to MinIO
		await minioClient.putObject(
			MINIO_BUCKET,
			filename,
			optimizedBuffer,
			optimizedBuffer.length,
			{ 'Content-Type': 'image/jpeg' }
		);

		// Delete old profile photo if exists
		if (oldFilename) {
			try {
				await minioClient.removeObject(MINIO_BUCKET, oldFilename);
			} catch (err) {
				console.error('Failed to delete old profile photo:', err);
				// Don't fail the upload if deletion fails
			}
		}

		// Generate permanent URL (1 year expiry)
		const url = await minioClient.presignedGetObject(
			MINIO_BUCKET,
			filename,
			365 * 24 * 60 * 60
		);

		return json({
			url: url.split('?')[0] + `?t=${Date.now()}`,
			filename
		});
	} catch (e) {
		console.error('Profile photo upload error:', e);
		throw error(500, 'Failed to upload profile photo');
	}
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const { filename } = await request.json();

	if (!filename) {
		throw error(400, 'No filename provided');
	}

	// Verify filename belongs to user (security check)
	if (!filename.startsWith(`${locals.user.id}/profile-`)) {
		throw error(403, 'Unauthorized to delete this file');
	}

	try {
		await minioClient.removeObject(MINIO_BUCKET, filename);
		return json({ success: true });
	} catch (e) {
		console.error('Delete error:', e);
		throw error(500, 'Failed to delete profile photo');
	}
};
