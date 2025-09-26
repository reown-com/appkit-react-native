import type { MMKV } from 'react-native-mmkv';
import type { Namespaces } from '@reown/appkit-common-react-native';
import type {
  KVStorage,
  WalletMobileSDKProviderOptions
} from '@coinbase/wallet-mobile-sdk/build/WalletMobileSDKEVMProvider';
import type { COINBASE_METHODS } from './utils';

export type CoinbaseProviderConfig = Omit<WalletMobileSDKProviderOptions, 'chainId' | 'address'> & {
  redirect: string;
};

export type Values<T> = T[keyof T];

export type CoinbaseMethod = Values<typeof COINBASE_METHODS>;

export type CoinbaseSession = {
  namespaces: Namespaces;
};

export type CoinbaseConnectorConfig = {
  storage?: KVStorage | MMKV;
  jsonRpcUrl?: string;
};
