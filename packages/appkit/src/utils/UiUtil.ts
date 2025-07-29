import {
  AssetUtil,
  ConnectionController,
  RouterController,
  StorageUtil,
  type WcWallet
} from '@reown/appkit-core-react-native';
import type { WalletDeepLink } from '@reown/appkit-common-react-native';

// Global animation instance to coordinate transitions
let currentRouteTransition: ((direction: 'forward' | 'backward' | 'none') => Promise<void>) | null =
  null;

export const UiUtil = {
  TOTAL_VISIBLE_WALLETS: 4,

  setRouteTransition: (
    transitionFn: (direction: 'forward' | 'backward' | 'none') => Promise<void>
  ) => {
    currentRouteTransition = transitionFn;
  },

  createViewTransition: async () => {
    if (currentRouteTransition) {
      const { navigationDirection } = RouterController.state;
      await currentRouteTransition(navigationDirection);

      RouterController.state.navigationDirection = 'none';
    }
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
