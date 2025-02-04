import { subscribeKey as subKey } from 'valtio/vanilla/utils';
import { proxy, subscribe as sub } from 'valtio/vanilla';
import type {
  OnRampPaymentMethod,
  OnRampCountry,
  OnRampFiatCurrency,
  OnRampQuoteResponse,
  OnRampWidgetResponse,
  OnRampQuote,
  OnRampFiatLimit,
  OnRampCryptoCurrency,
  OnRampServiceProvider
} from '../utils/TypeUtil';
import { FetchUtil } from '../utils/FetchUtil';
import { CoreHelperUtil } from '../utils/CoreHelperUtil';
import { NetworkController } from './NetworkController';
import { AccountController } from './AccountController';
import { OptionsController } from './OptionsController';
import { ConstantsUtil } from '../utils/ConstantsUtil';
import { StorageUtil } from '../utils/StorageUtil';
// -- Helpers ------------------------------------------- //
const baseUrl = CoreHelperUtil.getMeldApiUrl();
const api = new FetchUtil({ baseUrl });
const headers = {
  'Authorization': `Basic ${CoreHelperUtil.getMeldToken()}`,
  'Content-Type': 'application/json'
};

const defaultPaymentAmount = 150;

// -- Types --------------------------------------------- //
export interface OnRampControllerState {
  countries: OnRampCountry[];
  selectedCountry?: OnRampCountry;
  serviceProviders: OnRampServiceProvider[];
  selectedServiceProvider?: OnRampServiceProvider;
  paymentMethods: OnRampPaymentMethod[];
  selectedPaymentMethod?: OnRampPaymentMethod;
  purchaseAmount?: number;
  purchaseCurrency?: OnRampCryptoCurrency;
  purchaseCurrencies?: OnRampCryptoCurrency[];
  paymentAmount?: number;
  paymentCurrency?: OnRampFiatCurrency;
  paymentCurrencies?: OnRampFiatCurrency[];
  paymentCurrenciesLimits?: OnRampFiatLimit[];
  quotes?: OnRampQuote[];
  selectedQuote?: OnRampQuote;
  quotesLoading: boolean;
  widgetUrl?: string;
  error?: string;
  loading?: boolean;
}

type StateKey = keyof OnRampControllerState;

const defaultState = {
  quotesLoading: false,
  countries: [],
  paymentMethods: [],
  serviceProviders: [],
  paymentAmount: undefined
};

// -- State --------------------------------------------- //
const state = proxy<OnRampControllerState>(defaultState);

