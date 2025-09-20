import { AuthClient } from './index';
import { expoSecureStorage } from './storage/expoSecureStorage';

export * from './index';

export const createMobileAuthClient = (baseUrl: string) =>
  new AuthClient({ baseUrl, storage: expoSecureStorage });
