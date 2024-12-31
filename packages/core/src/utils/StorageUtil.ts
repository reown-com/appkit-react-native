/* eslint-disable no-console */
import type { ConnectionStatus, WcWallet } from './TypeUtil';
import {
  SafeLocalStorage,
  type CaipNetworkId,
  type ChainNamespace,
  type SocialProvider
} from '@reown/appkit-common-react-native';
import { getSafeConnectorIdKey, SafeLocalStorageKeys } from '@reown/appkit-common-react-native';

// -- Utility -----------------------------------------------------------------
export const StorageUtil = {
  async getActiveNetworkProps() {
    const activeNamespace = await StorageUtil.getActiveNamespace();
    const activeCaipNetworkId = await StorageUtil.getActiveCaipNetworkId();
    const caipNetworkIdFromStorage = activeCaipNetworkId
      ? activeCaipNetworkId.split(':')[1]
      : undefined;

    return {
      namespace: activeNamespace,
      caipNetworkId: activeCaipNetworkId,
      chainId: caipNetworkIdFromStorage
    };
  },
  setWalletConnectDeepLink({ href, name }: { href: string; name: string }) {
    try {
      SafeLocalStorage.setItem(
        SafeLocalStorageKeys.DEEPLINK_CHOICE,
        JSON.stringify({ href, name })
      );
    } catch {
      console.info('Unable to set WalletConnect deep link');
    }
  },

  async getWalletConnectDeepLink() {
    try {
      const deepLink = await SafeLocalStorage.getItem<string>(SafeLocalStorageKeys.DEEPLINK_CHOICE);
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
      await SafeLocalStorage.removeItem(SafeLocalStorageKeys.DEEPLINK_CHOICE);
    } catch {
      console.info('Unable to delete WalletConnect deep link');
    }
  },

  async addRecentWallet(wallet: WcWallet) {
    try {
      const recentWallets = await this.getRecentWallets();
      const recentIndex = recentWallets.findIndex(w => w.id === wallet.id);

      if (recentIndex > -1) {
        recentWallets.splice(recentIndex, 1);
      }

      recentWallets.unshift(wallet);
      if (recentWallets.length > 2) {
        recentWallets.pop();
      }
      SafeLocalStorage.setItem(SafeLocalStorageKeys.RECENT_WALLETS, JSON.stringify(recentWallets));

      return recentWallets;
    } catch {
      console.info('Unable to set recent wallet');

      return undefined;
    }
  },

  async setRecentWallets(wallets: WcWallet[]) {
    try {
      await SafeLocalStorage.setItem(SafeLocalStorageKeys.RECENT_WALLETS, JSON.stringify(wallets));
    } catch {
      console.info('Unable to set recent wallets');
    }
  },

  async getRecentWallets(): Promise<WcWallet[]> {
    try {
      const recent = await SafeLocalStorage.getItem<WcWallet[]>(
        SafeLocalStorageKeys.RECENT_WALLETS
      );

      return recent ?? [];
    } catch {
      console.info('Unable to get recent wallets');
    }

    return [];
  },

  async setConnectedWalletImageUrl(url: string) {
    try {
      await SafeLocalStorage.setItem(SafeLocalStorageKeys.WALLET_IMAGE, url);
    } catch {
      console.info('Unable to set Connected Wallet Image URL');
    }
  },

  async getConnectedWalletImageUrl() {
    try {
      return await SafeLocalStorage.getItem<string>(SafeLocalStorageKeys.WALLET_IMAGE);
    } catch {
      console.info('Unable to get Connected Wallet Image URL');
    }

    return undefined;
  },

  async removeConnectedWalletImageUrl() {
    try {
      await SafeLocalStorage.removeItem(SafeLocalStorageKeys.WALLET_IMAGE);
    } catch {
      console.info('Unable to remove Connected Wallet Image URL');
    }
  },

  async setConnectedSocialProvider(provider: SocialProvider) {
    try {
      await SafeLocalStorage.setItem(
        SafeLocalStorageKeys.CONNECTED_SOCIAL,
        JSON.stringify(provider)
      );
    } catch {
      console.info('Unable to set Connected Social Provider');
    }
  },

  async getConnectedSocialProvider() {
    try {
      const provider = (await SafeLocalStorage.getItem(
        SafeLocalStorageKeys.CONNECTED_SOCIAL
      )) as SocialProvider;

      return provider ? JSON.parse(provider) : undefined;
    } catch {
      console.info('Unable to get Connected Social Provider');
    }

    return undefined;
  },

  async removeConnectedSocialProvider() {
    try {
      await SafeLocalStorage.removeItem(SafeLocalStorageKeys.CONNECTED_SOCIAL);
    } catch {
      console.info('Unable to remove Connected Social Provider');
    }
  },

  setActiveCaipNetworkId(caipNetworkId: CaipNetworkId) {
    try {
      SafeLocalStorage.setItem(SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID, caipNetworkId);
      StorageUtil.setActiveNamespace(caipNetworkId.split(':')[0] as ChainNamespace);
    } catch {
      console.info('Unable to set active caip network id');
    }
  },

  async getActiveCaipNetworkId() {
    try {
      return await SafeLocalStorage.getItem<string>(SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID);
    } catch {
      console.info('Unable to get active caip network id');

      return undefined;
    }
  },

  deleteActiveCaipNetworkId() {
    try {
      SafeLocalStorage.removeItem(SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID);
    } catch {
      console.info('Unable to delete active caip network id');
    }
  },

  setActiveNamespace(namespace: ChainNamespace) {
    try {
      SafeLocalStorage.setItem(SafeLocalStorageKeys.ACTIVE_NAMESPACE, namespace);
    } catch {
      console.info('Unable to set active namespace');
    }
  },

  async getActiveNamespace() {
    try {
      const activeNamespace = await SafeLocalStorage.getItem<string>(
        SafeLocalStorageKeys.ACTIVE_NAMESPACE
      );

      return activeNamespace as ChainNamespace | undefined;
    } catch {
      console.info('Unable to get active namespace');
    }

    return undefined;
  },

  setConnectedConnectorId(namespace: ChainNamespace, connectorId: string) {
    try {
      const key = getSafeConnectorIdKey(namespace);
      SafeLocalStorage.setItem(key, connectorId);
    } catch {
      console.info('Unable to set Connected Connector Id');
    }
  },

  deleteConnectedConnectorId(namespace: ChainNamespace) {
    try {
      const key = getSafeConnectorIdKey(namespace);
      SafeLocalStorage.removeItem(key);
    } catch {
      console.info('Unable to delete connected connector id');
    }
  },

  async getConnectedConnectorId(namespace: ChainNamespace) {
    try {
      const key = getSafeConnectorIdKey(namespace);

      return await SafeLocalStorage.getItem<string>(key);
    } catch (e) {
      console.info('Unable to get connected connector id in namespace ', namespace);
    }

    return undefined;
  },

  setConnectionStatus(status: ConnectionStatus) {
    try {
      SafeLocalStorage.setItem(SafeLocalStorageKeys.CONNECTION_STATUS, status);
    } catch {
      console.info('Unable to set connection status');
    }
  },

  async getConnectionStatus() {
    try {
      return (await SafeLocalStorage.getItem<string>(
        SafeLocalStorageKeys.CONNECTION_STATUS
      )) as ConnectionStatus;
    } catch {
      return undefined;
    }
  },

  async getStoredActiveCaipNetworkId() {
    const storedCaipNetworkId = await SafeLocalStorage.getItem<string>(
      SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID
    );
    const networkId = storedCaipNetworkId?.split(':')?.[1];

    return networkId;
  },

  async getConnectedNamespaces() {
    try {
      const namespaces = await SafeLocalStorage.getItem<string>(
        SafeLocalStorageKeys.CONNECTED_NAMESPACES
      );

      if (!namespaces?.length) {
        return [];
      }

      return namespaces.split(',') as ChainNamespace[];
    } catch {
      return [];
    }
  },

  setConnectedNamespaces(namespaces: ChainNamespace[]) {
    try {
      const uniqueNamespaces = Array.from(new Set(namespaces));
      SafeLocalStorage.setItem(
        SafeLocalStorageKeys.CONNECTED_NAMESPACES,
        uniqueNamespaces.join(',')
      );
    } catch {
      console.info('Unable to set namespaces in storage');
    }
  },

  async addConnectedNamespace(namespace: ChainNamespace) {
    try {
      const namespaces = await StorageUtil.getConnectedNamespaces();
      if (!namespaces.includes(namespace)) {
        namespaces.push(namespace);
        StorageUtil.setConnectedNamespaces(namespaces);
      }
    } catch {
      console.info('Unable to add connected namespace');
    }
  },

  async removeConnectedNamespace(namespace: ChainNamespace) {
    try {
      const namespaces = await StorageUtil.getConnectedNamespaces();
      const index = namespaces.indexOf(namespace);
      if (index > -1) {
        namespaces.splice(index, 1);
        StorageUtil.setConnectedNamespaces(namespaces);
      }
    } catch {
      console.info('Unable to remove connected namespace');
    }
  }
};
