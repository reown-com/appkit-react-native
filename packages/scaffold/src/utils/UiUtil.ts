import {
  AssetUtil,
  ConnectionController,
  StorageUtil,
  type WcWallet
} from '@reown/appkit-core-react-native';
import { LayoutAnimation, Platform } from 'react-native';

export const UiUtil = {
  TOTAL_VISIBLE_WALLETS: 4,

  createViewTransition: () => {
    const IS_IOS_NEW_ARCH = Platform.OS === 'ios' && (global as any)?.nativeFabricUIManager != null;

    // Disable layout animation for new arch on iOS -> https://github.com/facebook/react-native/issues/47617
    if (!IS_IOS_NEW_ARCH) {
      LayoutAnimation.configureNext(LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'));
    }
  },

  storeConnectedWallet: async (
    wcLinking: { name: string; href: string },
    pressedWallet?: WcWallet
  ) => {
    StorageUtil.setWalletConnectDeepLink(wcLinking);

    if (pressedWallet) {
      const recentWallets = await StorageUtil.addRecentWallet(pressedWallet);
      if (recentWallets) {
        ConnectionController.setRecentWallets(recentWallets);
      }
      const url = AssetUtil.getWalletImage(pressedWallet);
      ConnectionController.setConnectedWalletImageUrl(url);
    }
  }
};
