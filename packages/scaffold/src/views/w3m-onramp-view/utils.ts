import {
  OnRampController,
  NetworkController,
  type OnRampFiatCurrency
} from '@reown/appkit-core-react-native';

// -------------------------- Utils --------------------------
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
