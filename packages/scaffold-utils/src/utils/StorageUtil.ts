import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageUtil as CoreStorageUtil } from '@reown/core-react-native';

export const StorageUtil = {
  async getItem<T>(key: string): Promise<T> {
    const item = await AsyncStorage.getItem(key);

    return item ? JSON.parse(item) : undefined;
  },

  async setItem<T>(key: string, value: T) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
  },

  async getConnectedConnector() {
    return CoreStorageUtil.getConnectedConnector();
  }
};
