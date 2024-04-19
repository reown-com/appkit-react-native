import type {
  Metadata,
  Provider,
  ProviderType,
  W3mFrameProvider
} from '@web3modal/scaffold-utils-react-native';

export interface ConfigOptions {
  metadata: Metadata;
  coinbase?: Provider;
  email?: W3mFrameProvider;
}

export function defaultConfig(options: ConfigOptions) {
  const { metadata } = options;

  let providers: ProviderType = { metadata };

  if (options.coinbase) {
    providers.coinbase = options.coinbase;
  }

  if (options.email) {
    providers.email = options.email;
  }

  return providers;
}
