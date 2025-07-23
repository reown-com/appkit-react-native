import {
  OnRampController,
  NetworkController,
  CoreHelperUtil
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
          item.currencyCode.toLowerCase()?.split('_')?.[0]?.includes(searchValue)
      )
    : networkTokens;
};

export const getQuotesDebounced = CoreHelperUtil.debounce(function () {
  OnRampController.getQuotes();
}, 500);
