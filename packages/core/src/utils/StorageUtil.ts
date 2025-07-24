/* eslint-disable no-console */
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
  type ConnectorType,
  type ChainNamespace,
  type WalletDeepLink,
  ConstantsUtil
} from '@reown/appkit-common-react-native';
import { OptionsController } from '../controllers/OptionsController';

// -- Utility -----------------------------------------------------------------
export const StorageUtil = {
  setWalletConnectDeepLink({ href, name }: WalletDeepLink) {
    try {
      OptionsController.getStorage().setItem(ConstantsUtil.STORAGE_KEYS.WC_DEEPLINK, {
        href,
        name
      });
    } catch {
      console.info('Unable to set WalletConnect deep link');
    }
  },

  async getWalletConnectDeepLink() {
    try {
      const deepLink = await OptionsController.getStorage().getItem<WalletDeepLink>(
        ConstantsUtil.STORAGE_KEYS.WC_DEEPLINK
      );
      if (deepLink) {
        return deepLink;
      }
    } catch {
      console.info('Unable to get WalletConnect deep link');
    }

    return undefined;
  },

  async removeWalletConnectDeepLink() {
    try {
      await OptionsController.getStorage().removeItem(ConstantsUtil.STORAGE_KEYS.WC_DEEPLINK);
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
      OptionsController.getStorage().setItem(
        ConstantsUtil.STORAGE_KEYS.RECENT_WALLET,
        recentWallets
      );

      return recentWallets;
    } catch {
      console.info('Unable to set recent wallet');

      return undefined;
    }
  },

  async setRecentWallets(wallets: WcWallet[]) {
    try {
      await OptionsController.getStorage().setItem(
        ConstantsUtil.STORAGE_KEYS.RECENT_WALLET,
        wallets
      );
    } catch {
      console.info('Unable to set recent wallets');
    }
  },

  async getRecentWallets(): Promise<WcWallet[]> {
    try {
      const recent = await OptionsController.getStorage().getItem(
        ConstantsUtil.STORAGE_KEYS.RECENT_WALLET
      );

      return recent ?? [];
    } catch {
      console.info('Unable to get recent wallets');
    }

    return [];
  },

  async setConnectedConnectors({
    type,
    namespaces
  }: {
    type: ConnectorType;
    namespaces: string[];
  }) {
    try {
      const currentConnectors = (await StorageUtil.getConnectedConnectors()) || [];
      // Only add if it doesn't exist already
      if (!currentConnectors.some(c => c.type === type)) {
        const updatedConnectors = [...currentConnectors, { type, namespaces }];
        await OptionsController.getStorage().setItem(
          ConstantsUtil.STORAGE_KEYS.CONNECTED_CONNECTORS,
          updatedConnectors
        );
      }
    } catch {
      console.info('Unable to set Connected Connector');
    }
  },

  async getConnectedConnectors(): Promise<{ type: ConnectorType; namespaces: string[] }[]> {
    try {
      const connectors = await OptionsController.getStorage().getItem<
        { type: ConnectorType; namespaces: string[] }[]
      >(ConstantsUtil.STORAGE_KEYS.CONNECTED_CONNECTORS);

      return connectors ?? [];
    } catch (err) {
      console.info('Unable to get Connected Connector');
    }

    return [];
  },

  async removeConnectedConnectors(type: ConnectorType) {
    try {
      const currentConnectors = await StorageUtil.getConnectedConnectors();
      const updatedConnectors = currentConnectors.filter(c => c.type !== type);
      await OptionsController.getStorage().setItem(
        ConstantsUtil.STORAGE_KEYS.CONNECTED_CONNECTORS,
        updatedConnectors
      );
    } catch {
      console.info('Unable to remove Connected Connector');
    }
  },

  async setConnectedWalletImageUrl(url: string) {
    try {
      await OptionsController.getStorage().setItem(
        ConstantsUtil.STORAGE_KEYS.CONNECTED_WALLET_IMAGE_URL,
        url
      );
    } catch {
      console.info('Unable to set Connected Wallet Image URL');
    }
  },

  async getConnectedWalletImageUrl() {
    try {
      return await OptionsController.getStorage().getItem(
        ConstantsUtil.STORAGE_KEYS.CONNECTED_WALLET_IMAGE_URL
      );
    } catch {
      console.info('Unable to get Connected Wallet Image URL');
    }

    return undefined;
  },

  async removeConnectedWalletImageUrl() {
    try {
      await OptionsController.getStorage().removeItem(
        ConstantsUtil.STORAGE_KEYS.CONNECTED_WALLET_IMAGE_URL
      );
    } catch {
      console.info('Unable to remove Connected Wallet Image URL');
    }
  },

  async setConnectedSocialProvider(provider: SocialProvider) {
    try {
      await OptionsController.getStorage().setItem(
        ConstantsUtil.STORAGE_KEYS.CONNECTED_SOCIAL,
        provider
      );
    } catch {
      console.info('Unable to set Connected Social Provider');
    }
  },

  async getConnectedSocialProvider(): Promise<SocialProvider | undefined> {
    try {
      const provider = await OptionsController.getStorage().getItem<SocialProvider>(
        ConstantsUtil.STORAGE_KEYS.CONNECTED_SOCIAL
      );

      return provider ?? undefined;
    } catch {
      console.info('Unable to get Connected Social Provider');
    }

    return undefined;
  },

  async removeConnectedSocialProvider() {
    try {
      await OptionsController.getStorage().removeItem(ConstantsUtil.STORAGE_KEYS.CONNECTED_SOCIAL);
    } catch {
      console.info('Unable to remove Connected Social Provider');
    }
  },

  async setOnRampPreferredCountry(country: OnRampCountry) {
    try {
      await OptionsController.getStorage().setItem(
        ConstantsUtil.STORAGE_KEYS.ONRAMP_PREFERRED_COUNTRY,
        country
      );
    } catch {
      console.info('Unable to set OnRamp Preferred Country');
    }
  },

  async getOnRampPreferredCountry() {
    try {
      const country = await OptionsController.getStorage().getItem<OnRampCountry>(
        ConstantsUtil.STORAGE_KEYS.ONRAMP_PREFERRED_COUNTRY
      );

      return country ?? undefined;
    } catch {
      console.info('Unable to get OnRamp Preferred Country');
    }

    return undefined;
  },

  async setOnRampPreferredFiatCurrency(currency: OnRampFiatCurrency) {
    try {
      await OptionsController.getStorage().setItem(
        ConstantsUtil.STORAGE_KEYS.ONRAMP_PREFERRED_FIAT_CURRENCY,
        currency
      );
    } catch {
      console.info('Unable to set OnRamp Preferred Fiat Currency');
    }
  },

  async getOnRampPreferredFiatCurrency() {
    try {
      const currency = await OptionsController.getStorage().getItem<OnRampFiatCurrency>(
        ConstantsUtil.STORAGE_KEYS.ONRAMP_PREFERRED_FIAT_CURRENCY
      );

      return currency ?? undefined;
    } catch {
      console.info('Unable to get OnRamp Preferred Fiat Currency');
    }

    return undefined;
  },

  async setOnRampCountries(countries: OnRampCountry[]) {
    try {
      await OptionsController.getStorage().setItem(
        ConstantsUtil.STORAGE_KEYS.ONRAMP_COUNTRIES,
        countries
      );
    } catch {
      console.info('Unable to set OnRamp Countries');
    }
  },

  async getOnRampCountries() {
    try {
      const countries = await OptionsController.getStorage().getItem<OnRampCountry[]>(
        ConstantsUtil.STORAGE_KEYS.ONRAMP_COUNTRIES
      );

      return countries ?? [];
    } catch {
      console.info('Unable to get OnRamp Countries');
    }

    return [];
  },

  async setOnRampServiceProviders(serviceProviders: OnRampServiceProvider[]) {
    try {
      const timestamp = Date.now();

      await OptionsController.getStorage().setItem(
        ConstantsUtil.STORAGE_KEYS.ONRAMP_SERVICE_PROVIDERS,
        { data: serviceProviders, timestamp }
      );
    } catch {
      console.info('Unable to set OnRamp Service Providers');
    }
  },

  async getOnRampServiceProviders() {
    try {
      const result = await OptionsController.getStorage().getItem(
        ConstantsUtil.STORAGE_KEYS.ONRAMP_SERVICE_PROVIDERS
      );

      if (!result) {
        return [];
      }

      const { data, timestamp } = result;

      // Cache for 1 week
      if (timestamp && DateUtil.isMoreThanOneWeekAgo(timestamp)) {
        return [];
      }

      return (data as OnRampServiceProvider[]) ?? [];
    } catch (err) {
      console.error(err);
      console.info('Unable to get OnRamp Service Providers');
    }

    return [];
  },

  async setOnRampFiatLimits(fiatLimits: OnRampFiatLimit[]) {
    try {
      const timestamp = Date.now();

      await OptionsController.getStorage().setItem(ConstantsUtil.STORAGE_KEYS.ONRAMP_FIAT_LIMITS, {
        data: fiatLimits,
        timestamp
      });
    } catch {
      console.info('Unable to set OnRamp Fiat Limits');
    }
  },

  async getOnRampFiatLimits() {
    try {
      const result = await OptionsController.getStorage().getItem(
        ConstantsUtil.STORAGE_KEYS.ONRAMP_FIAT_LIMITS
      );

      if (!result) {
        return [];
      }

      const { data, timestamp } = result;

      // Cache for 1 week
      if (timestamp && DateUtil.isMoreThanOneWeekAgo(timestamp)) {
        return [];
      }

      return (data as OnRampFiatLimit[]) ?? [];
    } catch {
      console.info('Unable to get OnRamp Fiat Limits');
    }

    return [];
  },

  async setOnRampFiatCurrencies(fiatCurrencies: OnRampFiatCurrency[]) {
    try {
      const timestamp = Date.now();

      await OptionsController.getStorage().setItem(
        ConstantsUtil.STORAGE_KEYS.ONRAMP_FIAT_CURRENCIES,
        { data: fiatCurrencies, timestamp }
      );
    } catch {
      console.info('Unable to set OnRamp Fiat Currencies');
    }
  },

  async getOnRampFiatCurrencies() {
    try {
      const result = await OptionsController.getStorage().getItem(
        ConstantsUtil.STORAGE_KEYS.ONRAMP_FIAT_CURRENCIES
      );

      if (!result) {
        return [];
      }

      const { data, timestamp } = result;

      // Cache for 1 week
      if (timestamp && DateUtil.isMoreThanOneWeekAgo(timestamp)) {
        return [];
      }

      return (data as OnRampFiatCurrency[]) ?? [];
    } catch {
      console.info('Unable to get OnRamp Fiat Currencies');
    }

    return [];
  },

  async setActiveNamespace(namespace?: ChainNamespace) {
    try {
      if (!namespace) {
        await OptionsController.getStorage().removeItem(
          ConstantsUtil.STORAGE_KEYS.ACTIVE_NAMESPACE
        );

        return;
      }

      await OptionsController.getStorage().setItem(
        ConstantsUtil.STORAGE_KEYS.ACTIVE_NAMESPACE,
        namespace
      );
    } catch {
      console.info('Unable to set Active Namespace');
    }
  },

  async getActiveNamespace() {
    try {
      const namespace = (await OptionsController.getStorage().getItem(
        ConstantsUtil.STORAGE_KEYS.ACTIVE_NAMESPACE
      )) as ChainNamespace;

      return namespace ?? undefined;
    } catch (err) {
      console.error(err);
      console.info('Unable to get Active Namespace');
    }

    return undefined;
  },

  async removeActiveNamespace() {
    try {
      await OptionsController.getStorage().removeItem(ConstantsUtil.STORAGE_KEYS.ACTIVE_NAMESPACE);
    } catch {
      console.info('Unable to remove Active Namespace');
    }
  }
};
