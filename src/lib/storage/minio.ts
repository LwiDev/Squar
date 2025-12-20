import { Client } from 'minio';
import {
	MINIO_ENDPOINT,
	MINIO_ACCESS_KEY,
	MINIO_SECRET_KEY,
	MINIO_BUCKET
} from '$env/static/private';

if (!MINIO_ENDPOINT || !MINIO_ACCESS_KEY || !MINIO_SECRET_KEY || !MINIO_BUCKET) {
	throw new Error('MinIO environment variables are not properly configured');
}

// Extraire l'URL sans le protocole
const endpointUrl = new URL(MINIO_ENDPOINT);

export const minioClient = new Client({
	endPoint: endpointUrl.hostname,
	port: endpointUrl.port ? parseInt(endpointUrl.port) : 9000,
	useSSL: endpointUrl.protocol === 'https:',
	accessKey: MINIO_ACCESS_KEY,
	secretKey: MINIO_SECRET_KEY
});

export const BUCKET_NAME = MINIO_BUCKET;

// Fonction utilitaire pour s'assurer que le bucket existe
export async function ensureBucketExists() {
	const exists = await minioClient.bucketExists(BUCKET_NAME);
	if (!exists) {
		await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
		console.log(`Bucket ${BUCKET_NAME} created`);
	}
}
