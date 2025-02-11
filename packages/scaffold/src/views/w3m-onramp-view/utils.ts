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

export const getErrorMessage = (error?: string) => {
  if (!error) {
    return undefined;
  }

  if (error === 'INVALID_AMOUNT_TOO_LOW') {
    return 'Amount is too low';
  }

  if (error === 'INVALID_AMOUNT_TOO_HIGH') {
    return 'Amount is too high';
  }

  if (error === 'INVALID_AMOUNT') {
    return 'No options available. Please try a different amount';
  }

  if (
    error === 'INCOMPATIBLE_REQUEST' ||
    error === 'BAD_REQUEST' ||
    error === 'TRANSACTION_FAILED_GETTING_CRYPTO_QUOTE_FROM_PROVIDER' ||
    error === 'TRANSACTION_EXCEPTION'
  ) {
    return 'No options available. Please try a different combination';
  }

  //TODO: check other errors
  return 'Failed to load options. Please try again';
};

export const getModalTitle = (
  type?: 'country' | 'paymentMethod' | 'paymentCurrency' | 'purchaseCurrency' | 'quotes'
) => {
  if (type === 'country') {
    return 'Select your country';
  }
  if (type === 'paymentMethod') {
    return 'Payment method';
  }
  if (type === 'paymentCurrency') {
    return 'Select a currency';
  }
  if (type === 'purchaseCurrency') {
    return 'Select a token';
  }
  if (type === 'quotes') {
    return 'Select a provider';
  }

  return undefined;
};

export const getModalItems = (
  type?: 'country' | 'paymentMethod' | 'paymentCurrency' | 'purchaseCurrency',
  searchValue?: string
) => {
  if (type === 'country') {
    if (searchValue) {
      return (
        OnRampController.state.countries?.filter(
          country =>
            country.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            country.countryCode.toLowerCase().includes(searchValue.toLowerCase())
        ) || []
      );
    }

    return OnRampController.state.countries || [];
  }
  if (type === 'paymentMethod') {
    if (searchValue) {
      return (
        OnRampController.state.paymentMethods?.filter(paymentMethod =>
          paymentMethod.name.toLowerCase().includes(searchValue.toLowerCase())
        ) || []
      );
    }

    return OnRampController.state.paymentMethods || [];
  }
  if (type === 'paymentCurrency') {
    if (searchValue) {
      return (
        OnRampController.state.paymentCurrencies?.filter(
          paymentCurrency =>
            paymentCurrency.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            paymentCurrency.currencyCode.toLowerCase().includes(searchValue.toLowerCase())
        ) || []
      );
    }

    return OnRampController.state.paymentCurrencies || [];
  }
  if (type === 'purchaseCurrency') {
    const networkId = NetworkController.state.caipNetwork?.id?.split(':')[1];
    let filteredCurrencies =
      OnRampController.state.purchaseCurrencies?.filter(c => c.chainId === networkId) || [];

    if (searchValue) {
      return filteredCurrencies.filter(
        currency =>
          currency.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          currency.currencyCode.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    return filteredCurrencies;
  }

  return [];
};

export const getModalItemKey = (
  type: 'country' | 'paymentMethod' | 'paymentCurrency' | 'purchaseCurrency' | 'quote' | undefined,
  index: number,
  item: any
) => {
  if (type === 'country') {
    return (item as OnRampCountry).countryCode;
  }
  if (type === 'paymentMethod') {
    const paymentMethod = item as OnRampPaymentMethod;

    return `${paymentMethod.name}-${paymentMethod.paymentMethod}`;
  }
  if (type === 'paymentCurrency') {
    return (item as OnRampFiatCurrency).currencyCode;
  }
  if (type === 'purchaseCurrency') {
    return (item as OnRampCryptoCurrency).currencyCode;
  }
  if (type === 'quote') {
    const quote = item as OnRampQuote;

    return `${quote.serviceProvider}-${quote.paymentMethodType}`;
  }

  return index.toString();
};

export const onModalItemPress = async (
  item: any,
  type?: 'country' | 'paymentMethod' | 'paymentCurrency' | 'purchaseCurrency'
) => {
  if (type === 'country') {
    await OnRampController.setSelectedCountry(item as OnRampCountry);
  }
  if (type === 'paymentMethod') {
    OnRampController.setSelectedPaymentMethod(item as OnRampPaymentMethod);
  }
  if (type === 'paymentCurrency') {
    OnRampController.setPaymentCurrency(item as OnRampFiatCurrency);
  }
  if (type === 'purchaseCurrency') {
    OnRampController.setPurchaseCurrency(item as OnRampCryptoCurrency);
  }
};

export const getItemHeight = (
  type: 'country' | 'paymentMethod' | 'paymentCurrency' | 'purchaseCurrency'
) => {
  if (type === 'country') {
    return COUNTRY_ITEM_HEIGHT;
  }
  if (type === 'paymentMethod') {
    return PAYMENT_METHOD_ITEM_HEIGHT;
  }
  if (type === 'paymentCurrency') {
    return CURRENCY_ITEM_HEIGHT;
  }
  if (type === 'purchaseCurrency') {
    return CURRENCY_ITEM_HEIGHT;
  }

  return 0;
};
