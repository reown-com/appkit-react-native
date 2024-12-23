import type { CaipNetworkId } from '@reown/appkit-common-react-native';
import { AppKitFrameProvider } from '@reown/appkit-wallet-react-native';
import type { AppKitFrameTypes } from '@reown/appkit-wallet-react-native';

interface AppkitFrameProviderConfig {
  projectId: string;
  chainId?: number | CaipNetworkId;
  onTimeout?: () => void;
  metadata: AppKitFrameTypes.Metadata;
}

export class AppKitFrameProviderSingleton {
  private static instance: AppKitFrameProvider;

  private constructor() {}

  public static getInstance({
    projectId,
    chainId,
    onTimeout,
    metadata
  }: AppkitFrameProviderConfig): AppKitFrameProvider {
    if (!AppKitFrameProviderSingleton.instance) {
      AppKitFrameProviderSingleton.instance = new AppKitFrameProvider({
        projectId,
        chainId,
        onTimeout,
        metadata
      });
    }

    return AppKitFrameProviderSingleton.instance;
  }
}
