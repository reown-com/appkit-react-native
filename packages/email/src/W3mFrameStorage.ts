import AsyncStorage from '@react-native-async-storage/async-storage';
import { W3mFrameConstants } from './W3mFrameConstants';

export const W3mFrameStorage = {
  set(key: string, value: string) {
    console.log('setItem', `${W3mFrameConstants.STORAGE_KEY}${key}`, value);
    AsyncStorage.setItem(`${W3mFrameConstants.STORAGE_KEY}${key}`, JSON.stringify(value));
  },

  async get(key: string) {
    console.log('getItem', `${W3mFrameConstants.STORAGE_KEY}${key}`);
    const item = await AsyncStorage.getItem(`${W3mFrameConstants.STORAGE_KEY}${key}`);

    return item ? JSON.parse(item) : undefined;
  },

  delete(key: string) {
    console.log('removeItem', `${W3mFrameConstants.STORAGE_KEY}${key}`);
    AsyncStorage.removeItem(`${W3mFrameConstants.STORAGE_KEY}${key}`);
  }
};
