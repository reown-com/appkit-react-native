import {
  OnRampController,
  NetworkController,
  type OnRampFiatCurrency
} from '@reown/appkit-core-react-native';

// -------------------------- Types --------------------------
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
  INVALID_AMOUNT: 'No quotes found. Change amount',
  INCOMPATIBLE_REQUEST: 'No quotes found. Change amount or payment method',
  BAD_REQUEST: 'No quotes found. Change amount or payment method',
  TRANSACTION_FAILED_GETTING_CRYPTO_QUOTE_FROM_PROVIDER:
    'No quotes found. Change amount or payment method',
  TRANSACTION_EXCEPTION: 'No quotes found. Change amount or payment method'
};

// -------------------------- Utils --------------------------
export const isAmountError = (error?: string) => {
  return (
    error === 'INVALID_AMOUNT_TOO_LOW' ||
    error === 'INVALID_AMOUNT_TOO_HIGH' ||
    error === 'INVALID_AMOUNT'
  );
};

export const getErrorMessage = (error?: string) => {
  if (!error) return undefined;

  return ERROR_MESSAGES[error as OnRampError] ?? 'No quotes found. Change amount or payment method';
};

export const getPurchaseCurrencies = (searchValue?: string, filterSelected?: boolean) => {
  const networkId = NetworkController.state.caipNetwork?.id?.split(':')[1];
  let networkTokens =
    OnRampController.state.purchaseCurrencies?.filter(c => c.chainId === networkId) ?? [];

  if (filterSelected) {
    networkTokens = networkTokens?.filter(
      c => c.currencyCode !== OnRampController.state.purchaseCurrency?.currencyCode
    );
  }

  return searchValue
    ? networkTokens.filter(
        item =>
          item.name.toLowerCase().includes(searchValue) ||
          item.currencyCode.toLowerCase().includes(searchValue)
      )
    : networkTokens;
};

export const getCurrencySuggestedValues = (currency?: OnRampFiatCurrency) => {
  if (!currency) return [];

  const limit = OnRampController.getCurrencyLimit(currency);
  if (!limit) return [];

  let minAmount = limit?.minimumAmount ?? 0;

  if (minAmount < 10) minAmount = 10;

  // Find the nearest power of 10 above the minimum amount
  const magnitude = Math.pow(10, Math.floor(Math.log10(minAmount)));

  // Calculate suggested values based on the magnitude
  return [
    Math.ceil(minAmount / magnitude) * magnitude * 2,
    Math.ceil(minAmount / magnitude) * magnitude * 3,
    Math.ceil(minAmount / magnitude) * magnitude * 4
  ].map(Math.round);
};
