import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthClient, Storage, AuthClientError } from './src';

// Mock Storage
class MockStorage implements Storage {
  private store = new Map<string, string>();
  get(key: string) {
    return this.store.get(key) || null;
  }
  set(key: string, val: string) {
    this.store.set(key, val);
  }
  remove(key: string) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

const mockUser = { id: '1', email: 'test@test.com', name: 'Test User', roles: ['PLAYER'] };
const mockTokens = {
  v1: { accessToken: 'access-1', refreshToken: 'refresh-1', expiresInSec: 3600 },
  v2: { accessToken: 'access-2', refreshToken: 'refresh-2', expiresInSec: 3600 },
};

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AuthClient', () => {
  let storage: MockStorage;
  let authClient: AuthClient;
  let now = Date.now();
  const getNow = () => now;

  beforeEach(() => {
    now = Date.now();
    storage = new MockStorage();
    authClient = new AuthClient({
      baseUrl: 'http://api.test',
      storage,
      getNow,
    });
    mockFetch.mockReset();
  });

  it('should login, get user, refresh, and logout', async () => {
    // 1. Login
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockTokens.v1), { status: 200 }));
    await authClient.login({ email: 'test@test.com', password: 'password' });

    let authHeader = authClient.getAuthHeader();
    expect(authHeader).toEqual({ Authorization: 'Bearer access-1' });
    expect(await storage.get('sp.refreshToken')).toBe('refresh-1');

    // 2. Get me
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockUser), { status: 200 }));
    const user = await authClient.me();
    expect(user).toEqual(mockUser);
    expect(mockFetch).toHaveBeenCalledWith('http://api.test/auth/me', {
      headers: { Authorization: 'Bearer access-1' },
    });

    // 3. Simulate token expiry and refresh
    now += 3600 * 1000 + 100; // Expire the token
    expect(authClient.getAuthHeader()).toEqual({}); // Expired

    mockFetch
      .mockResolvedValueOnce(new Response('Unauthorized', { status: 401 })) // Original request fails
      .mockResolvedValueOnce(new Response(JSON.stringify(mockTokens.v2), { status: 200 })) // Refresh succeeds
      .mockResolvedValueOnce(new Response(JSON.stringify(mockUser), { status: 200 })); // Retry succeeds

    const userAfterRefresh = await authClient.me();
    expect(userAfterRefresh).toEqual(mockUser);

    expect(mockFetch).toHaveBeenCalledWith('http://api.test/auth/refresh', expect.anything());
    authHeader = authClient.getAuthHeader();
    expect(authHeader).toEqual({ Authorization: 'Bearer access-2' });
    expect(await storage.get('sp.refreshToken')).toBe('refresh-2');

    // 4. Logout
    mockFetch.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await authClient.logout();
    expect(authClient.getAuthHeader()).toEqual({});
    expect(await storage.get('sp.refreshToken')).toBe(null);
  });
  
  it('should clear tokens on refresh failure', async () => {
    await storage.set('sp.refreshToken', 'refresh-1');
    mockFetch.mockResolvedValueOnce(new Response('Invalid refresh token', { status: 401 }));

    await expect(authClient.refresh()).rejects.toThrow(AuthClientError);
    
    expect(authClient.getAuthHeader()).toEqual({});
    expect(await storage.get('sp.refreshToken')).toBe(null);
  });
});
