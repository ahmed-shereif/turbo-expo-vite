import * as SecureStore from 'expo-secure-store';
import { Storage } from '../index';

class ExpoSecureStorage implements Storage {
  async get(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  }
  async set(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  }
  async remove(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  }
}

export const expoSecureStorage = new ExpoSecureStorage();
