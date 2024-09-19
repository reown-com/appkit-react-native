import { proxy } from 'valtio';

import { CoreHelperUtil } from '../utils/CoreHelperUtil';
import { FetchUtil } from '../utils/FetchUtil';
import type {
  BlockchainApiBalanceResponse,
  BlockchainApiGasPriceRequest,
  BlockchainApiGasPriceResponse,
  BlockchainApiIdentityRequest,
  BlockchainApiIdentityResponse,
  BlockchainApiTokenPriceRequest,
  BlockchainApiTokenPriceResponse,
  BlockchainApiTransactionsRequest,
  BlockchainApiTransactionsResponse
} from '../utils/TypeUtil';
import { OptionsController } from './OptionsController';

// -- Helpers ------------------------------------------- //
const baseUrl = CoreHelperUtil.getBlockchainApiUrl();

// -- Types --------------------------------------------- //
export interface BlockchainApiControllerState {
  clientId: string | null;
  api: FetchUtil;
}

// -- State --------------------------------------------- //
const state = proxy<BlockchainApiControllerState>({
  clientId: null,
  api: new FetchUtil({ baseUrl })
});

// -- Controller ---------------------------------------- //
export const BlockchainApiController = {
  state,

  fetchIdentity({ address }: BlockchainApiIdentityRequest) {
    return state.api.get<BlockchainApiIdentityResponse>({
      path: `/v1/identity/${address}`,
      params: {
        projectId: OptionsController.state.projectId
      }
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
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  fetchGasPrice({ projectId, chainId }: BlockchainApiGasPriceRequest) {
    const { sdkType, sdkVersion } = OptionsController.state;

    return state.api.get<BlockchainApiGasPriceResponse>({
      path: `/v1/convert/gas-price`,
      headers: {
        'Content-Type': 'application/json',
        'x-sdk-type': sdkType,
        'x-sdk-version': sdkVersion
      },
      params: {
        projectId,
        chainId
      }
    });
  },

  async getBalance(address: string, chainId?: string, forceUpdate?: string) {
    const { sdkType, sdkVersion } = OptionsController.state;

    return state.api.get<BlockchainApiBalanceResponse>({
      path: `/v1/account/${address}/balance`,
      headers: {
        'x-sdk-type': sdkType,
        'x-sdk-version': sdkVersion
      },
      params: {
        currency: 'usd',
        projectId: OptionsController.state.projectId,
        chainId,
        forceUpdate
      }
    });
  },

  setClientId(clientId: string | null) {
    state.clientId = clientId;
    state.api = new FetchUtil({ baseUrl, clientId });
  }
};
