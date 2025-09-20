const fromEnv = (import.meta as any)?.env?.VITE_API_URL as string | undefined;
// Default to backend port 3002 in dev if not provided
export const API_URL = fromEnv ?? 'http://localhost:3002';
