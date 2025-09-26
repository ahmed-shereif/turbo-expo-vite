const fromEnv = (import.meta as any)?.env?.VITE_API_URL as string | undefined;
// Use relative path in dev (proxy will handle it), fallback to direct port
export const API_URL = fromEnv ?? (import.meta.env?.DEV ? '' : 'http://localhost:3002');
