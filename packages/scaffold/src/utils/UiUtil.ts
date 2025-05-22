import {
  AssetUtil,
  ConnectionController,
  StorageUtil,
  type WcWallet,
  type CaipNetwork
} from '@reown/appkit-core-react-native';
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
      const recentWallets = await StorageUtil.addRecentWallet(pressedWallet);
      if (recentWallets) {
        ConnectionController.setRecentWallets(recentWallets);
      }
      const url = AssetUtil.getWalletImage(pressedWallet);
      ConnectionController.setConnectedWalletImageUrl(url);
    }
  },

  getNetworkButtonText(
    isConnected: boolean,
    caipNetwork: CaipNetwork | undefined,
    isNetworkSupported: boolean
  ): string {
    let buttonText: string;

    if (!isConnected) {
      if (caipNetwork) {
        buttonText = caipNetwork.name ?? 'Unknown Network';
      } else {
        buttonText = 'Select Network';
      }
    } else {
      // isConnected is true
      if (caipNetwork) {
        if (isNetworkSupported) {
          buttonText = caipNetwork.name ?? 'Unknown Network';
        } else {
          buttonText = 'Switch Network';
        }
      } else {
        buttonText = 'Select Network';
      }
    }

    return buttonText;
  }
};
