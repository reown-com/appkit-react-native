import { proxy } from 'valtio';

import { CoreHelperUtil } from '../utils/CoreHelperUtil';
import { FetchUtil } from '../utils/FetchUtil';
import type {
  BlockchainApiBalanceResponse,
  BlockchainApiGasPriceRequest,
  BlockchainApiGasPriceResponse,
  BlockchainApiGenerateApproveCalldataRequest,
  BlockchainApiGenerateApproveCalldataResponse,
  BlockchainApiGenerateSwapCalldataRequest,
  BlockchainApiGenerateSwapCalldataResponse,
  BlockchainApiIdentityRequest,
  BlockchainApiIdentityResponse,
  BlockchainApiLookupEnsName,
  BlockchainApiSwapAllowanceRequest,
  BlockchainApiSwapAllowanceResponse,
  BlockchainApiSwapQuoteRequest,
  BlockchainApiSwapQuoteResponse,
  BlockchainApiSwapTokensRequest,
  BlockchainApiSwapTokensResponse,
  BlockchainApiOnRampWidgetResponse,
  BlockchainApiTokenPriceRequest,
  BlockchainApiTokenPriceResponse,
  BlockchainApiTransactionsRequest,
  BlockchainApiTransactionsResponse,
  OnRampCountry,
  OnRampServiceProvider,
  OnRampPaymentMethod,
  OnRampCryptoCurrency,
  OnRampFiatCurrency,
  OnRampQuote,
  BlockchainApiOnRampWidgetRequest,
  BlockchainApiOnRampQuotesRequest,
  OnRampFiatLimit
} from '../utils/TypeUtil';
import { OptionsController } from './OptionsController';
import { ConstantsUtil } from '../utils/ConstantsUtil';
import { ApiUtil } from '../utils/ApiUtil';
import type { CaipAddress, CaipNetworkId } from '@reown/appkit-common-react-native';
import { ConnectionsController } from './ConnectionsController';
import { SnackController } from './SnackController';

// -- Helpers ------------------------------------------- //
const baseUrl = CoreHelperUtil.getBlockchainApiUrl();

const getHeaders = () => {
  const { sdkType, sdkVersion } = OptionsController.state;

  return {
    'Content-Type': 'application/json',
    'x-sdk-type': sdkType,
    'x-sdk-version': sdkVersion,
    'User-Agent': ApiUtil.getUserAgent(),
    'origin': ApiUtil.getOrigin()
  };
};

// -- Types --------------------------------------------- //
export interface BlockchainApiControllerState {
  clientId: string | null;
  api: FetchUtil;
  supportedChains: { http: CaipNetworkId[]; ws: CaipNetworkId[] };
}

// -- State --------------------------------------------- //
const state = proxy<BlockchainApiControllerState>({
  clientId: null,
  api: new FetchUtil({ baseUrl }),
  supportedChains: { http: [], ws: [] }
});

