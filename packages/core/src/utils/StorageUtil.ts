/* eslint-disable no-console */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WcWallet } from './TypeUtils';

// -- Helpers -----------------------------------------------------------------
const WC_DEEPLINK = 'WALLETCONNECT_DEEPLINK_CHOICE';
const W3M_RECENT = '@w3m/recent';

// -- Utility -----------------------------------------------------------------
export const StorageUtil = {
  setWalletConnectDeepLink({ href, name }: { href: string; name: string }) {
    try {
      AsyncStorage.setItem(WC_DEEPLINK, JSON.stringify({ href, name }));
    } catch {
      console.info('Unable to set WalletConnect deep link');
    }
  },

  async getWalletConnectDeepLink() {
    try {
      const deepLink = await AsyncStorage.getItem(WC_DEEPLINK);
      if (deepLink) {
        return JSON.parse(deepLink);
      }
    } catch {
      console.info('Unable to get WalletConnect deep link');
    }

    return undefined;
  },

  deleteWalletConnectDeepLink() {
    try {
      AsyncStorage.removeItem(WC_DEEPLINK);
    } catch {
      console.info('Unable to delete WalletConnect deep link');
    }
  },

  async setWeb3ModalRecent(wallet: WcWallet) {
    try {
      const recentWallets = await StorageUtil.getRecentWallets();
      const recentIndex = recentWallets.findIndex(w => w.id === wallet.id);

      if (recentIndex > -1) {
        recentWallets.splice(recentIndex, 1);
      }

      recentWallets.unshift(wallet);
      if (recentWallets.length > 2) {
        recentWallets.pop();
      }
      AsyncStorage.setItem(W3M_RECENT, JSON.stringify(recentWallets));

      return recentWallets;
    } catch {
      console.info('Unable to set Web3Modal recent');

      return undefined;
    }
  },

  async getRecentWallets(): Promise<WcWallet[]> {
    try {
      const recent = await AsyncStorage.getItem(W3M_RECENT);

      return recent ? JSON.parse(recent) : [];
    } catch {
      console.info('Unable to get Web3Modal recent');
    }

    return [];
  }
};
