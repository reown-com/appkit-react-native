import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageUtils = {
  getItem: async <T>(key: string): Promise<T> => {
    const item = await AsyncStorage.getItem(key);

    return item ? JSON.parse(item) : undefined;
  },
  setItem: async <T>(key: string, value: T) => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key);
  }
};
