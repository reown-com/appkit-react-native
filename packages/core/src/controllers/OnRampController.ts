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

// -- Helpers ------------------------------------------- //
const baseUrl = CoreHelperUtil.getMeldApiUrl();
const api = new FetchUtil({ baseUrl });
const headers = {
  'Authorization': `Basic ${CoreHelperUtil.getMeldToken()}`,
  'Content-Type': 'application/json'
};

// -- Types --------------------------------------------- //
export interface OnRampControllerState {
  countries: OnRampCountry[];
  serviceProviders: OnRampServiceProvider[];
  selectedCountry?: OnRampCountry;
  paymentMethods: OnRampPaymentMethod[];
  selectedPaymentMethod?: OnRampPaymentMethod;
  purchaseCurrency?: OnRampCryptoCurrency;
  paymentCurrency?: OnRampFiatCurrency;
  purchaseCurrencies?: OnRampCryptoCurrency[];
  paymentCurrencies?: OnRampFiatCurrency[];
  paymentCurrenciesLimits?: OnRampFiatLimit[];
  purchaseAmount?: number;
  paymentAmount?: number;
  error?: string;
  quotesLoading: boolean;
  quotes?: OnRampQuote[];
  selectedQuote?: OnRampQuote;
  selectedServiceProvider?: OnRampServiceProvider;
  widgetUrl?: string;
}

type StateKey = keyof OnRampControllerState;

const defaultState = {
  quotesLoading: false,
  countries: [],
  paymentMethods: [],
  serviceProviders: [],
  paymentAmount: 100
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

  async setSelectedCountry(country: OnRampCountry) {
    state.selectedCountry = country;
    await Promise.all([this.getAvailablePaymentMethods(), this.getAvailableCryptoCurrencies()]);
    // TODO: save to storage as preferred country
  },

  setSelectedPaymentMethod(paymentMethod: OnRampPaymentMethod) {
    state.selectedPaymentMethod = paymentMethod;

    // Reset quotes
    state.selectedQuote = undefined;
    state.quotes = [];
    // TODO: save to storage as preferred payment method
  },

  setPurchaseCurrency(currency: OnRampCryptoCurrency) {
    state.purchaseCurrency = currency;
    // TODO: save to storage as preferred purchase currency
  },

  setPaymentCurrency(currency: OnRampFiatCurrency) {
    state.paymentCurrency = currency;
    // TODO: save to storage as preferred payment currency
  },

  setPurchaseAmount(amount: number) {
    state.purchaseAmount = amount;
  },

  setPaymentAmount(amount: number | string) {
    state.paymentAmount = Number(amount);
  },

  setSelectedQuote(quote?: OnRampQuote) {
    state.selectedQuote = quote;
  },

  updateSelectedPurchaseCurrency() {
    //TODO: improve this. Change only if preferred currency is not setted
    let selectedCurrency;
    if (NetworkController.state.caipNetwork?.id === 'eip155:137') {
      selectedCurrency = state.purchaseCurrencies?.find(c => c.currencyCode === 'POL');
    } else {
      selectedCurrency = state.purchaseCurrencies?.find(c => c.currencyCode === 'ETH');
    }

    state.purchaseCurrency = selectedCurrency || state.purchaseCurrencies?.[0] || undefined;
  },

  getServiceProviderImage(serviceProvider: string) {
    const provider = state.serviceProviders.find(p => p.serviceProvider === serviceProvider);

    return provider?.logos?.lightShort;
  },

  async getAvailableCountries() {
    //TODO: Cache this for a week
    // const chainId = NetworkController.getApprovedCaipNetworks()?.[0]?.id;
    const countries = await api.get<OnRampCountry[]>({
      path: '/service-providers/properties/countries',
      headers,
      params: {
        categories: 'CRYPTO_ONRAMP'
        // cryptoChains: chainId //TODO: ask for chain name list
      }
    });
    state.countries = countries || [];
    //TODO: change this to the user's country
    state.selectedCountry =
      countries?.find(c => c.countryCode === 'US') || countries?.[0] || undefined;
  },

  async getAvailableServiceProviders() {
    const serviceProviders = await api.get<OnRampServiceProvider[]>({
      path: '/service-providers',
      headers,
      params: {
        categories: 'CRYPTO_ONRAMP'
      }
    });
    state.serviceProviders = serviceProviders || [];
  },

  async getAvailablePaymentMethods() {
    const paymentMethods = await api.get<OnRampPaymentMethod[]>({
      path: '/service-providers/properties/payment-methods',
      headers,
      params: {
        categories: 'CRYPTO_ONRAMP',
        countries: state.selectedCountry?.countryCode,
        includeServiceProviderDetails: 'true'
      }
    });
    state.paymentMethods = paymentMethods || [];
    state.selectedPaymentMethod =
      paymentMethods?.find(p => p.paymentMethod === 'CREDIT_DEBIT_CARD') ||
      paymentMethods?.[0] ||
      undefined;
  },

  async getAvailableCryptoCurrencies() {
    //TODO: Cache this for a week
    const cryptoCurrencies = await api.get<OnRampCryptoCurrency[]>({
      path: '/service-providers/properties/crypto-currencies',
      headers,
      params: {
        categories: 'CRYPTO_ONRAMP',
        countries: state.selectedCountry?.countryCode
      }
    });
    state.purchaseCurrencies = cryptoCurrencies || [];

    //TODO: remove this mock data
    let selectedCurrency;
    if (NetworkController.state.caipNetwork?.id === 'eip155:137') {
      selectedCurrency = cryptoCurrencies?.find(c => c.currencyCode === 'POL');
    } else {
      selectedCurrency = cryptoCurrencies?.find(c => c.currencyCode === 'ETH');
    }

    state.purchaseCurrency = selectedCurrency || cryptoCurrencies?.[0] || undefined;
  },

  async getAvailableFiatCurrencies() {
    //TODO: Cache this for a week
    const fiatCurrencies = await api.get<OnRampFiatCurrency[]>({
      path: '/service-providers/properties/fiat-currencies',
      headers,
      params: {
        categories: 'CRYPTO_ONRAMP',
        countries: state.selectedCountry?.countryCode
      }
    });
    state.paymentCurrencies = fiatCurrencies || [];
    state.paymentCurrency =
      fiatCurrencies?.find(c => c.currencyCode === 'USD') || fiatCurrencies?.[0] || undefined;
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
    }
  },

  async getFiatLimits() {
    //TODO: Check if this can be cached
    const limits = await api.get<OnRampFiatLimit[]>({
      path: 'service-providers/limits/fiat-currency-purchases',
      headers,
      params: {
        categories: 'CRYPTO_ONRAMP',
        countries: state.selectedCountry?.countryCode,
        paymentMethodTypes: state.selectedPaymentMethod?.paymentMethod
        // cryptoChains: NetworkController.getApprovedCaipNetworks()?.[0]?.id //TODO: ask for chain name list
      }
    });

    state.paymentCurrenciesLimits = limits;
  },

  async getWidget({ quote }: { quote: OnRampQuote }) {
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
    await this.getAvailableCountries();
    await this.getAvailableServiceProviders();
    await this.getAvailablePaymentMethods();
    await this.getAvailableCryptoCurrencies();
    await this.getAvailableFiatCurrencies();
    await this.getFiatLimits();
  },

  resetState() {
    state.error = undefined;
    state.quotesLoading = false;
    state.quotes = [];
    state.selectedQuote = undefined;
    state.selectedServiceProvider = undefined;
    state.purchaseAmount = undefined;
    state.paymentAmount = defaultState.paymentAmount;
    state.widgetUrl = undefined;
  }
};
