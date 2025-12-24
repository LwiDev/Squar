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
		console.log('[MinIO] Profile photo received, size:', buffer.length);

		// Optimize image with Sharp
		const optimizedBuffer = await sharp(buffer)
			.resize(512, 512, {
				fit: 'cover',
				position: 'center'
			})
			.jpeg({ quality: 85, mozjpeg: true })
			.toBuffer();

		console.log('[MinIO] Profile photo optimized, size:', optimizedBuffer.length);

		// Generate unique filename
		const filename = `${locals.user.id}/profile-${nanoid()}.jpg`;

		// Upload to MinIO
		console.log('[MinIO] Uploading profile photo to bucket:', MINIO_BUCKET, 'filename:', filename);
		await minioClient.putObject(
			MINIO_BUCKET,
			filename,
			optimizedBuffer,
			optimizedBuffer.length,
			{ 'Content-Type': 'image/jpeg' }
		);

		console.log('[MinIO] Profile photo uploaded successfully');

		// Delete old profile photo if exists
		if (oldFilename) {
			try {
				console.log('[MinIO] Deleting old profile photo:', oldFilename);
				await minioClient.removeObject(MINIO_BUCKET, oldFilename);
			} catch (err) {
				console.error('[MinIO] Failed to delete old profile photo:', err);
				// Don't fail the upload if deletion fails
			}
		}

		// Generate presigned URL (7 days expiry)
		const presignedUrl = await minioClient.presignedGetObject(
			MINIO_BUCKET,
			filename,
			7 * 24 * 60 * 60
		);

		console.log('[MinIO] Generated presigned URL for profile photo');

		// Add cache busting timestamp to presigned URL
		const urlWithTimestamp = presignedUrl + `&t=${Date.now()}`;

		return json({
			url: urlWithTimestamp,
			filename
		});
	} catch (e) {
		console.error('[MinIO] Profile photo upload error:', e);
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
