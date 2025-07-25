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
  OnRampCountryDefaults
} from '../utils/TypeUtil';
import { OptionsController } from './OptionsController';
import { ConstantsUtil } from '../utils/ConstantsUtil';
import { ApiUtil } from '../utils/ApiUtil';
import type { CaipAddress, CaipNetworkId } from '@reown/appkit-common-react-native';

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
      path: 'v1/supported-chains'
    });

    state.supportedChains = supportedChains!;

    return supportedChains;
  },

  async fetchIdentity(params: BlockchainApiIdentityRequest & WithCaipNetworkId) {
    const { address, caipNetworkId } = params;
    const isSupported = await BlockchainApiController.isNetworkSupported(caipNetworkId);

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

  async fetchTransactions(params: BlockchainApiTransactionsRequest) {
    const { account, projectId, cursor, onramp, signal, cache, chainId } = params;
    const isSupported = await BlockchainApiController.isNetworkSupported(chainId);

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
      body: {
        projectId,
        currency: 'usd',
        addresses
      },
      headers: getHeaders()
    });

    return response;
  },

  async fetchSwapAllowance(params: BlockchainApiSwapAllowanceRequest) {
    const { projectId, tokenAddress, userAddress } = params;
    const [namespace, chain] = userAddress.split(':');
    const networkId: CaipNetworkId = `${namespace}:${chain}`;
    const isSupported = await BlockchainApiController.isNetworkSupported(networkId);

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

  async fetchGasPrice(params: BlockchainApiGasPriceRequest) {
    const { projectId, chainId } = params;
    const isSupported = await BlockchainApiController.isNetworkSupported(chainId);

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

  async fetchSwapQuote(params: BlockchainApiSwapQuoteRequest) {
    const { projectId, amount, userAddress, from, to, gasPrice } = params;
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
        projectId,
        amount,
        userAddress,
        from,
        to,
        gasPrice
      }
    });
  },

  async fetchSwapTokens(params: BlockchainApiSwapTokensRequest) {
    const { projectId, chainId } = params;
    const isSupported = await BlockchainApiController.isNetworkSupported(chainId);

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
    const { from, projectId, to, userAddress } = params;
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
        projectId,
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

  async fetchOnRampServiceProviders() {
    return await state.api.get<OnRampServiceProvider[]>({
      path: '/v1/onramp/providers',
      headers: getHeaders(),
      params: {
        projectId: OptionsController.state.projectId
      }
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
        projectId: OptionsController.state.projectId,
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
