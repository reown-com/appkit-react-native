export interface Storage {
  /**
   * Returns all keys in storage.
   */
  getKeys(): Promise<string[]>;

  /**
   * Returns all key-value entries in storage.
   */
  getEntries<T = any>(): Promise<[string, T][]>;

  /**
   * Get an item from storage for a given key.
   * @param key The key to retrieve.
   */
  getItem<T = any>(key: string): Promise<T | undefined>;

  /**
   * Set an item in storage for a given key.
   * @param key The key to set.
   * @param value The value to set.
   */
  setItem<T = any>(key: string, value: T): Promise<void>;

  /**
   * Remove an item from storage for a given key.
   * @param key The key to remove.
   */
  removeItem(key: string): Promise<void>;
}
