import {
  OnRampController,
  ConnectionsController,
  CoreHelperUtil
} from '@reown/appkit-core-react-native';

// -------------------------- Utils --------------------------
export const getPurchaseCurrencies = (searchValue?: string, filterSelected?: boolean) => {
  const networkId = getNetworkId();

  if (!networkId) {
    return [];
  }

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

export const getNetworkId = (): string | undefined => {
  const [namespace, chainId] =
    ConnectionsController.state.activeNetwork?.caipNetworkId?.split(':') ?? [];

  if (!namespace || !chainId) {
    return undefined;
  }

  if (namespace === 'solana') {
    return '101'; // Solana mainnet on Meld
  }

  if (namespace === 'bip122') {
    return `${namespace}:${chainId}`; // Bitcoin mainnet
  }

  return chainId;
};
