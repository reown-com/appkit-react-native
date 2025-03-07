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

// -- Helpers ------------------------------------------- //
const baseUrl = CoreHelperUtil.getBlockchainApiUrl();
const stagingUrl = CoreHelperUtil.getBlockchainStagingApiUrl();

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
  stageApi: FetchUtil;
}

// -- State --------------------------------------------- //
const state = proxy<BlockchainApiControllerState>({
  clientId: null,
  api: new FetchUtil({ baseUrl }),
  //TODO: remove this before release
  stageApi: new FetchUtil({ baseUrl: stagingUrl })
});

// -- Controller ---------------------------------------- //
export const BlockchainApiController = {
  state,

  fetchIdentity({ address }: BlockchainApiIdentityRequest) {
    return state.api.get<BlockchainApiIdentityResponse>({
      path: `/v1/identity/${address}`,
      params: {
        projectId: OptionsController.state.projectId
      },
      headers: getHeaders()
    });
  },

  fetchTransactions({
    account,
    projectId,
    cursor,
    onramp,
    signal,
    cache
  }: BlockchainApiTransactionsRequest) {
    return state.api.get<BlockchainApiTransactionsResponse>({
      path: `/v1/account/${account}/history`,
      headers: getHeaders(),
      params: {
        projectId,
        cursor,
        onramp
      },
      signal,
      cache
    });
  },

  fetchTokenPrice({ projectId, addresses }: BlockchainApiTokenPriceRequest) {
    return state.api.post<BlockchainApiTokenPriceResponse>({
      path: '/v1/fungible/price',
      body: {
        projectId,
        currency: 'usd',
        addresses
      },
      headers: getHeaders()
    });
  },

  fetchSwapAllowance({ projectId, tokenAddress, userAddress }: BlockchainApiSwapAllowanceRequest) {
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

  fetchGasPrice({ projectId, chainId }: BlockchainApiGasPriceRequest) {
    return state.api.get<BlockchainApiGasPriceResponse>({
      path: `/v1/convert/gas-price`,
      headers: getHeaders(),
      params: {
        projectId,
        chainId
      }
    });
  },

  fetchSwapQuote({
    projectId,
    amount,
    userAddress,
    from,
    to,
    gasPrice
  }: BlockchainApiSwapQuoteRequest) {
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

  fetchSwapTokens({ projectId, chainId }: BlockchainApiSwapTokensRequest) {
    return state.api.get<BlockchainApiSwapTokensResponse>({
      path: `/v1/convert/tokens`,
      headers: getHeaders(),
      params: {
        projectId,
        chainId
      }
    });
  },

  generateSwapCalldata({
    amount,
    from,
    projectId,
    to,
    userAddress
  }: BlockchainApiGenerateSwapCalldataRequest) {
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

  generateApproveCalldata({
    from,
    projectId,
    to,
    userAddress
  }: BlockchainApiGenerateApproveCalldataRequest) {
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

  async getBalance(address: string, chainId?: string, forceUpdate?: string) {
    return state.api.get<BlockchainApiBalanceResponse>({
      path: `/v1/account/${address}/balance`,
      headers: getHeaders(),
      params: {
        currency: 'usd',
        projectId: OptionsController.state.projectId,
        chainId,
        forceUpdate
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
    return await state.stageApi.get<OnRampCountry[]>({
      path: '/v1/onramp/providers/properties',
      headers: getHeaders(),
      params: {
        projectId: OptionsController.state.projectId,
        type: 'countries'
      }
    });
  },

  async fetchOnRampServiceProviders() {
    return await state.stageApi.get<OnRampServiceProvider[]>({
      path: '/v1/onramp/providers',
      headers: getHeaders(),
      params: {
        projectId: OptionsController.state.projectId
      }
    });
  },

  async fetchOnRampPaymentMethods(params: { countries?: string }) {
    return await state.stageApi.get<OnRampPaymentMethod[]>({
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
    return await state.stageApi.get<OnRampCryptoCurrency[]>({
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
    return await state.stageApi.get<OnRampFiatCurrency[]>({
      path: '/v1/onramp/providers/properties',
      headers: getHeaders(),
      params: {
        projectId: OptionsController.state.projectId,
        type: 'fiat-currencies'
      }
    });
  },

  async fetchOnRampFiatLimits() {
    return await state.stageApi.get<OnRampFiatLimit[]>({
      path: '/v1/onramp/providers/properties',
      headers: getHeaders(),
      params: {
        projectId: OptionsController.state.projectId,
        type: 'fiat-purchases-limits'
      }
    });
  },

  async getOnRampQuotes(body: BlockchainApiOnRampQuotesRequest, signal?: AbortSignal) {
    return await state.stageApi.post<OnRampQuote[]>({
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
    return await state.stageApi.post<BlockchainApiOnRampWidgetResponse>({
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
