import {
  OnRampController,
  NetworkController,
  type OnRampCryptoCurrency,
  type OnRampFiatCurrency,
  type OnRampPaymentMethod,
  type OnRampCountry,
  type OnRampQuote
} from '@reown/appkit-core-react-native';
import { ITEM_HEIGHT as COUNTRY_ITEM_HEIGHT } from './components/Country';
import { ITEM_HEIGHT as PAYMENT_METHOD_ITEM_HEIGHT } from './components/PaymentMethod';
import { ITEM_HEIGHT as CURRENCY_ITEM_HEIGHT } from './components/Currency';
import { ITEM_HEIGHT as QUOTE_ITEM_HEIGHT } from './components/Quote';

// -------------------------- Types --------------------------
export type ModalType =
  | 'country'
  | 'paymentMethod'
  | 'paymentCurrency'
  | 'purchaseCurrency'
  | 'quotes';

export type OnRampError =
  | 'INVALID_AMOUNT_TOO_LOW'
  | 'INVALID_AMOUNT_TOO_HIGH'
  | 'INVALID_AMOUNT'
  | 'INCOMPATIBLE_REQUEST'
  | 'BAD_REQUEST'
  | 'TRANSACTION_FAILED_GETTING_CRYPTO_QUOTE_FROM_PROVIDER'
  | 'TRANSACTION_EXCEPTION';

// -------------------------- Constants --------------------------
const ERROR_MESSAGES: Record<OnRampError, string> = {
  INVALID_AMOUNT_TOO_LOW: 'Amount is too low',
  INVALID_AMOUNT_TOO_HIGH: 'Amount is too high',
  INVALID_AMOUNT: 'No options available. Please try a different amount',
  INCOMPATIBLE_REQUEST: 'No options available. Please try a different combination',
  BAD_REQUEST: 'No options available. Please try a different combination',
  TRANSACTION_FAILED_GETTING_CRYPTO_QUOTE_FROM_PROVIDER:
    'No options available. Please try a different combination',
  TRANSACTION_EXCEPTION: 'No options available. Please try a different combination'
};

const MODAL_TITLES: Record<ModalType, string> = {
  country: 'Select your country',
  paymentMethod: 'Payment method',
  paymentCurrency: 'Select a currency',
  purchaseCurrency: 'Select a token',
  quotes: ''
};

const ITEM_HEIGHTS: Record<ModalType, number> = {
  country: COUNTRY_ITEM_HEIGHT,
  paymentMethod: PAYMENT_METHOD_ITEM_HEIGHT,
  paymentCurrency: CURRENCY_ITEM_HEIGHT,
  purchaseCurrency: CURRENCY_ITEM_HEIGHT,
  quotes: QUOTE_ITEM_HEIGHT
};

const KEY_EXTRACTORS: Record<ModalType, (item: any) => string> = {
  country: (item: OnRampCountry) => item.countryCode,
  paymentMethod: (item: OnRampPaymentMethod) => `${item.name}-${item.paymentMethod}`,
  paymentCurrency: (item: OnRampFiatCurrency) => item.currencyCode,
  purchaseCurrency: (item: OnRampCryptoCurrency) => item.currencyCode,
  quotes: (item: OnRampQuote) => `${item.serviceProvider}-${item.paymentMethodType}`
};

// -------------------------- Utils --------------------------

export const getErrorMessage = (error?: string) => {
  if (!error) return undefined;

  return ERROR_MESSAGES[error as OnRampError] ?? 'Failed to load options. Please try again';
};

export const getModalTitle = (type?: ModalType) => {
  return type ? MODAL_TITLES[type] : undefined;
};

const searchFilter = (item: { name: string; currencyCode?: string }, searchValue: string) => {
  const search = searchValue.toLowerCase();

  return (
    item.name.toLowerCase().includes(search) ||
    (item.currencyCode?.toLowerCase().includes(search) ?? false)
  );
};

export const getModalItems = (type?: Exclude<ModalType, 'quotes'>, searchValue?: string) => {
  const items = {
    country: () => OnRampController.state.countries,
    paymentMethod: () => OnRampController.state.paymentMethods,
    paymentCurrency: () => OnRampController.state.paymentCurrencies,
    purchaseCurrency: () => {
      const networkId = NetworkController.state.caipNetwork?.id?.split(':')[1];

      return OnRampController.state.purchaseCurrencies?.filter(c => c.chainId === networkId);
    }
  };

  const result = items[type!]?.() || [];

  return searchValue
    ? result.filter((item: { name: string; currencyCode?: string }) =>
        searchFilter(item, searchValue)
      )
    : result;
};

export const getModalItemKey = (type: ModalType | undefined, index: number, item: any) => {
  return type ? KEY_EXTRACTORS[type](item) : index.toString();
};

export const onModalItemPress = async (item: any, type?: ModalType) => {
  if (!type) return;

  const onPress = {
    country: (country: OnRampCountry) => OnRampController.setSelectedCountry(country),
    paymentMethod: (paymentMethod: OnRampPaymentMethod) =>
      OnRampController.setSelectedPaymentMethod(paymentMethod),
    paymentCurrency: (paymentCurrency: OnRampFiatCurrency) =>
      OnRampController.setPaymentCurrency(paymentCurrency),
    purchaseCurrency: (purchaseCurrency: OnRampCryptoCurrency) =>
      OnRampController.setPurchaseCurrency(purchaseCurrency),
    quotes: (quote: OnRampQuote) => OnRampController.setSelectedQuote(quote)
  };

  await onPress[type](item);
};

export const getItemHeight = (type?: ModalType) => {
  return type ? ITEM_HEIGHTS[type] : 0;
};
