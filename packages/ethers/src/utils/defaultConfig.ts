import type { Metadata, Provider, ProviderType } from '@web3modal/scaffold-utils-react-native';

export interface ConfigOptions {
  metadata: Metadata;
  coinbase?: Provider;
  enableEmail?: boolean;
}

export function defaultConfig(options: ConfigOptions) {
  const { metadata, enableEmail } = options;

  let providers: ProviderType = { metadata };

  if (options.coinbase) {
    providers.coinbase = options.coinbase;
  }

  if (enableEmail) {
    providers.email = true;
  }

  return providers;
}
