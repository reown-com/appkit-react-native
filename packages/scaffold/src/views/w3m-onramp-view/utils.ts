import {
  OnRampController,
  NetworkController,
  type OnRampFiatCurrency
} from '@reown/appkit-core-react-native';
import { NumberUtil } from '@reown/appkit-common-react-native';

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
  INVALID_AMOUNT: 'No options available. Please try a different amount',
  INCOMPATIBLE_REQUEST: 'No options available. Please try a different combination',
  BAD_REQUEST: 'No options available. Please try a different combination',
  TRANSACTION_FAILED_GETTING_CRYPTO_QUOTE_FROM_PROVIDER:
    'No options available. Please try a different combination',
  TRANSACTION_EXCEPTION: 'No options available. Please try a different combination'
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

  return ERROR_MESSAGES[error as OnRampError] ?? 'No options available';
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
  const values = [];

  if (limit?.minimumAmount) {
    values.push(NumberUtil.nextMultipleOfTen(limit.minimumAmount) * 2);
  }

  if (limit?.defaultAmount) {
    const value = NumberUtil.nextMultipleOfTen(limit.defaultAmount);
    values.push(value);

    // If we have a maximum and room to add another value, add double the default
    if (limit?.maximumAmount) {
      const doubleDefault = value * 2;
      if (doubleDefault < limit.maximumAmount) {
        values.push(NumberUtil.nextMultipleOfTen(doubleDefault));
      }
    }
  }

  // If we don't have enough values, generate them based on what we have
  if (values.length < 3) {
    const sortedValues = [...new Set(values)].sort((a, b) => a - b);
    const result = [...sortedValues];

    if (sortedValues.length > 0) {
      while (result.length < 3) {
        const lastValue = result[result.length - 1];
        if (!lastValue) break; // Safety check for undefined

        const nextValue = lastValue * 2;

        // Check if we can add this value (respect maximum if it exists)
        if (!limit?.maximumAmount || nextValue < limit.maximumAmount) {
          result.push(NumberUtil.nextMultipleOfTen(nextValue));
        } else {
          // If we can't double the last value, try adding intermediate values
          const availableGap = result.length === 1;
          if (availableGap && sortedValues[0]) {
            const middleValue = NumberUtil.nextMultipleOfTen((lastValue + sortedValues[0]) / 2);
            if (middleValue !== sortedValues[0] && middleValue !== lastValue) {
              result.splice(1, 0, middleValue);
              continue;
            }
          }
          break;
        }
      }
    }

    return result;
  }

  // Remove duplicates and sort
  return [...new Set(values)].sort((a, b) => a - b);
};
