import { auth } from './authClient';
import type { QueryFunction } from '@tanstack/react-query';

// This is a generic wrapper. You might need to adjust it based on how you fetch data.
// For example, if you use a library like `ky` or `axios`, you'd integrate `withAuth` there.

export const authedFetch =
  <T>(url: string, options?: RequestInit): QueryFunction<T> =>
  async () => {
    const res = await auth.withAuth(async (headers) => {
      const finalOptions = { ...options, headers: { ...options?.headers, ...headers } };
      const response = await fetch(url, finalOptions);
      if (!response.ok) {
        // You might want more sophisticated error handling here
        throw new Error(`Request failed with status ${response.status}`);
      }
      return response;
    });
    return res.json();
  };
