import {
  AssetUtil,
  ConnectionController,
  StorageUtil,
  type WcWallet
} from '@reown/appkit-core-react-native';
import type { WalletDeepLink } from '@reown/appkit-common-react-native';

export const UiUtil = {
  TOTAL_VISIBLE_WALLETS: 4,

  createViewTransition: () => {
    //TODO: replace this with reanimated
    // LayoutAnimation.configureNext(LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'));
  },

  animateChange: () => {
    //TODO: replace this with reanimated
    // LayoutAnimation.configureNext(LayoutAnimation.create(150, type, creationProp));
  },

  storeConnectedWallet: async (wcLinking: WalletDeepLink, pressedWallet?: WcWallet) => {
    StorageUtil.setWalletConnectDeepLink(wcLinking);

    if (pressedWallet) {
      UiUtil.storeRecentWallet(pressedWallet);
      const url = AssetUtil.getWalletImage(pressedWallet);
      ConnectionController.setConnectedWalletImageUrl(url);
    }
  },

  storeRecentWallet: async (wallet: WcWallet) => {
    const recentWallets = await StorageUtil.addRecentWallet(wallet);
    if (recentWallets) {
      ConnectionController.setRecentWallets(recentWallets);
    }
  }
};
