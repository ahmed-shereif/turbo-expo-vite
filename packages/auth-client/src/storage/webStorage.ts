import type { Storage } from '../index';

class WebStorage implements Storage {
  get(key: string): string | null {
    return window.localStorage.getItem(key);
  }
  set(key: string, value: string): void {
    window.localStorage.setItem(key, value);
  }
  remove(key: string): void {
    window.localStorage.removeItem(key);
  }
}

export const webStorage = new WebStorage();
