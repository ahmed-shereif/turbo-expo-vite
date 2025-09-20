import { createMobileAuthClient } from '@repo/auth-client/mobile';
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;

if (!apiUrl || typeof apiUrl !== 'string') {
  throw new Error(
    'EXPO_PUBLIC_API_URL is not set in your app.config.ts. Please set it to your local backend API URL.',
  );
}

export const auth = createMobileAuthClient(apiUrl);

export { AuthClientError } from '@repo/auth-client';
