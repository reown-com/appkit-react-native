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

export interface SafeStorageItems {
  'WALLETCONNECT_DEEPLINK_CHOICE': string; //dont change this one
  '@appkit/recent_wallet': string;
  '@appkit/connected_connectors': string;
  '@appkit/onramp_preferred_country': string;
  '@appkit/onramp_countries': string;
  '@appkit/onramp_service_providers': string;
  '@appkit/onramp_fiat_limits': string;
  '@appkit/onramp_fiat_currencies': string;
  '@appkit/onramp_preferred_fiat_currency': string;
  '@appkit/onramp_countries_defaults': string;
  '@appkit/active_namespace': string;
  '@appkit/coinbase_connector/session': string;
  '@appkit/siwx-auth-token': string;
  '@appkit/siwx-nonce-token': string;
}

export const SafeStorageKeys = {
  WC_DEEPLINK: 'WALLETCONNECT_DEEPLINK_CHOICE', //dont change this one
  RECENT_WALLET: '@appkit/recent_wallet',
  CONNECTED_CONNECTORS: '@appkit/connected_connectors',
  ONRAMP_PREFERRED_COUNTRY: '@appkit/onramp_preferred_country',
  ONRAMP_COUNTRIES: '@appkit/onramp_countries',
  ONRAMP_SERVICE_PROVIDERS: '@appkit/onramp_service_providers',
  ONRAMP_FIAT_LIMITS: '@appkit/onramp_fiat_limits',
  ONRAMP_FIAT_CURRENCIES: '@appkit/onramp_fiat_currencies',
  ONRAMP_PREFERRED_FIAT_CURRENCY: '@appkit/onramp_preferred_fiat_currency',
  ONRAMP_COUNTRIES_DEFAULTS: '@appkit/onramp_countries_defaults',
  ACTIVE_NAMESPACE: '@appkit/active_namespace',
  COINBASE_CONNECTOR_SESSION: '@appkit/coinbase_connector/session',
  SIWX_AUTH_TOKEN: '@appkit/siwx-auth-token',
  SIWX_NONCE_TOKEN: '@appkit/siwx-nonce-token'
} as const;
