import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppKitFrameConstants } from './AppKitFrameConstants';

export const AppKitFrameStorage = {
  set(key: string, value: string) {
    AsyncStorage.setItem(`${AppKitFrameConstants.STORAGE_KEY}${key}`, JSON.stringify(value));
  },

  async get(key: string) {
    const item = await AsyncStorage.getItem(`${AppKitFrameConstants.STORAGE_KEY}${key}`);

    return item ? JSON.parse(item) : undefined;
  },

  delete(key: string) {
    AsyncStorage.removeItem(`${AppKitFrameConstants.STORAGE_KEY}${key}`);
  }
};
