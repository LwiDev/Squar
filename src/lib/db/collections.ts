import type { Collection } from 'mongodb';
import { getDatabase } from './mongodb';
import type { User, Page } from '$lib/types/models';

export function getUsersCollection(): Collection<User> {
	const db = getDatabase();
	return db.collection<User>('users');
}

export function getPagesCollection(): Collection<Page> {
	const db = getDatabase();
	return db.collection<Page>('pages');
}

// Fonction pour créer les index nécessaires
export async function createIndexes() {
	const users = getUsersCollection();
	const pages = getPagesCollection();

	// Index unique sur l'email des utilisateurs
	await users.createIndex({ email: 1 }, { unique: true });

	// Index sur le userId pour retrouver les pages d'un utilisateur
	await pages.createIndex({ userId: 1 });

	// Index unique sur le slug pour les URLs
	await pages.createIndex({ slug: 1 }, { unique: true });

	console.log('Database indexes created');
}
