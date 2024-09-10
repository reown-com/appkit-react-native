import type {
  Metadata,
  Provider,
  ProviderType,
  AppKitFrameProvider
} from '@reown/scaffold-utils-react-native';

export interface ConfigOptions {
  metadata: Metadata;
  extraConnectors?: (Provider | AppKitFrameProvider)[];
}

export function defaultConfig(options: ConfigOptions) {
  const { metadata, extraConnectors } = options;

  let providers: ProviderType = { metadata, extraConnectors };

  return providers;
}
