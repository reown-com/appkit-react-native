import AsyncStorage from '@react-native-async-storage/async-storage';
import { W3mFrameConstants } from './W3mFrameConstants';

export const W3mFrameStorage = {
  set(key: string, value: string) {
    AsyncStorage.setItem(`${W3mFrameConstants.STORAGE_KEY}${key}`, JSON.stringify(value));
  },

  async get(key: string) {
    const item = await AsyncStorage.getItem(`${W3mFrameConstants.STORAGE_KEY}${key}`);

    return item ? JSON.parse(item) : undefined;
  },

  delete(key: string) {
    AsyncStorage.removeItem(`${W3mFrameConstants.STORAGE_KEY}${key}`);
  }
};
