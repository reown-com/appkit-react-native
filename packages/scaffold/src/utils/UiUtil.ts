import {
  AssetUtil,
  ConnectionController,
  StorageUtil,
  type WcWallet
} from '@web3modal/core-react-native';
import { LayoutAnimation } from 'react-native';

export const UiUtil = {
  TOTAL_VISIBLE_WALLETS: 4,

  createViewTransition: () => {
    LayoutAnimation.configureNext(LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'));
  },

  storeConnectedWallet: async (
    wcLinking: { name: string; href: string },
    pressedWallet?: WcWallet
  ) => {
    StorageUtil.setWalletConnectDeepLink(wcLinking);

    if (pressedWallet) {
      const recentWallets = await StorageUtil.setWeb3ModalRecent(pressedWallet);
      if (recentWallets) {
        ConnectionController.setRecentWallets(recentWallets);
      }
      const url = AssetUtil.getWalletImage(pressedWallet);
      if (url) {
        StorageUtil.setConnectedWalletImageUrl(url);
        ConnectionController.setConnectedWalletImageUrl(url);
      }
    }
  }
};
