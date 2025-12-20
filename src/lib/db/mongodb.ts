import { MongoClient, type Db } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let envVars: { MONGO_URI: string; DB_NAME?: string } | null = null;

/**
 * Initialize database configuration
 * Must be called before using getDatabase()
 */
export function initializeDb(config: { MONGO_URI: string; DB_NAME?: string }) {
	envVars = {
		MONGO_URI: config.MONGO_URI,
		DB_NAME: config.DB_NAME || 'squarme'
	};
}

/**
 * Get database instance (synchronous, lazy connection)
 * MongoDB will auto-connect on first operation
 */
export function getDatabase(): Db {
	if (!envVars) {
		// Return a mock during build/prerender
		return {} as Db;
	}

	if (!cachedClient) {
		cachedClient = new MongoClient(envVars.MONGO_URI, {
			maxPoolSize: 10,
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45000
		});
	}

	if (!cachedDb) {
		cachedDb = cachedClient.db(envVars.DB_NAME);
	}

	return cachedDb;
}

/**
 * Close database connection
 */
export async function closeConnection(): Promise<void> {
	if (cachedClient) {
		await cachedClient.close();
		cachedClient = null;
		cachedDb = null;
	}
}
