import { subscribeKey as subKey } from 'valtio/vanilla/utils';
import { proxy, subscribe as sub } from 'valtio/vanilla';
import type {
  OnRampPaymentMethod,
  OnRampCountry,
  OnRampFiatCurrency,
  OnRampQuote,
  OnRampFiatLimit,
  OnRampCryptoCurrency,
  OnRampServiceProvider,
  OnRampError,
  OnRampErrorTypeValues,
  OnRampCountryDefaults
} from '../utils/TypeUtil';

import { CoreHelperUtil } from '../utils/CoreHelperUtil';
import { NetworkController } from './NetworkController';
import { AccountController } from './AccountController';
import { OptionsController } from './OptionsController';
import { ConstantsUtil, OnRampErrorType } from '../utils/ConstantsUtil';
import { StorageUtil } from '../utils/StorageUtil';
import { SnackController } from './SnackController';
import { EventsController } from './EventsController';
import { BlockchainApiController } from './BlockchainApiController';

// -- Helpers ------------------------------------------- //

let quotesAbortController: AbortController | null = null;

// -- Utils --------------------------------------------- //

const mapErrorMessage = (errorCode: string): OnRampError => {
  const errorMap: Record<string, { type: OnRampErrorTypeValues; message: string }> = {
    [OnRampErrorType.AMOUNT_TOO_LOW]: {
      type: OnRampErrorType.AMOUNT_TOO_LOW,
      message: 'The amount is too low'
    },
    [OnRampErrorType.AMOUNT_TOO_HIGH]: {
      type: OnRampErrorType.AMOUNT_TOO_HIGH,
      message: 'The amount is too high'
    },
    [OnRampErrorType.INVALID_AMOUNT]: {
      type: OnRampErrorType.INVALID_AMOUNT,
      message: 'Enter a valid amount'
    },
    [OnRampErrorType.INCOMPATIBLE_REQUEST]: {
      type: OnRampErrorType.INCOMPATIBLE_REQUEST,
      message: 'Enter a valid amount'
    },
    [OnRampErrorType.BAD_REQUEST]: {
      type: OnRampErrorType.BAD_REQUEST,
      message: 'Enter a valid amount'
    }
  };

  return (
    errorMap[errorCode] || {
      type: OnRampErrorType.UNKNOWN,
      message: 'Something went wrong. Please try again'
    }
  );
};

// -- Types --------------------------------------------- //
export interface OnRampControllerState {
  countries: OnRampCountry[];
  countriesDefaults?: OnRampCountryDefaults[];
  selectedCountry?: OnRampCountry;
  serviceProviders: OnRampServiceProvider[];
  selectedServiceProvider?: OnRampServiceProvider;
  paymentMethods: OnRampPaymentMethod[];
  selectedPaymentMethod?: OnRampPaymentMethod;
  purchaseCurrency?: OnRampCryptoCurrency;
  purchaseCurrencies?: OnRampCryptoCurrency[];
  paymentAmount?: number;
  paymentCurrency?: OnRampFiatCurrency;
  paymentCurrencies?: OnRampFiatCurrency[];
  paymentCurrenciesLimits?: OnRampFiatLimit[];
  quotes?: OnRampQuote[];
  selectedQuote?: OnRampQuote;
  widgetUrl?: string;
  error?: OnRampError;
  initialLoading?: boolean;
  loading?: boolean;
  quotesLoading: boolean;
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

    if (updateCurrency) {
      const currencyCode =
        state.countriesDefaults?.find(d => d.countryCode === country.countryCode)
          ?.defaultCurrencyCode || 'USD';

      const currency = state.paymentCurrencies?.find(c => c.currencyCode === currencyCode);

      if (currency) {
        this.setPaymentCurrency(currency);
      }
    }

    await Promise.all([this.fetchPaymentMethods(), this.fetchCryptoCurrencies()]);
    this.clearQuotes();

    state.loading = false;

