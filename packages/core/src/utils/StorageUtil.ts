/* eslint-disable no-console */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ConnectorType, WcWallet } from './TypeUtil';

// -- Helpers -----------------------------------------------------------------
const WC_DEEPLINK = 'WALLETCONNECT_DEEPLINK_CHOICE';
const W3M_RECENT = '@w3m/recent';
const W3M_CONNECTED_CONNECTOR = '@w3m/connected_connector';

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

  async removeWalletConnectDeepLink() {
    try {
      await AsyncStorage.removeItem(WC_DEEPLINK);
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
  },

  async setConnectedConnector(connectorType: ConnectorType) {
    try {
      await AsyncStorage.setItem(W3M_CONNECTED_CONNECTOR, JSON.stringify(connectorType));
    } catch {
      console.info('Unable to set Connected Connector');
    }
  },

  async getConnectedConnector() {
    try {
      const connector = (await AsyncStorage.getItem(W3M_CONNECTED_CONNECTOR)) as ConnectorType;

      return connector ? JSON.parse(connector) : undefined;
    } catch {
      console.info('Unable to get Connected Connector');
    }

    return undefined;
  },

  async removeConnectedConnector() {
    try {
      await AsyncStorage.removeItem(W3M_CONNECTED_CONNECTOR);
    } catch {
      console.info('Unable to remove Connected Connector');
    }
  }
};