// -- Controller ---------------------------------------- //
export const OnRampController = {
  state,

  subscribe(callback: (newState: OnRampControllerState) => void) {
    return sub(state, () => callback(state));
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: OnRampControllerState[K]) => void) {
    return subKey(state, key, callback);
  },

  async setSelectedCountry(country: OnRampCountry, updateCurrency = true) {
    state.selectedCountry = country;
    state.loading = true;
    await Promise.all([this.fetchPaymentMethods(), this.fetchCryptoCurrencies()]);

    if (updateCurrency) {
      const currencyCode =
        ConstantsUtil.COUNTRY_CURRENCIES[
          country.countryCode as keyof typeof ConstantsUtil.COUNTRY_CURRENCIES
        ] || 'USD';

      const currency = state.paymentCurrencies?.find(c => c.currencyCode === currencyCode);

      if (currency) {
        this.setPaymentCurrency(currency);
      }
    }
    state.loading = false;

    StorageUtil.setOnRampPreferredCountry(country);
  },

  setSelectedPaymentMethod(paymentMethod: OnRampPaymentMethod) {
    state.selectedPaymentMethod = paymentMethod;

    // Reset quotes
    state.selectedQuote = undefined;
    state.quotes = [];
  },

  setPurchaseCurrency(currency: OnRampCryptoCurrency) {
    state.purchaseCurrency = currency;
  },

  setPaymentCurrency(currency: OnRampFiatCurrency, updateAmount = true) {
    state.paymentCurrency = currency;

    if (updateAmount) {
      const limits = state.paymentCurrenciesLimits?.find(
        l => l.currencyCode === currency.currencyCode
      );
      state.paymentAmount = limits?.defaultAmount || defaultPaymentAmount;
    }
  },

  setPurchaseAmount(amount: number) {
    state.purchaseAmount = amount;
  },

  setPaymentAmount(amount: number | string) {
    state.paymentAmount = Number(amount);
  },

  setDefaultPaymentAmount(currency: OnRampFiatCurrency) {
    const limits = this.getCurrencyLimit(currency);

    state.paymentAmount = limits?.defaultAmount || defaultPaymentAmount;
  },

  setSelectedQuote(quote?: OnRampQuote) {
    state.selectedQuote = quote;
  },

  updateSelectedPurchaseCurrency() {
    let selectedCurrency;
    if (NetworkController.state.caipNetwork?.id) {
      const defaultCurrency =
        ConstantsUtil.NETWORK_DEFAULT_CURRENCIES[
          NetworkController.state.caipNetwork
            ?.id as keyof typeof ConstantsUtil.NETWORK_DEFAULT_CURRENCIES
        ] || 'ETH';
      selectedCurrency = state.purchaseCurrencies?.find(c => c.currencyCode === defaultCurrency);
    }

    state.purchaseCurrency = selectedCurrency || state.purchaseCurrencies?.[0] || undefined;
  },

  getServiceProviderImage(serviceProviderName: string) {
    const provider = state.serviceProviders.find(p => p.serviceProvider === serviceProviderName);

    return provider?.logos?.lightShort;
  },

  getCurrencyLimit(currency: OnRampFiatCurrency) {
    return state.paymentCurrenciesLimits?.find(l => l.currencyCode === currency.currencyCode);
  },

  async fetchCountries() {
    let countries = await StorageUtil.getOnRampCountries();

    if (!countries.length) {
      countries =
        (await api.get<OnRampCountry[]>({
          path: '/service-providers/properties/countries',
          headers,
          params: {
            categories: 'CRYPTO_ONRAMP'
          }
        })) ?? [];

      StorageUtil.setOnRampCountries(countries);
    }

    state.countries = countries || [];

    const preferredCountry = await StorageUtil.getOnRampPreferredCountry();

    if (preferredCountry) {
      state.selectedCountry = preferredCountry;
    } else {
      const timezone = CoreHelperUtil.getTimezone()?.toLowerCase()?.split('/');

      state.selectedCountry =
        countries?.find(c => timezone?.includes(c.name.toLowerCase())) ||
        countries?.find(c => c.countryCode === 'US') ||
        countries?.[0] ||
        undefined;
    }
  },

  async fetchServiceProviders() {
    let serviceProviders = await StorageUtil.getOnRampServiceProviders();

    if (!serviceProviders.length) {
      serviceProviders =
        (await api.get<OnRampServiceProvider[]>({
          path: '/service-providers',
          headers,
          params: {
            categories: 'CRYPTO_ONRAMP'
          }
        })) ?? [];

      StorageUtil.setOnRampServiceProviders(serviceProviders);
    }

    state.serviceProviders = serviceProviders || [];
  },

  async fetchPaymentMethods() {
    const paymentMethods = await api.get<OnRampPaymentMethod[]>({
      path: '/service-providers/properties/payment-methods',
      headers,
      params: {
        categories: 'CRYPTO_ONRAMP',
        countries: state.selectedCountry?.countryCode
      }
    });
    state.paymentMethods = paymentMethods || [];
    state.selectedPaymentMethod =
      paymentMethods?.find(p => p.paymentMethod === 'CREDIT_DEBIT_CARD') ||
      paymentMethods?.[0] ||
      undefined;
  },

  async fetchCryptoCurrencies() {
    const cryptoCurrencies = await api.get<OnRampCryptoCurrency[]>({
      path: '/service-providers/properties/crypto-currencies',
      headers,
      params: {
        categories: 'CRYPTO_ONRAMP',
        countries: state.selectedCountry?.countryCode
      }
    });

    state.purchaseCurrencies = cryptoCurrencies || [];

    let selectedCurrency;
    if (NetworkController.state.caipNetwork?.id) {
      const defaultCurrency =
        ConstantsUtil.NETWORK_DEFAULT_CURRENCIES[
          NetworkController.state.caipNetwork
            ?.id as keyof typeof ConstantsUtil.NETWORK_DEFAULT_CURRENCIES
        ] || 'ETH';
      selectedCurrency = state.purchaseCurrencies?.find(c => c.currencyCode === defaultCurrency);
    }

    state.purchaseCurrency = selectedCurrency || cryptoCurrencies?.[0] || undefined;
  },

  async fetchFiatCurrencies() {
    let fiatCurrencies = await StorageUtil.getOnRampFiatCurrencies();
    let currencyCode = 'USD';
    const countryCode = state.selectedCountry?.countryCode;

    if (!fiatCurrencies.length) {
      fiatCurrencies =
        (await api.get<OnRampFiatCurrency[]>({
          path: '/service-providers/properties/fiat-currencies',
          headers,
          params: {
            categories: 'CRYPTO_ONRAMP'
          }
        })) ?? [];

      StorageUtil.setOnRampFiatCurrencies(fiatCurrencies);
    }

    state.paymentCurrencies = fiatCurrencies || [];

    if (countryCode) {
      currencyCode =
        ConstantsUtil.COUNTRY_CURRENCIES[
          countryCode as keyof typeof ConstantsUtil.COUNTRY_CURRENCIES
        ];
    }

    const defaultCurrency =
      fiatCurrencies?.find(c => c.currencyCode === currencyCode) ||
      fiatCurrencies?.[0] ||
      undefined;

    if (defaultCurrency) {
      this.setPaymentCurrency(defaultCurrency);
    }
  },

  async getQuotes() {
    state.quotesLoading = true;
    state.error = undefined;

    try {
      const body = {
        countryCode: state.selectedCountry?.countryCode,
        paymentMethodType: state.selectedPaymentMethod?.paymentMethod,
        destinationCurrencyCode: state.purchaseCurrency?.currencyCode,
        sourceAmount: state.paymentAmount?.toString() || '0',
        sourceCurrencyCode: state.paymentCurrency?.currencyCode
      };

      const response = await api.post<OnRampQuoteResponse>({
        path: '/payments/crypto/quote',
        headers,
        body
      });

      const quotes = response?.quotes.sort((a, b) => b.destinationAmount - a.destinationAmount);
      state.quotes = quotes;
      state.selectedQuote = quotes?.[0];
      state.selectedServiceProvider = state.serviceProviders.find(
        sp => sp.serviceProvider === quotes?.[0]?.serviceProvider
      );
      state.quotesLoading = false;
    } catch (error: any) {
      state.quotes = [];
      state.selectedQuote = undefined;
      state.selectedServiceProvider = undefined;
      state.error = error?.code || 'UNKNOWN_ERROR';
      state.quotesLoading = false;
      console.error(error);
    }
  },

  async fetchFiatLimits() {
    let limits = await StorageUtil.getOnRampFiatLimits();

    if (!limits.length) {
      limits =
        (await api.get<OnRampFiatLimit[]>({
          path: 'service-providers/limits/fiat-currency-purchases',
          headers,
          params: {
            categories: 'CRYPTO_ONRAMP'
          }
        })) ?? [];

      StorageUtil.setOnRampFiatLimits(limits);
    }

    state.paymentCurrenciesLimits = limits;
  },

  async generateWidget({ quote }: { quote: OnRampQuote }) {
    const metadata = OptionsController.state.metadata;

    const widget = await api.post<OnRampWidgetResponse>({
      path: '/crypto/session/widget',
      headers,
      body: {
        sessionData: {
          countryCode: quote?.countryCode,
          destinationCurrencyCode: quote?.destinationCurrencyCode,
          paymentMethodType: quote?.paymentMethodType,
          serviceProvider: quote?.serviceProvider,
          sourceAmount: quote?.sourceAmount,
          sourceCurrencyCode: quote?.sourceCurrencyCode,
          walletAddress: AccountController.state.address,
          redirectUrl: metadata?.redirect?.universal ?? `${metadata?.redirect?.native}/onramp`
        },
        sessionType: 'BUY'
      }
    });

    state.widgetUrl = widget?.widgetUrl;

    return widget;
  },

  clearError() {
    state.error = undefined;
  },

  async loadOnRampData() {
    await this.fetchCountries();
    await this.fetchServiceProviders();
    await this.fetchPaymentMethods();
    await this.fetchFiatLimits();
    await this.fetchCryptoCurrencies();
    await this.fetchFiatCurrencies();
  },

  resetState() {
    state.error = undefined;
    state.quotesLoading = false;
    state.quotes = [];
    state.selectedQuote = undefined;
    state.selectedServiceProvider = undefined;
    state.purchaseAmount = undefined;
    state.widgetUrl = undefined;

    if (state.paymentCurrency) {
      this.setDefaultPaymentAmount(state.paymentCurrency);
    }
  }
};
