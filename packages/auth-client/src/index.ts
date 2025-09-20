export type Role =
  | 'PLAYER'
  | 'TRAINER'
  | 'COURT_OWNER'
  | 'ADMIN'
  | 'SUPER_USER'
  | 'SUPPORT';
export type User = {
  id: string;
  email: string;
  name: string;
  rank?: 'UNKNOWN' | 'LOW_D' | 'MID_D' | 'HIGH_D';
  roles?: Role[];
};
export type Tokens = {
  accessToken: string;
  refreshToken: string;
  expiresInSec: number;
};

export interface Storage {
  get(key: string): Promise<string | null> | string | null;
  set(key: string, val: string): Promise<void> | void;
  remove(key: string): Promise<void> | void;
}

const REFRESH_TOKEN_KEY = 'sp.refreshToken';

type AuthClientConfig = {
  baseUrl: string;
  storage: Storage;
  getNow?: () => number;
};

export class AuthClientError extends Error {
  fieldErrors?: Record<string, string>;
  status: number;

  constructor(
    message: string,
    status: number,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'AuthClientError';
    this.fieldErrors = fieldErrors;
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    const body = await res.json().catch(() => ({}));
    if (
      body &&
      typeof body === 'object' &&
      'success' in body &&
      (body as any).success === true &&
      'data' in body
    ) {
      return (body as any).data as T;
    }
    return body as T;
  }

  const body = await res.json().catch(() => ({}));

  if (
    res.status === 401 &&
    (body?.message === 'Unauthorized' || body?.error?.message === 'Unauthorized')
  ) {
    throw new AuthClientError(
      'Unauthorized',
      res.status,
      body?.error?.details?.fieldErrors,
    );
  }

  const message = body?.error?.message || 'Unexpected error. Please try again.';
  const fieldErrors = body?.error?.details?.fieldErrors;
  throw new AuthClientError(message, res.status, fieldErrors);
}


export class AuthClient {
  private accessToken?: string;
  private accessExpMs?: number;
  private baseUrl: string;
  private storage: Storage;
  private getNow: () => number;
  private authExpiredListeners: Array<() => void> = [];

  constructor({ baseUrl, storage, getNow = Date.now }: AuthClientConfig) {
    this.baseUrl = baseUrl;
    this.storage = storage;
    this.getNow = getNow;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  onAuthExpired(listener: () => void): () => void {
    this.authExpiredListeners.push(listener);
    return () => {
      this.authExpiredListeners = this.authExpiredListeners.filter((l) => l !== listener);
    };
  }

  private emitAuthExpired(): void {
    for (const listener of this.authExpiredListeners) {
      try {
        listener();
      } catch (_) {
        // ignore listener errors
      }
    }
  }

  private setAccess(accessToken: string, expiresInSec: number): void {
    this.accessToken = accessToken;
    this.accessExpMs = this.getNow() + expiresInSec * 1000;
  }

  private async setRefresh(refreshToken: string): Promise<void> {
    if (!refreshToken || refreshToken === 'undefined' || refreshToken === 'null') {
      // Do not persist invalid tokens; surface a clear error to the caller
      throw new AuthClientError('Invalid refresh token from server', 500);
    }
    await this.storage.set(REFRESH_TOKEN_KEY, refreshToken);
  }

  private async getRefresh(): Promise<string | null> {
    const value = this.storage.get(REFRESH_TOKEN_KEY);
    if (!value || value === 'undefined' || value === 'null' || value === '') return null;
    return value;
  }

  async clear(): Promise<void> {
    this.accessToken = undefined;
    this.accessExpMs = undefined;
    await this.storage.remove(REFRESH_TOKEN_KEY);
  }

  async signup(data: {
    name?: string;
    email?: string;
    phone?: string;
    password: string;
    role: Role;
  }): Promise<void> {
    const res = await fetch(`${this.baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = body?.error?.message || 'Unexpected error. Please try again.';
      // Support both fieldErrors object and errors array formats, and single-field detail
      const detailsErrors = body?.error?.details?.errors as
        | Array<{ field: string; message: string }>
        | undefined;
      const fieldErrorsFromArray = detailsErrors?.reduce((acc: Record<string, string>, err) => {
        if (err?.field && err?.message) acc[err.field] = err.message;
        return acc;
      }, {});
      const singleField = body?.error?.details?.field as string | undefined;
      const singleFieldMsg = body?.error?.details?.message as string | undefined;
      const fieldErrorsSingle = singleField && singleFieldMsg ? { [singleField]: singleFieldMsg } : undefined;
      const fieldErrors =
        body?.error?.details?.fieldErrors || fieldErrorsFromArray || fieldErrorsSingle;
      throw new AuthClientError(message, res.status, fieldErrors);
    }
  }

  async login(data: { email?: string; phone?: string; password: string }): Promise<void> {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const tokens = await handleResponse<Tokens & Partial<{ user: any }>>(res);
    if (!tokens?.refreshToken || !tokens?.accessToken || tokens.expiresInSec == null) {
      throw new AuthClientError('Invalid server response: missing tokens', 500);
    }
    this.setAccess(tokens.accessToken, tokens.expiresInSec);
    await this.setRefresh(tokens.refreshToken);
  }

  async refresh(): Promise<void> {
    const refreshToken = await this.getRefresh();
    if (!refreshToken) {
      await this.clear();
      this.emitAuthExpired();
      throw new AuthClientError('No refresh token', 401);
    }

    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const tokens = await handleResponse<Tokens>(res);
      if (!tokens?.refreshToken || !tokens?.accessToken || tokens.expiresInSec == null) {
        throw new AuthClientError('Invalid server response: missing tokens', 500);
      }
      this.setAccess(tokens.accessToken, tokens.expiresInSec);
      await this.setRefresh(tokens.refreshToken);
    } catch (e) {
      await this.clear();
      this.emitAuthExpired();
      throw e;
    }
  }

  async me(): Promise<User> {
    return this.withAuth(async (headers) => {
      const res = await fetch(`${this.baseUrl}/auth/me`, { headers });
      return handleResponse<User>(res);
    });
  }

  async logout(): Promise<void> {
    // Backend expects Authorization header (JwtAuthGuard) and no body
    try {
      await this.withAuth(async (headers) => {
        await fetch(`${this.baseUrl}/auth/logout`, {
          method: 'POST',
          headers: { ...headers },
        });
        return undefined as any;
      });
    } catch (_) {
      // Ignore network/auth errors on logout
    } finally {
      await this.clear();
    }
  }

  getAuthHeader(): Record<string, string> {
    if (!this.accessToken || (this.accessExpMs && this.getNow() > this.accessExpMs)) {
      return {};
    }
    return { Authorization: `Bearer ${this.accessToken}` };
  }

  async withAuth<T>(
    fn: (headers: Record<string, string>) => Promise<T>,
  ): Promise<T> {
    try {
      const headers = this.getAuthHeader();
      return await fn(headers);
    } catch (error) {
       if (error instanceof AuthClientError && error.status === 401) {
        try {
          await this.refresh();
          const headers = this.getAuthHeader();
          return await fn(headers); // retry
        } catch (refreshError) {
          await this.clear(); // force logout on refresh failure
          this.emitAuthExpired();
          throw refreshError; // re-throw refresh error
        }
      }
      throw error; // re-throw other errors
    }
  }
}
