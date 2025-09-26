/* eslint-disable no-console */
import {
  type OnRampCountry,
  type OnRampFiatCurrency,
  type OnRampFiatLimit,
  type OnRampServiceProvider,
  type OnRampCountryDefaults,
  type WcWallet,
  DateUtil,
  type ConnectorType,
  type ChainNamespace,
  type WalletDeepLink,
  SafeStorageKeys
} from '@reown/appkit-common-react-native';
import { OptionsController } from '../controllers/OptionsController';
import { LogController } from '../controllers/LogController';

// -- Utility -----------------------------------------------------------------
export const StorageUtil = {
  setWalletConnectDeepLink({ href, name }: WalletDeepLink) {
    try {
      OptionsController.getStorage().setItem(SafeStorageKeys.WC_DEEPLINK, {
        href,
        name
      });
    } catch (error) {
      LogController.sendError(error, 'StorageUtil.ts', 'setWalletConnectDeepLink');
    }
  },

  async getWalletConnectDeepLink() {
    try {
      const deepLink = await OptionsController.getStorage().getItem<WalletDeepLink>(
        SafeStorageKeys.WC_DEEPLINK
      );
      if (deepLink) {
        return deepLink;
      }
    } catch (error) {
      LogController.sendError(error, 'StorageUtil.ts', 'getWalletConnectDeepLink');
    }

    return undefined;
  },

  async removeWalletConnectDeepLink() {
    try {
      await OptionsController.getStorage().removeItem(SafeStorageKeys.WC_DEEPLINK);
    } catch (error) {
      LogController.sendError(error, 'StorageUtil.ts', 'removeWalletConnectDeepLink');
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
      OptionsController.getStorage().setItem(SafeStorageKeys.RECENT_WALLET, recentWallets);

      return recentWallets;
    } catch (error) {
      LogController.sendError(error, 'StorageUtil.ts', 'addRecentWallet');

      return undefined;
    }
  },

  async setRecentWallets(wallets: WcWallet[]) {
    try {
      await OptionsController.getStorage().setItem(SafeStorageKeys.RECENT_WALLET, wallets);
    } catch (error) {
      LogController.sendError(error, 'StorageUtil.ts', 'setRecentWallets');
    }
  },

  async getRecentWallets(): Promise<WcWallet[]> {
    try {
      const recent = await OptionsController.getStorage().getItem(SafeStorageKeys.RECENT_WALLET);

      return recent ?? [];
    } catch (error) {
      LogController.sendError(error, 'StorageUtil.ts', 'getRecentWallets');
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
          SafeStorageKeys.CONNECTED_CONNECTORS,
          updatedConnectors
        );
      }
    } catch (error) {
      LogController.sendError(error, 'StorageUtil.ts', 'setConnectedConnectors');
    }
  },

  async getConnectedConnectors(): Promise<{ type: ConnectorType; namespaces: string[] }[]> {
    try {
      const connectors = await OptionsController.getStorage().getItem<
        { type: ConnectorType; namespaces: string[] }[]
      >(SafeStorageKeys.CONNECTED_CONNECTORS);

      return connectors ?? [];
    } catch (err) {
      LogController.sendError(err, 'StorageUtil.ts', 'getConnectedConnectors');
    }

    return [];
  },

  async removeConnectedConnectors(type: ConnectorType) {
    try {
      const currentConnectors = await StorageUtil.getConnectedConnectors();
      const updatedConnectors = currentConnectors.filter(c => c.type !== type);
      await OptionsController.getStorage().setItem(
        SafeStorageKeys.CONNECTED_CONNECTORS,
        updatedConnectors
      );
    } catch (error) {
      LogController.sendError(error, 'StorageUtil.ts', 'removeConnectedConnectors');
    }
  },

  async setOnRampPreferredCountry(country: OnRampCountry) {
    try {
      await OptionsController.getStorage().setItem(
        SafeStorageKeys.ONRAMP_PREFERRED_COUNTRY,
        country
      );
    } catch (error) {
      LogController.sendError(error, 'StorageUtil.ts', 'setOnRampPreferredCountry');
    }
  },

  async getOnRampPreferredCountry() {
    try {
      const country = await OptionsController.getStorage().getItem<OnRampCountry>(
        SafeStorageKeys.ONRAMP_PREFERRED_COUNTRY
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
        SafeStorageKeys.ONRAMP_PREFERRED_FIAT_CURRENCY,
        currency
      );
    } catch (error) {
      LogController.sendError(error, 'StorageUtil.ts', 'setOnRampPreferredFiatCurrency');
    }
  },

  async getOnRampPreferredFiatCurrency() {
    try {
      const currency = await OptionsController.getStorage().getItem<OnRampFiatCurrency>(
        SafeStorageKeys.ONRAMP_PREFERRED_FIAT_CURRENCY
      );

      return currency ?? undefined;
    } catch (error) {
      LogController.sendError(error, 'StorageUtil.ts', 'getOnRampPreferredFiatCurrency');
    }

    return undefined;
  },

  async setOnRampCountries(countries: OnRampCountry[]) {
    try {
      await OptionsController.getStorage().setItem(SafeStorageKeys.ONRAMP_COUNTRIES, countries);
    } catch (error) {
      LogController.sendError(error, 'StorageUtil.ts', 'setOnRampCountries');
    }
  },

  async getOnRampCountries() {
    try {
      const countries = await OptionsController.getStorage().getItem<OnRampCountry[]>(
        SafeStorageKeys.ONRAMP_COUNTRIES
      );

      return countries ?? [];
    } catch (error) {
      LogController.sendError(error, 'StorageUtil.ts', 'getOnRampCountries');
    }

    return [];
  },

  async setOnRampCountriesDefaults(countriesDefaults: OnRampCountryDefaults[]) {
    try {
      const timestamp = Date.now();

      await OptionsController.getStorage().setItem(SafeStorageKeys.ONRAMP_COUNTRIES_DEFAULTS, {
        data: countriesDefaults,
        timestamp
      });
    } catch (error) {
      LogController.sendError(error, 'StorageUtil.ts', 'setOnRampCountriesDefaults');
    }
  },

  async getOnRampCountriesDefaults() {
    try {
      const result = await OptionsController.getStorage().getItem(
        SafeStorageKeys.ONRAMP_COUNTRIES_DEFAULTS
      );

      if (!result) {
        return [];
      }

      const { data, timestamp } = result;

      // Cache for 1 week
      if (timestamp && DateUtil.isMoreThanOneWeekAgo(timestamp)) {
        return [];
      }

      return (data as OnRampCountryDefaults[]) ?? [];
    } catch (error) {
      LogController.sendError(error, 'StorageUtil.ts', 'getOnRampCountriesDefaults');
    }

    return [];
  },

  async setOnRampServiceProviders(serviceProviders: OnRampServiceProvider[]) {
    try {
      const timestamp = Date.now();

      await OptionsController.getStorage().setItem(SafeStorageKeys.ONRAMP_SERVICE_PROVIDERS, {
        data: serviceProviders,
        timestamp
      });
    } catch (error) {
      LogController.sendError(error, 'StorageUtil.ts', 'setOnRampServiceProviders');
    }
  },

  async getOnRampServiceProviders() {
    try {
      const result = await OptionsController.getStorage().getItem(
        SafeStorageKeys.ONRAMP_SERVICE_PROVIDERS
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
      LogController.sendError(err, 'StorageUtil.ts', 'getOnRampServiceProviders');
    }

    return [];
  },

  async setOnRampFiatLimits(fiatLimits: OnRampFiatLimit[]) {
    try {
      const timestamp = Date.now();

      await OptionsController.getStorage().setItem(SafeStorageKeys.ONRAMP_FIAT_LIMITS, {
        data: fiatLimits,
        timestamp
      });
    } catch (error) {
      LogController.sendError(error, 'StorageUtil.ts', 'setOnRampFiatLimits');
    }
  },

  async getOnRampFiatLimits() {
    try {
      const result = await OptionsController.getStorage().getItem(
        SafeStorageKeys.ONRAMP_FIAT_LIMITS
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
    } catch (error) {
      LogController.sendError(error, 'StorageUtil.ts', 'getOnRampFiatLimits');
    }

    return [];
  },

  async setOnRampFiatCurrencies(fiatCurrencies: OnRampFiatCurrency[]) {
    try {
      const timestamp = Date.now();

      await OptionsController.getStorage().setItem(SafeStorageKeys.ONRAMP_FIAT_CURRENCIES, {
        data: fiatCurrencies,
        timestamp
      });
    } catch (error) {
      LogController.sendError(error, 'StorageUtil.ts', 'setOnRampFiatCurrencies');
    }
  },

  async getOnRampFiatCurrencies() {
    try {
      const result = await OptionsController.getStorage().getItem(
        SafeStorageKeys.ONRAMP_FIAT_CURRENCIES
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
    } catch (error) {
      LogController.sendError(error, 'StorageUtil.ts', 'getOnRampFiatCurrencies');
    }

    return [];
  },

  async setActiveNamespace(namespace?: ChainNamespace) {
    try {
      if (!namespace) {
        await OptionsController.getStorage().removeItem(SafeStorageKeys.ACTIVE_NAMESPACE);

        return;
      }

      await OptionsController.getStorage().setItem(SafeStorageKeys.ACTIVE_NAMESPACE, namespace);
    } catch (error) {
      LogController.sendError(error, 'StorageUtil.ts', 'setActiveNamespace');
    }
  },

  async getActiveNamespace() {
    try {
      const namespace = (await OptionsController.getStorage().getItem(
        SafeStorageKeys.ACTIVE_NAMESPACE
      )) as ChainNamespace;

      return namespace ?? undefined;
    } catch (err) {
      LogController.sendError(err, 'StorageUtil.ts', 'getActiveNamespace');
    }

    return undefined;
  },

  async removeActiveNamespace() {
    try {
      await OptionsController.getStorage().removeItem(SafeStorageKeys.ACTIVE_NAMESPACE);
    } catch (error) {
      LogController.sendError(error, 'StorageUtil.ts', 'removeActiveNamespace');
    }
  }
};
