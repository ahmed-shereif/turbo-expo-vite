import { AuthClient } from './index';
import { webStorage } from './storage/webStorage';

export * from './index';

export const createWebAuthClient = (baseUrl: string) =>
  new AuthClient({ baseUrl, storage: webStorage });
