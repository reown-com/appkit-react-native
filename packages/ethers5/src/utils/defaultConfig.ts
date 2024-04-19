import type {
  Metadata,
  Provider,
  ProviderType,
  W3mFrameProvider
} from '@web3modal/scaffold-utils-react-native';

export interface ConfigOptions {
  metadata: Metadata;
  extraConnectors: (Provider | W3mFrameProvider)[];
}

export function defaultConfig(options: ConfigOptions) {
  const { metadata, extraConnectors } = options;

  let providers: ProviderType = { metadata, extraConnectors };

  return providers;
}
