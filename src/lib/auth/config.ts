import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { BETTER_AUTH_SECRET, BETTER_AUTH_URL } from '$env/static/private';
import { getDatabase } from '$lib/db/mongodb';

let authInstance: ReturnType<typeof betterAuth> | null = null;

function getAuth() {
	if (!authInstance) {
		const db = getDatabase();
		authInstance = betterAuth({
			database: mongodbAdapter(db),
			secret: BETTER_AUTH_SECRET,
			baseURL: BETTER_AUTH_URL,
			emailAndPassword: {
				enabled: true
			}
		});
	}
	return authInstance;
}

export const auth = new Proxy({} as ReturnType<typeof betterAuth>, {
	get(_target, prop) {
		return getAuth()[prop as keyof ReturnType<typeof betterAuth>];
	}
});

export type Session = typeof auth.$Infer.Session;
