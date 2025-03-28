import {
  AssetUtil,
  ConnectionController,
  StorageUtil,
  type WcWallet
} from '@reown/appkit-core-react-native';

export const UiUtil = {
  TOTAL_VISIBLE_WALLETS: 4,

  createViewTransition: () => {
    // Removed LayoutAnimation usage as it's not compatible with the new architecture
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
