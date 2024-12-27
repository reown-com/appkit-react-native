/* eslint-disable no-console */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ConnectionStatus, WcWallet } from './TypeUtil';
import type {
  CaipNetworkId,
  ChainNamespace,
  SocialProvider
} from '@reown/appkit-common-react-native';

// -- Helpers -----------------------------------------------------------------
const WC_DEEPLINK = 'WALLETCONNECT_DEEPLINK_CHOICE';
const RECENT_WALLET = '@w3m/recent';
const CONNECTED_WALLET_IMAGE_URL = '@w3m/connected_wallet_image_url';
// const CONNECTED_CONNECTOR = '@w3m/connected_connector';
const CONNECTED_SOCIAL = '@appkit/connected_social';
const ACTIVE_NAMESPACE = '@appkit/active_namespace';
const CONNECTED_CONNECTOR_ID = '@appkit/connected_connector_id';
const ACTIVE_CAIP_NETWORK_ID = '@appkit/active_caip_network_id';
const CONNECTION_STATUS = '@appkit/connection_status';

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

  async addRecentWallet(wallet: WcWallet) {
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
      AsyncStorage.setItem(RECENT_WALLET, JSON.stringify(recentWallets));

      return recentWallets;
    } catch {
      console.info('Unable to set recent wallet');

      return undefined;
    }
  },

  async setRecentWallets(wallets: WcWallet[]) {
    try {
      await AsyncStorage.setItem(RECENT_WALLET, JSON.stringify(wallets));
    } catch {
      console.info('Unable to set recent wallets');
    }
  },

  async getRecentWallets(): Promise<WcWallet[]> {
    try {
      const recent = await AsyncStorage.getItem(RECENT_WALLET);

      return recent ? JSON.parse(recent) : [];
    } catch {
      console.info('Unable to get recent wallets');
    }

    return [];
  },

  // async setConnectedConnector(connectorType: ConnectorType) {
  //   try {
  //     await AsyncStorage.setItem(CONNECTED_CONNECTOR, JSON.stringify(connectorType));
  //   } catch {
  //     console.info('Unable to set Connected Connector');
  //   }
  // },

  // async getConnectedConnector(): Promise<ConnectorType | undefined> {
  //   try {
  //     const connector = (await AsyncStorage.getItem(CONNECTED_CONNECTOR)) as ConnectorType;

  //     return connector ? JSON.parse(connector) : undefined;
  //   } catch {
  //     console.info('Unable to get Connected Connector');
  //   }

  //   return undefined;
  // },

  // async removeConnectedConnector() {
  //   try {
  //     await AsyncStorage.removeItem(CONNECTED_CONNECTOR);
  //   } catch {
  //     console.info('Unable to remove Connected Connector');
  //   }
  // },

  async setConnectedWalletImageUrl(url: string) {
    try {
      await AsyncStorage.setItem(CONNECTED_WALLET_IMAGE_URL, url);
    } catch {
      console.info('Unable to set Connected Wallet Image URL');
    }
  },

  async getConnectedWalletImageUrl() {
    try {
      return await AsyncStorage.getItem(CONNECTED_WALLET_IMAGE_URL);
    } catch {
      console.info('Unable to get Connected Wallet Image URL');
    }

    return undefined;
  },

  async removeConnectedWalletImageUrl() {
    try {
      await AsyncStorage.removeItem(CONNECTED_WALLET_IMAGE_URL);
    } catch {
      console.info('Unable to remove Connected Wallet Image URL');
    }
  },

  async setConnectedSocialProvider(provider: SocialProvider) {
    try {
      await AsyncStorage.setItem(CONNECTED_SOCIAL, JSON.stringify(provider));
    } catch {
      console.info('Unable to set Connected Social Provider');
    }
  },

  async getConnectedSocialProvider() {
    try {
      const provider = (await AsyncStorage.getItem(CONNECTED_SOCIAL)) as SocialProvider;

      return provider ? JSON.parse(provider) : undefined;
    } catch {
      console.info('Unable to get Connected Social Provider');
    }

    return undefined;
  },

  async removeConnectedSocialProvider() {
    try {
      await AsyncStorage.removeItem(CONNECTED_SOCIAL);
    } catch {
      console.info('Unable to remove Connected Social Provider');
    }
  },

  setActiveCaipNetworkId(caipNetworkId: CaipNetworkId) {
    try {
      AsyncStorage.setItem(ACTIVE_CAIP_NETWORK_ID, caipNetworkId);
      StorageUtil.setActiveNamespace(caipNetworkId.split(':')[0] as ChainNamespace);
    } catch {
      console.info('Unable to set active caip network id');
    }
  },

  async getActiveCaipNetworkId() {
    try {
      return await AsyncStorage.getItem(ACTIVE_CAIP_NETWORK_ID);
    } catch {
      console.info('Unable to get active caip network id');

      return undefined;
    }
  },

  deleteActiveCaipNetworkId() {
    try {
      AsyncStorage.removeItem(ACTIVE_CAIP_NETWORK_ID);
    } catch {
      console.info('Unable to delete active caip network id');
    }
  },

  setActiveNamespace(namespace: ChainNamespace) {
    try {
      AsyncStorage.setItem(ACTIVE_NAMESPACE, namespace);
    } catch {
      console.info('Unable to set active namespace');
    }
  },

  async getActiveNamespace() {
    try {
      const activeNamespace = await AsyncStorage.getItem(ACTIVE_NAMESPACE);

      return activeNamespace as ChainNamespace | undefined;
    } catch {
      console.info('Unable to get active namespace');
    }

    return undefined;
  },

  setConnectedConnectorId(connectorId: string) {
    try {
      AsyncStorage.setItem(CONNECTED_CONNECTOR_ID, connectorId);
    } catch {
      console.info('Unable to set Connected Connector Id');
    }
  },

  async getConnectedConnectorId() {
    try {
      return await AsyncStorage.getItem(CONNECTED_CONNECTOR_ID);
    } catch {
      console.info('Unable to get connected connector id');
    }

    return undefined;
  },

  deleteConnectedConnectorId() {
    try {
      AsyncStorage.removeItem(CONNECTED_CONNECTOR_ID);
    } catch {
      console.info('Unable to delete connected connector id');
    }
  },

  setConnectionStatus(status: ConnectionStatus) {
    try {
      AsyncStorage.setItem(CONNECTION_STATUS, status);
    } catch {
      console.info('Unable to set connection status');
    }
  },

  async getConnectionStatus() {
    try {
      return (await AsyncStorage.getItem(CONNECTION_STATUS)) as ConnectionStatus;
    } catch {
      return undefined;
    }
  },

  async getStoredActiveCaipNetworkId() {
    const storedCaipNetworkId = await AsyncStorage.getItem(ACTIVE_CAIP_NETWORK_ID);
    const networkId = storedCaipNetworkId?.split(':')?.[1];

    return networkId;
  }
};
