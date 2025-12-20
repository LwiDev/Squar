import { initializeDb } from '$lib/db/mongodb';
import { createIndexes } from '$lib/db/collections';
import { ensureBucketExists } from '$lib/storage/minio';
import { auth } from '$lib/auth/config';
import { redirect, type Handle } from '@sveltejs/kit';
import { MONGO_URI } from '$env/static/private';

// Initialize database configuration
initializeDb({
	MONGO_URI,
	DB_NAME: 'squarme'
});

let initialized = false;

// Initialisation au démarrage de l'application
async function initialize() {
	if (initialized) return;

	try {
		// Créer les index MongoDB
		await createIndexes();

		// S'assurer que le bucket MinIO existe
		await ensureBucketExists();

		initialized = true;
		console.log('Application initialized successfully');
	} catch (error) {
		console.error('Failed to initialize application:', error);
		throw error;
	}
}

// Appeler l'initialisation
initialize();

// Hook pour gérer l'authentification
export const handle: Handle = async ({ event, resolve }) => {
	// Vérifier la session
	const session = await auth.api.getSession({ headers: event.request.headers });

	// Ajouter la session aux locals
	event.locals.session = session;
	event.locals.user = session?.user;

	// Routes protégées (éditeur)
	const protectedRoutes = ['/editor', '/dashboard'];
	const isProtectedRoute = protectedRoutes.some((route) => event.url.pathname.startsWith(route));

	// Rediriger vers login si non authentifié sur route protégée
	if (isProtectedRoute && !session) {
		throw redirect(303, '/login');
	}

	return resolve(event);
};