    StorageUtil.setOnRampPreferredCountry(country);
  },

  setSelectedPaymentMethod(paymentMethod: OnRampPaymentMethod) {
    state.selectedPaymentMethod = paymentMethod;
  },

  setPurchaseCurrency(currency: OnRampCryptoCurrency) {
    state.purchaseCurrency = currency;

    EventsController.sendEvent({
      type: 'track',
      event: 'SELECT_BUY_ASSET',
      properties: {
        asset: currency.currencyCode
      }
    });

    this.clearQuotes();
  },

  setPaymentCurrency(currency: OnRampFiatCurrency, updateAmount = true) {
    state.paymentCurrency = currency;

    StorageUtil.setOnRampPreferredFiatCurrency(currency);

    if (updateAmount) {
      state.paymentAmount = undefined;
    }

    this.clearQuotes();
    this.clearError();
  },

  setPaymentAmount(amount?: number | string) {
    state.paymentAmount = amount ? Number(amount) : undefined;
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
        ];
      selectedCurrency = state.purchaseCurrencies?.find(c => c.currencyCode === defaultCurrency);
    }

    state.purchaseCurrency = selectedCurrency ?? state.purchaseCurrencies?.[0] ?? undefined;
  },

  getServiceProviderImage(serviceProviderName?: string) {
    if (!serviceProviderName) return undefined;

    const provider = state.serviceProviders.find(p => p.serviceProvider === serviceProviderName);

    return provider?.logos?.lightShort;
  },

  getCurrencyLimit(currency: OnRampFiatCurrency) {
    return state.paymentCurrenciesLimits?.find(l => l.currencyCode === currency.currencyCode);
  },

  async fetchCountries() {
    try {
      let countries = await StorageUtil.getOnRampCountries();

      if (!countries.length) {
        countries = (await BlockchainApiController.fetchOnRampCountries()) ?? [];

        if (countries.length) {
          StorageUtil.setOnRampCountries(countries);
        }
      }

      state.countries = countries;

      const preferredCountry = await StorageUtil.getOnRampPreferredCountry();

      if (preferredCountry) {
        state.selectedCountry = preferredCountry;
      } else {
        const countryCode = CoreHelperUtil.getCountryFromTimezone();

        state.selectedCountry =
          countries.find(c => c.countryCode === countryCode) || countries[0] || undefined;
      }
    } catch (error) {
      state.error = {
        type: OnRampErrorType.FAILED_TO_LOAD_COUNTRIES,
        message: 'Failed to load countries'
      };
    }
  },

  async fetchCountriesDefaults() {
    try {
      let countriesDefaults = await StorageUtil.getOnRampCountriesDefaults();

      if (!countriesDefaults.length) {
        countriesDefaults = (await BlockchainApiController.fetchOnRampCountriesDefaults()) ?? [];

        if (countriesDefaults.length) {
          StorageUtil.setOnRampCountriesDefaults(countriesDefaults);
        }
      }

      state.countriesDefaults = countriesDefaults;
    } catch (error) {
      state.error = {
        type: OnRampErrorType.FAILED_TO_LOAD_COUNTRIES,
        message: 'Failed to load countries defaults'
      };
    }
  },

  async fetchServiceProviders() {
    try {
      let serviceProviders = await StorageUtil.getOnRampServiceProviders();

      if (!serviceProviders.length) {
        serviceProviders = (await BlockchainApiController.fetchOnRampServiceProviders()) ?? [];

        if (serviceProviders.length) {
          StorageUtil.setOnRampServiceProviders(serviceProviders);
        }
      }

      state.serviceProviders = serviceProviders || [];
    } catch (error) {
      state.error = {
        type: OnRampErrorType.FAILED_TO_LOAD_PROVIDERS,
        message: 'Failed to load service providers'
      };
    }
  },

  async fetchPaymentMethods() {
    try {
      const paymentMethods = await BlockchainApiController.fetchOnRampPaymentMethods({
        countries: state.selectedCountry?.countryCode
      });

      const defaultCountryPaymentMethods =
        state.countriesDefaults?.find(d => d.countryCode === state.selectedCountry?.countryCode)
          ?.defaultPaymentMethods || [];

      state.paymentMethods =
        paymentMethods?.sort((a, b) => {
          const aIndex = defaultCountryPaymentMethods?.indexOf(a.paymentMethod);
          const bIndex = defaultCountryPaymentMethods?.indexOf(b.paymentMethod);

          if (aIndex === -1 && bIndex === -1) return 0;
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;

          return aIndex - bIndex;
        }) || [];

      state.selectedPaymentMethod = state.paymentMethods[0];
    } catch (error) {
      state.error = {
        type: OnRampErrorType.FAILED_TO_LOAD_METHODS,
        message: 'Failed to load payment methods'
      };
      state.paymentMethods = [];
      state.selectedPaymentMethod = undefined;
    }
  },

  async fetchCryptoCurrencies() {
    try {
      const cryptoCurrencies = await BlockchainApiController.fetchOnRampCryptoCurrencies({
        countries: state.selectedCountry?.countryCode
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
    } catch (error) {
      state.error = {
        type: OnRampErrorType.FAILED_TO_LOAD_CURRENCIES,
        message: 'Failed to load crypto currencies'
      };
      state.purchaseCurrencies = [];
      state.purchaseCurrency = undefined;
    }
  },

  async fetchFiatCurrencies() {
    try {
      let fiatCurrencies = await StorageUtil.getOnRampFiatCurrencies();
      let currencyCode = 'USD';
      const countryCode = state.selectedCountry?.countryCode;

      if (!fiatCurrencies.length) {
        fiatCurrencies = (await BlockchainApiController.fetchOnRampFiatCurrencies()) ?? [];

        if (fiatCurrencies.length) {
          StorageUtil.setOnRampFiatCurrencies(fiatCurrencies);
        }
      }

      state.paymentCurrencies = fiatCurrencies || [];

      if (countryCode) {
        currencyCode =
          state.countriesDefaults?.find(d => d.countryCode === countryCode)?.defaultCurrencyCode ||
          'USD';
      }

      const preferredCurrency = await StorageUtil.getOnRampPreferredFiatCurrency();

      const defaultCurrency =
        preferredCurrency ||
        fiatCurrencies?.find(c => c.currencyCode === currencyCode) ||
        fiatCurrencies?.[0] ||
        undefined;

      if (defaultCurrency) {
        this.setPaymentCurrency(defaultCurrency);
      }
    } catch (error) {
      state.error = {
        type: OnRampErrorType.FAILED_TO_LOAD_CURRENCIES,
        message: 'Failed to load fiat currencies'
      };
      state.paymentCurrencies = [];
      state.paymentCurrency = undefined;
    }
  },

  abortGetQuotes(clearState = true) {
    if (quotesAbortController) {
      quotesAbortController.abort();
      quotesAbortController = null;
    }

    if (clearState) {
      this.clearQuotes();
      state.quotesLoading = false;
      state.error = undefined;
    }
  },

  getQuotesDebounced: CoreHelperUtil.debounce(function () {
    OnRampController.getQuotes();
  }, 500),

  async getQuotes() {
    if (!state.paymentAmount || state.paymentAmount <= 0) {
      this.clearQuotes();

      return;
    }

    state.quotesLoading = true;
    state.selectedQuote = undefined;
    state.selectedServiceProvider = undefined;
    state.error = undefined;

    this.abortGetQuotes(false);
    quotesAbortController = new AbortController();
    const currentSignal = quotesAbortController.signal;

    try {
      const body = {
        countryCode: state.selectedCountry?.countryCode!,
        destinationCurrencyCode: state.purchaseCurrency?.currencyCode!,
        sourceAmount: state.paymentAmount,
        sourceCurrencyCode: state.paymentCurrency?.currencyCode!,
        walletAddress: AccountController.state.address!,
        excludeProviders: ['BINANCECONNECT', 'COINBASEPAY']
      };

      const response = await BlockchainApiController.getOnRampQuotes(body, currentSignal);

      if (!response || !response.length) {
        throw new Error('No quotes available');
      }

      const quotes = response.sort((a, b) => b.customerScore - a.customerScore);

      state.quotes = quotes;

      //Replace payment method if it's not in the quotes
      const isValidPaymentMethod =
        state.selectedPaymentMethod &&
        quotes.some(
          quote => quote.paymentMethodType === state.selectedPaymentMethod?.paymentMethod
        );

      if (!isValidPaymentMethod) {
        const countryMethods =
          state.countriesDefaults?.find(d => d.countryCode === state.selectedCountry?.countryCode)
            ?.defaultPaymentMethods || [];

        const availableQuoteMethods = new Set(quotes.map(q => q.paymentMethodType));

        let newPaymentMethodType: string | undefined;
        for (const dpm of countryMethods) {
          if (availableQuoteMethods.has(dpm)) {
            newPaymentMethodType = dpm;
            break;
          }
        }

        if (newPaymentMethodType) {
          state.selectedPaymentMethod =
            state.paymentMethods.find(m => m.paymentMethod === newPaymentMethodType) ||
            state.paymentMethods.find(
              method => method.paymentMethod === quotes[0]?.paymentMethodType
            );
        } else {
          state.selectedPaymentMethod = state.paymentMethods.find(
            method => method.paymentMethod === quotes[0]?.paymentMethodType
          );
        }
      }

      state.selectedQuote = quotes.find(
        quote => quote.paymentMethodType === state.selectedPaymentMethod?.paymentMethod
      );

      state.selectedServiceProvider = state.serviceProviders.find(
        sp => sp.serviceProvider === state.selectedQuote?.serviceProvider
      );
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Do nothing, another request was made
        return;
      }

      EventsController.sendEvent({
        type: 'track',
        event: 'BUY_FAIL',
        properties: {
          message: error?.message ?? error?.code ?? 'Error getting quotes'
        }
      });

      this.clearQuotes();
      state.error = mapErrorMessage(error?.code || 'UNKNOWN_ERROR');
    } finally {
      if (!currentSignal.aborted) {
        state.quotesLoading = false;
      }
    }
  },

  canGenerateQuote(): boolean {
    return !!(
      state.selectedCountry?.countryCode &&
      state.selectedPaymentMethod?.paymentMethod &&
      state.purchaseCurrency?.currencyCode &&
      state.paymentAmount &&
      state.paymentAmount > 0 &&
      state.paymentCurrency?.currencyCode &&
      state.selectedCountry &&
      !state.loading &&
      AccountController.state.address
    );
  },

  async fetchFiatLimits() {
    try {
      let limits = await StorageUtil.getOnRampFiatLimits();

      if (!limits.length) {
        limits = (await BlockchainApiController.fetchOnRampFiatLimits()) ?? [];

        if (limits.length) {
          StorageUtil.setOnRampFiatLimits(limits);
        }
      }

      state.paymentCurrenciesLimits = limits;
    } catch (error) {
      state.error = {
        type: OnRampErrorType.FAILED_TO_LOAD_LIMITS,
        message: 'Failed to load fiat limits'
      };
      state.paymentCurrenciesLimits = [];
    }
  },

  async generateWidget({ quote }: { quote: OnRampQuote }) {
    const metadata = OptionsController.state.metadata;
    const eventProperties = {
      asset: quote.destinationCurrencyCode,
      network: state.purchaseCurrency?.chainName ?? '',
      amount: quote.destinationAmount.toString(),
      currency: quote.destinationCurrencyCode,
      paymentMethod: quote.paymentMethodType,
      provider: 'MELD',
      serviceProvider: quote.serviceProvider
    };

    try {
      if (!quote) {
        throw new Error('Invalid quote');
      }

      const body = {
        countryCode: quote.countryCode,
        destinationCurrencyCode: quote.destinationCurrencyCode,
        paymentMethodType: quote.paymentMethodType,
        serviceProvider: quote.serviceProvider,
        sourceAmount: quote.sourceAmount,
        sourceCurrencyCode: quote.sourceCurrencyCode,
        walletAddress: AccountController.state.address!,
        redirectUrl: metadata?.redirect?.universal ?? metadata?.redirect?.native
      };

      const widget = await BlockchainApiController.getOnRampWidget(body);

      if (!widget || !widget.widgetUrl) {
        throw new Error('Invalid widget response');
      }

      EventsController.sendEvent({
        type: 'track',
        event: 'BUY_SUBMITTED',
        properties: eventProperties
      });

      state.widgetUrl = widget.widgetUrl;

      return widget;
    } catch (e: any) {
      EventsController.sendEvent({
        type: 'track',
        event: 'BUY_FAIL',
        properties: {
          ...eventProperties,
          message: e?.message ?? e?.code ?? 'Error generating widget url'
        }
      });

      state.error = mapErrorMessage(e?.code || 'UNKNOWN_ERROR');
      SnackController.showInternalError({
        shortMessage: 'Error creating purchase URL',
        longMessage: e?.message ?? e?.code
      });

      return undefined;
    }
  },

  clearError() {
    state.error = undefined;
  },

  clearQuotes() {
    state.quotes = [];
    state.selectedQuote = undefined;
    state.selectedServiceProvider = undefined;
  },

  async loadOnRampData() {
    state.initialLoading = true;
    state.error = undefined;

    try {
      await this.fetchCountries();
      await this.fetchServiceProviders();

      await Promise.all([
        this.fetchCountriesDefaults(),
        this.fetchPaymentMethods(),
        this.fetchFiatLimits(),
        this.fetchCryptoCurrencies(),
        this.fetchFiatCurrencies()
      ]);
    } catch (error) {
      if (!state.error) {
        state.error = {
          type: OnRampErrorType.FAILED_TO_LOAD,
          message: 'Failed to load onramp data'
        };
      }
    } finally {
      state.initialLoading = false;
    }
  },

  resetState() {
    state.error = undefined;
    state.quotesLoading = false;
    state.quotes = [];
    state.selectedQuote = undefined;
    state.selectedServiceProvider = undefined;
    state.widgetUrl = undefined;
    state.paymentAmount = undefined;
    this.updateSelectedPurchaseCurrency();
  }
};
