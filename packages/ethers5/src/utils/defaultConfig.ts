import type { Metadata, Provider, ProviderType } from '@web3modal/scaffold-utils-react-native';

export interface ConfigOptions {
  rpcUrl?: string;
  defaultChainId?: number;
  metadata: Metadata;
  coinbase?: Provider;
}

export function defaultConfig(options: ConfigOptions) {
  const { metadata } = options;

  let providers: ProviderType = { metadata };

  if (options.coinbase) {
    providers.coinbase = options.coinbase;
  }

  return providers;
}
