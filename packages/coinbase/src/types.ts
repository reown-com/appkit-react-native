import type { Namespaces } from '@reown/appkit-common-react-native';
import type {
  KVStorage,
  WalletMobileSDKProviderOptions
} from '@coinbase/wallet-mobile-sdk/build/WalletMobileSDKEVMProvider';
import type { COINBASE_METHODS } from './utils';

export type CoinbaseProviderConfig = Omit<WalletMobileSDKProviderOptions, 'chainId' | 'address'> & {
  defaultChain?: number;
  redirect: string;
};

export type Values<T> = T[keyof T];

export type CoinbaseMethod = Values<typeof COINBASE_METHODS>;

export type CoinbaseSession = {
  namespaces: Namespaces;
};

export type CoinbaseConnectorConfig = {
  storage?: KVStorage;
  jsonRpcUrl?: string;
};
