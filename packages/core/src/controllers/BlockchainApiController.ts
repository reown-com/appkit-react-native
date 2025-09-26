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
  OnRampFiatLimit,
  OnRampCountryDefaults,
  CaipAddress,
  CaipNetworkId
} from '@reown/appkit-common-react-native';
import { OptionsController } from './OptionsController';
import { ConstantsUtil } from '../utils/ConstantsUtil';
import { ApiUtil } from '../utils/ApiUtil';

import { SnackController } from './SnackController';

// -- Helpers ------------------------------------------- //
const baseUrl = CoreHelperUtil.getBlockchainApiUrl();

const getParams = () => {
  const { projectId, sdkType, sdkVersion } = OptionsController.state;

  return {
    projectId,
    st: sdkType,
    sv: sdkVersion
  };
};

const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'User-Agent': ApiUtil.getUserAgent(),
    'origin': ApiUtil.getOrigin()
  };
};

export const EXCLUDED_ONRAMP_PROVIDERS = ['BINANCECONNECT', 'COINBASEPAY'];

// -- Types --------------------------------------------- //
type WithCaipNetworkId = { caipNetworkId: CaipNetworkId };

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
      path: 'v1/supported-chains',
      params: getParams()
    });

    state.supportedChains = supportedChains!;

    return supportedChains;
  },

  async fetchIdentity(params: BlockchainApiIdentityRequest) {
    const { address } = params;

    return state.api.get<BlockchainApiIdentityResponse>({
      path: `/v1/identity/${address}`,
      headers: getHeaders(),
      params: getParams()
    });
  },

  async fetchTransactions(params: BlockchainApiTransactionsRequest) {
    const { account, cursor, signal, cache, chainId } = params;
    const isSupported = ConstantsUtil.ACTIVITY_SUPPORTED_CHAINS.includes(chainId);

    if (!isSupported) {
      return { data: [], next: undefined };
    }

    const response = await state.api.get<BlockchainApiTransactionsResponse>({
      path: `/v1/account/${account}/history`,
      headers: getHeaders(),
      params: {
        ...getParams(),
        cursor,
        chainId
      },
      signal,
      cache
    });

    return response;
  },

  async fetchTokenPrice(params: BlockchainApiTokenPriceRequest & WithCaipNetworkId) {
    const { projectId, addresses, caipNetworkId } = params;
    const isSupported = await BlockchainApiController.isNetworkSupported(caipNetworkId);

    if (!isSupported) {
      return { fungibles: [] };
    }

    const response = await state.api.post<BlockchainApiTokenPriceResponse>({
      path: '/v1/fungible/price',
      headers: getHeaders(),
      params: getParams(),
      body: {
        projectId,
        currency: 'usd',
        addresses
      }
    });

    return response;
  },

  async fetchSwapAllowance(params: BlockchainApiSwapAllowanceRequest) {
    const { tokenAddress, userAddress } = params;
    const [namespace, chain] = userAddress.split(':');
    const networkId: CaipNetworkId = `${namespace}:${chain}`;
    const isSupported = await BlockchainApiController.isNetworkSupported(networkId);

    if (!isSupported) {
      return { allowance: '0' };
    }

    return state.api.get<BlockchainApiSwapAllowanceResponse>({
      path: `/v1/convert/allowance`,
      params: {
        ...getParams(),
        tokenAddress,
        userAddress
      },
      headers: getHeaders()
    });
  },

  async fetchGasPrice(params: BlockchainApiGasPriceRequest) {
    const { chainId } = params;
    const isSupported = await BlockchainApiController.isNetworkSupported(chainId);

    if (!isSupported) {
      throw new Error('Network not supported for Gas Price');
    }

    return state.api.get<BlockchainApiGasPriceResponse>({
      path: `/v1/convert/gas-price`,
      headers: getHeaders(),
      params: {
        ...getParams(),
        chainId
      }
    });
  },

  async fetchSwapQuote(params: BlockchainApiSwapQuoteRequest) {
    const { amount, userAddress, from, to, gasPrice } = params;
    const [namespace, chain] = userAddress.split(':');
    const networkId: CaipNetworkId = `${namespace}:${chain}`;
    const isSupported = await BlockchainApiController.isNetworkSupported(networkId);

    if (!isSupported) {
      return { quotes: [] };
    }

    return state.api.get<BlockchainApiSwapQuoteResponse>({
      path: `/v1/convert/quotes`,
      headers: getHeaders(),
      params: {
        ...getParams(),
        amount,
        userAddress,
        from,
        to,
        gasPrice
      }
    });
  },

  async fetchSwapTokens(params: BlockchainApiSwapTokensRequest) {
    const { chainId } = params;
    const isSupported = await BlockchainApiController.isNetworkSupported(chainId);

    if (!isSupported) {
      return { tokens: [] };
    }

    return state.api.get<BlockchainApiSwapTokensResponse>({
      path: `/v1/convert/tokens`,
      headers: getHeaders(),
      params: {
        ...getParams(),
        chainId
      }
    });
  },

  async generateSwapCalldata(params: BlockchainApiGenerateSwapCalldataRequest) {
    const { amount, from, projectId, to, userAddress } = params;
    const [namespace, chain] = userAddress.split(':');
    const networkId: CaipNetworkId = `${namespace}:${chain}`;
    const isSupported = await BlockchainApiController.isNetworkSupported(networkId);

    if (!isSupported) {
      throw new Error('Network not supported for Swaps');
    }

    return state.api.post<BlockchainApiGenerateSwapCalldataResponse>({
      path: '/v1/convert/build-transaction',
      headers: getHeaders(),
      params: getParams(),
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

  async generateApproveCalldata(params: BlockchainApiGenerateApproveCalldataRequest) {
    const { from, to, userAddress } = params;
    const [namespace, chain] = userAddress.split(':');
    const networkId: CaipNetworkId = `${namespace}:${chain}`;
    const isSupported = await BlockchainApiController.isNetworkSupported(networkId);

    if (!isSupported) {
      throw new Error('Network not supported for Swaps');
    }

    return state.api.get<BlockchainApiGenerateApproveCalldataResponse>({
      path: `/v1/convert/build-approve`,
      headers: getHeaders(),
      params: {
        ...getParams(),
        userAddress,
        from,
        to
      }
    });
  },

  async getBalance(address?: CaipAddress, forceUpdate?: CaipAddress[]) {
    const [namespace, chain, plainAddress] = address?.split(':') ?? [];

    if (!namespace || !chain || !plainAddress) {
      throw new Error('Invalid address');
    }

    const isSupported = await BlockchainApiController.isNetworkSupported(`${namespace}:${chain}`);

    if (!isSupported) {
      SnackController.showError('Token Balance Unavailable');

      return { balances: [] };
    }

    return state.api.get<BlockchainApiBalanceResponse>({
      path: `/v1/account/${plainAddress}/balance`,
      headers: getHeaders(),
      params: {
        ...getParams(),
        currency: 'usd',
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
        ...getParams(),
        apiVersion: '2'
      }
    });
  },

  async fetchOnRampServiceProviders() {
    return await state.api.get<OnRampServiceProvider[]>({
      path: '/v1/onramp/providers',
      headers: getHeaders(),
      params: getParams()
    });
  },

  async fetchOnRampCountries() {
    return await this.fetchProperties<OnRampCountry[]>('countries');
  },

  async fetchOnRampPaymentMethods(params: { countries?: string }) {
    return await this.fetchProperties<OnRampPaymentMethod[]>('payment-methods', params);
  },

  async fetchOnRampCryptoCurrencies(params: { countries?: string }) {
    return await this.fetchProperties<OnRampCryptoCurrency[]>('crypto-currencies', params);
  },

  async fetchOnRampFiatCurrencies() {
    return await this.fetchProperties<OnRampFiatCurrency[]>('fiat-currencies');
  },

  async fetchOnRampFiatLimits() {
    return await this.fetchProperties<OnRampFiatLimit[]>('fiat-purchases-limits');
  },

  async fetchOnRampCountriesDefaults() {
    return await this.fetchProperties<OnRampCountryDefaults[]>('countries-defaults');
  },

  async fetchProperties<T>(type: string, params?: Record<string, string>) {
    return await state.api.get<T>({
      path: '/v1/onramp/providers/properties',
      headers: getHeaders(),
      params: {
        ...getParams(),
        type,
        excludeProviders: EXCLUDED_ONRAMP_PROVIDERS.join(','),
        ...params
      }
    });
  },

  async getOnRampQuotes(body: BlockchainApiOnRampQuotesRequest, signal?: AbortSignal) {
    return await state.api.post<OnRampQuote[]>({
      path: '/v1/onramp/multi/quotes',
      headers: getHeaders(),
      params: getParams(),
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
      params: getParams(),
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
