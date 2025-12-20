import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient();

export const signIn = authClient.signIn.email;
export const signUp = authClient.signUp.email;
export const signOut = authClient.signOut;