// -- Controller ---------------------------------------- //
export const BlockchainApiController = {
  state,

  async isNetworkSupported(networkId?: CaipNetworkId) {
    if (!networkId) {
      return false;
    }
    try {
      if (!state.supportedChains.http.length) {
        await BlockchainApiController.getSupportedNetworks();
      }
    } catch (e) {
      return false;
    }

    return state.supportedChains.http.includes(networkId);
  },

  async getSupportedNetworks() {
    const supportedChains = await state.api.get<BlockchainApiControllerState['supportedChains']>({
      path: 'v1/supported-chains'
    });

    state.supportedChains = supportedChains!;

    return supportedChains;
  },

  async fetchIdentity({ address }: BlockchainApiIdentityRequest) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ConnectionsController.state.activeCaipNetworkId
    );

    if (!isSupported) {
      return { avatar: '', name: '' };
    }

    return state.api.get<BlockchainApiIdentityResponse>({
      path: `/v1/identity/${address}`,
      params: {
        projectId: OptionsController.state.projectId
      },
      headers: getHeaders()
    });
  },

  async fetchTransactions({
    account,
    projectId,
    cursor,
    onramp,
    signal,
    cache,
    chainId
  }: BlockchainApiTransactionsRequest) {
    const _chainId = chainId ?? ConnectionsController.state.activeCaipNetworkId;
    const isSupported = await BlockchainApiController.isNetworkSupported(_chainId);

    if (!isSupported) {
      return { data: [], next: undefined };
    }

    const response = await state.api.get<BlockchainApiTransactionsResponse>({
      path: `/v1/account/${account}/history`,
      headers: getHeaders(),
      params: {
        projectId,
        cursor,
        onramp,
        chainId: _chainId
      },
      signal,
      cache
    });

    return response;
  },

  async fetchTokenPrice({ projectId, addresses }: BlockchainApiTokenPriceRequest) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ConnectionsController.state.activeCaipNetworkId
    );

    if (!isSupported) {
      return { fungibles: [] };
    }

    const response = await state.api.post<BlockchainApiTokenPriceResponse>({
      path: '/v1/fungible/price',
      body: {
        projectId,
        currency: 'usd',
        addresses
      },
      headers: getHeaders()
    });

    return response;
  },

  async fetchSwapAllowance({
    projectId,
    tokenAddress,
    userAddress
  }: BlockchainApiSwapAllowanceRequest) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ConnectionsController.state.activeCaipNetworkId
    );

    if (!isSupported) {
      return { allowance: '0' };
    }

    return state.api.get<BlockchainApiSwapAllowanceResponse>({
      path: `/v1/convert/allowance`,
      params: {
        projectId,
        tokenAddress,
        userAddress
      },
      headers: getHeaders()
    });
  },

  async fetchGasPrice({ projectId, chainId }: BlockchainApiGasPriceRequest) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ConnectionsController.state.activeCaipNetworkId
    );

    if (!isSupported) {
      throw new Error('Network not supported for Gas Price');
    }

    return state.api.get<BlockchainApiGasPriceResponse>({
      path: `/v1/convert/gas-price`,
      headers: getHeaders(),
      params: {
        projectId,
        chainId
      }
    });
  },

  async fetchSwapQuote({
    projectId,
    amount,
    userAddress,
    from,
    to,
    gasPrice
  }: BlockchainApiSwapQuoteRequest) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ConnectionsController.state.activeCaipNetworkId
    );

    if (!isSupported) {
      return { quotes: [] };
    }

    return state.api.get<BlockchainApiSwapQuoteResponse>({
      path: `/v1/convert/quotes`,
      headers: getHeaders(),
      params: {
        projectId,
        amount,
        userAddress,
        from,
        to,
        gasPrice
      }
    });
  },

  async fetchSwapTokens({ projectId, chainId }: BlockchainApiSwapTokensRequest) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ConnectionsController.state.activeCaipNetworkId
    );

    if (!isSupported) {
      return { tokens: [] };
    }

    return state.api.get<BlockchainApiSwapTokensResponse>({
      path: `/v1/convert/tokens`,
      headers: getHeaders(),
      params: {
        projectId,
        chainId
      }
    });
  },

  async generateSwapCalldata({
    amount,
    from,
    projectId,
    to,
    userAddress
  }: BlockchainApiGenerateSwapCalldataRequest) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ConnectionsController.state.activeCaipNetworkId
    );

    if (!isSupported) {
      throw new Error('Network not supported for Swaps');
    }

    return state.api.post<BlockchainApiGenerateSwapCalldataResponse>({
      path: '/v1/convert/build-transaction',
      headers: getHeaders(),
      body: {
        amount,
        eip155: {
          slippage: ConstantsUtil.CONVERT_SLIPPAGE_TOLERANCE
        },
        from,
        projectId,
        to,
        userAddress
      }
    });
  },

  async generateApproveCalldata({
    from,
    projectId,
    to,
    userAddress
  }: BlockchainApiGenerateApproveCalldataRequest) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ConnectionsController.state.activeCaipNetworkId
    );

    if (!isSupported) {
      throw new Error('Network not supported for Swaps');
    }

    return state.api.get<BlockchainApiGenerateApproveCalldataResponse>({
      path: `/v1/convert/build-approve`,
      headers: getHeaders(),
      params: {
        projectId,
        userAddress,
        from,
        to
      }
    });
  },

  async getBalance(address?: CaipAddress, forceUpdate?: CaipAddress[]) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ConnectionsController.state.activeCaipNetworkId
    );
    if (!isSupported) {
      SnackController.showError('Token Balance Unavailable');

      return { balances: [] };
    }

    const [namespace, chain, plainAddress] = address?.split(':') ?? [];

    if (!namespace || !chain || !plainAddress) {
      throw new Error('Invalid address');
    }

    return state.api.get<BlockchainApiBalanceResponse>({
      path: `/v1/account/${plainAddress}/balance`,
      headers: getHeaders(),
      params: {
        currency: 'usd',
        projectId: OptionsController.state.projectId,
        chainId: `${namespace}:${chain}`,
        forceUpdate: forceUpdate?.join(',')
      }
    });
  },

  async lookupEnsName(name: string) {
    return state.api.get<BlockchainApiLookupEnsName>({
      path: `/v1/profile/account/${name}`,
      headers: getHeaders(),
      params: {
        projectId: OptionsController.state.projectId,
        apiVersion: '2'
      }
    });
  },

  async fetchOnRampCountries() {
    return await state.api.get<OnRampCountry[]>({
      path: '/v1/onramp/providers/properties',
      headers: getHeaders(),
      params: {
        projectId: OptionsController.state.projectId,
        type: 'countries'
      }
    });
  },

  async fetchOnRampServiceProviders() {
    return await state.api.get<OnRampServiceProvider[]>({
      path: '/v1/onramp/providers',
      headers: getHeaders(),
      params: {
        projectId: OptionsController.state.projectId
      }
    });
  },

  async fetchOnRampPaymentMethods(params: { countries?: string }) {
    return await state.api.get<OnRampPaymentMethod[]>({
      path: '/v1/onramp/providers/properties',
      headers: getHeaders(),
      params: {
        projectId: OptionsController.state.projectId,
        type: 'payment-methods',
        ...params
      }
    });
  },

  async fetchOnRampCryptoCurrencies(params: { countries?: string }) {
    return await state.api.get<OnRampCryptoCurrency[]>({
      path: '/v1/onramp/providers/properties',
      headers: getHeaders(),
      params: {
        projectId: OptionsController.state.projectId,
        type: 'crypto-currencies',
        ...params
      }
    });
  },

  async fetchOnRampFiatCurrencies() {
    return await state.api.get<OnRampFiatCurrency[]>({
      path: '/v1/onramp/providers/properties',
      headers: getHeaders(),
      params: {
        projectId: OptionsController.state.projectId,
        type: 'fiat-currencies'
      }
    });
  },

  async fetchOnRampFiatLimits() {
    return await state.api.get<OnRampFiatLimit[]>({
      path: '/v1/onramp/providers/properties',
      headers: getHeaders(),
      params: {
        projectId: OptionsController.state.projectId,
        type: 'fiat-purchases-limits'
      }
    });
  },

  async getOnRampQuotes(body: BlockchainApiOnRampQuotesRequest, signal?: AbortSignal) {
    return await state.api.post<OnRampQuote[]>({
      path: '/v1/onramp/multi/quotes',
      headers: getHeaders(),
      body: {
        projectId: OptionsController.state.projectId,
        ...body
      },
      signal
    });
  },

  async getOnRampWidget(body: BlockchainApiOnRampWidgetRequest, signal?: AbortSignal) {
    return await state.api.post<BlockchainApiOnRampWidgetResponse>({
      path: '/v1/onramp/widget',
      headers: getHeaders(),
      body: {
        projectId: OptionsController.state.projectId,
        sessionData: {
          ...body
        }
      },
      signal
    });
  },

  setClientId(clientId: string | null) {
    state.clientId = clientId;
    state.api = new FetchUtil({ baseUrl, clientId });
  }
};
