import { createWebAuthClient } from '@repo/auth-client/web';
import { API_URL } from './env';

export const auth = createWebAuthClient(API_URL);

export { AuthClientError } from '@repo/auth-client';
