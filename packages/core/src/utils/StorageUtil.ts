/* eslint-disable no-console */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  OnRampCountry,
  OnRampFiatCurrency,
  OnRampFiatLimit,
  OnRampServiceProvider,
  WcWallet
} from './TypeUtil';
import {
  DateUtil,
  type SocialProvider,
  type New_ConnectorType,
  type ChainNamespace
} from '@reown/appkit-common-react-native';

// -- Helpers -----------------------------------------------------------------
const WC_DEEPLINK = 'WALLETCONNECT_DEEPLINK_CHOICE';
const RECENT_WALLET = '@w3m/recent';
const CONNECTED_WALLET_IMAGE_URL = '@w3m/connected_wallet_image_url';
const CONNECTED_CONNECTORS = '@appkit/connected_connectors';
const CONNECTED_SOCIAL = '@appkit/connected_social';
const ONRAMP_PREFERRED_COUNTRY = '@appkit/onramp_preferred_country';
const ONRAMP_COUNTRIES = '@appkit/onramp_countries';
const ONRAMP_SERVICE_PROVIDERS = '@appkit/onramp_service_providers';
const ONRAMP_FIAT_LIMITS = '@appkit/onramp_fiat_limits';
const ONRAMP_FIAT_CURRENCIES = '@appkit/onramp_fiat_currencies';
const ONRAMP_PREFERRED_FIAT_CURRENCY = '@appkit/onramp_preferred_fiat_currency';
const ACTIVE_NAMESPACE = '@appkit/active_namespace';

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

  async setConnectedConnectors({
    type,
    namespaces
  }: {
    type: New_ConnectorType;
    namespaces: string[];
  }) {
    try {
      const currentConnectors = (await StorageUtil.getConnectedConnectors()) || [];
      // Only add if it doesn't exist already
      if (!currentConnectors.some(c => c.type === type)) {
        const updatedConnectors = [...currentConnectors, { type, namespaces }];
        await AsyncStorage.setItem(CONNECTED_CONNECTORS, JSON.stringify(updatedConnectors));
      }
    } catch {
      console.info('Unable to set Connected Connector');
    }
  },

  async getConnectedConnectors(): Promise<{ type: New_ConnectorType; namespaces: string[] }[]> {
    try {
      const connectors = await AsyncStorage.getItem(CONNECTED_CONNECTORS);

      return connectors ? JSON.parse(connectors) : [];
    } catch {
      console.info('Unable to get Connected Connector');
    }

    return [];
  },

  async removeConnectedConnectors(type: New_ConnectorType) {
    try {
      const currentConnectors = await StorageUtil.getConnectedConnectors();
      const updatedConnectors = currentConnectors.filter(c => c.type !== type);
      await AsyncStorage.setItem(CONNECTED_CONNECTORS, JSON.stringify(updatedConnectors));
    } catch {
      console.info('Unable to remove Connected Connector');
    }
  },

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

  async setOnRampPreferredCountry(country: OnRampCountry) {
    try {
      await AsyncStorage.setItem(ONRAMP_PREFERRED_COUNTRY, JSON.stringify(country));
    } catch {
      console.info('Unable to set OnRamp Preferred Country');
    }
  },

  async getOnRampPreferredCountry() {
    try {
      const country = await AsyncStorage.getItem(ONRAMP_PREFERRED_COUNTRY);

      return country ? (JSON.parse(country) as OnRampCountry) : undefined;
    } catch {
      console.info('Unable to get OnRamp Preferred Country');
    }

    return undefined;
  },

  async setOnRampPreferredFiatCurrency(currency: OnRampFiatCurrency) {
    try {
      await AsyncStorage.setItem(ONRAMP_PREFERRED_FIAT_CURRENCY, JSON.stringify(currency));
    } catch {
      console.info('Unable to set OnRamp Preferred Fiat Currency');
    }
  },

  async getOnRampPreferredFiatCurrency() {
    try {
      const currency = await AsyncStorage.getItem(ONRAMP_PREFERRED_FIAT_CURRENCY);

      return currency ? (JSON.parse(currency) as OnRampFiatCurrency) : undefined;
    } catch {
      console.info('Unable to get OnRamp Preferred Fiat Currency');
    }

    return undefined;
  },

  async setOnRampCountries(countries: OnRampCountry[]) {
    try {
      await AsyncStorage.setItem(ONRAMP_COUNTRIES, JSON.stringify(countries));
    } catch {
      console.info('Unable to set OnRamp Countries');
    }
  },

  async getOnRampCountries() {
    try {
      const countries = await AsyncStorage.getItem(ONRAMP_COUNTRIES);

      return countries ? (JSON.parse(countries) as OnRampCountry[]) : [];
    } catch {
      console.info('Unable to get OnRamp Countries');
    }

    return [];
  },

  async setOnRampServiceProviders(serviceProviders: OnRampServiceProvider[]) {
    try {
      const timestamp = Date.now();

      await AsyncStorage.setItem(
        ONRAMP_SERVICE_PROVIDERS,
        JSON.stringify({ data: serviceProviders, timestamp })
      );
    } catch {
      console.info('Unable to set OnRamp Service Providers');
    }
  },

  async getOnRampServiceProviders() {
    try {
      const result = await AsyncStorage.getItem(ONRAMP_SERVICE_PROVIDERS);

      if (!result) {
        return [];
      }

      const { data, timestamp } = JSON.parse(result);

      // Cache for 1 week
      if (timestamp && DateUtil.isMoreThanOneWeekAgo(timestamp)) {
        return [];
      }

      return data ? (data as OnRampServiceProvider[]) : [];
    } catch (err) {
      console.error(err);
      console.info('Unable to get OnRamp Service Providers');
    }

    return [];
  },

  async setOnRampFiatLimits(fiatLimits: OnRampFiatLimit[]) {
    try {
      const timestamp = Date.now();

      await AsyncStorage.setItem(
        ONRAMP_FIAT_LIMITS,
        JSON.stringify({ data: fiatLimits, timestamp })
      );
    } catch {
      console.info('Unable to set OnRamp Fiat Limits');
    }
  },

  async getOnRampFiatLimits() {
    try {
      const result = await AsyncStorage.getItem(ONRAMP_FIAT_LIMITS);

      if (!result) {
        return [];
      }

      const { data, timestamp } = JSON.parse(result);

      // Cache for 1 week
      if (timestamp && DateUtil.isMoreThanOneWeekAgo(timestamp)) {
        return [];
      }

      return data ? (data as OnRampFiatLimit[]) : [];
    } catch {
      console.info('Unable to get OnRamp Fiat Limits');
    }

    return [];
  },

  async setOnRampFiatCurrencies(fiatCurrencies: OnRampFiatCurrency[]) {
    try {
      const timestamp = Date.now();

      await AsyncStorage.setItem(
        ONRAMP_FIAT_CURRENCIES,
        JSON.stringify({ data: fiatCurrencies, timestamp })
      );
    } catch {
      console.info('Unable to set OnRamp Fiat Currencies');
    }
  },

  async getOnRampFiatCurrencies() {
    try {
      const result = await AsyncStorage.getItem(ONRAMP_FIAT_CURRENCIES);

      if (!result) {
        return [];
      }

      const { data, timestamp } = JSON.parse(result);

      // Cache for 1 week
      if (timestamp && DateUtil.isMoreThanOneWeekAgo(timestamp)) {
        return [];
      }

      return data ? (data as OnRampFiatCurrency[]) : [];
    } catch {
      console.info('Unable to get OnRamp Fiat Currencies');
    }

    return [];
  },

  async setActiveNamespace(namespace?: ChainNamespace) {
    try {
      if (!namespace) {
        await AsyncStorage.removeItem(ACTIVE_NAMESPACE);

        return;
      }

      await AsyncStorage.setItem(ACTIVE_NAMESPACE, namespace);
    } catch {
      console.info('Unable to set Active Namespace');
    }
  },

  async getActiveNamespace() {
    try {
      const namespace = (await AsyncStorage.getItem(ACTIVE_NAMESPACE)) as ChainNamespace;

      return namespace ?? undefined;
    } catch (err) {
      console.info('Unable to get Active Namespace');
    }

    return undefined;
  },

  async removeActiveNamespace() {
    try {
      await AsyncStorage.removeItem(ACTIVE_NAMESPACE);
    } catch {
      console.info('Unable to remove Active Namespace');
    }
  }
};
