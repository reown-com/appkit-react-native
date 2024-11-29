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
  BlockchainApiTokenPriceRequest,
  BlockchainApiTokenPriceResponse,
  BlockchainApiTransactionsRequest,
  BlockchainApiTransactionsResponse
} from '../utils/TypeUtil';
import { OptionsController } from './OptionsController';
import { ConstantsUtil } from '../utils/ConstantsUtil';

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
    const { sdkType, sdkVersion } = OptionsController.state;

    return state.api.get<BlockchainApiIdentityResponse>({
      path: `/v1/identity/${address}`,
      params: {
        projectId: OptionsController.state.projectId
      },
      headers: {
        'Content-Type': 'application/json',
        'x-sdk-type': sdkType,
        'x-sdk-version': sdkVersion
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
    const { sdkType, sdkVersion } = OptionsController.state;

    return state.api.get<BlockchainApiTransactionsResponse>({
      path: `/v1/account/${account}/history`,
      headers: {
        'Content-Type': 'application/json',
        'x-sdk-type': sdkType,
        'x-sdk-version': sdkVersion
      },
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
    const { sdkType, sdkVersion } = OptionsController.state;

    return state.api.post<BlockchainApiTokenPriceResponse>({
      path: '/v1/fungible/price',
      body: {
        projectId,
        currency: 'usd',
        addresses
      },
      headers: {
        'Content-Type': 'application/json',
        'x-sdk-type': sdkType,
        'x-sdk-version': sdkVersion
      }
    });
  },

  fetchSwapAllowance({ projectId, tokenAddress, userAddress }: BlockchainApiSwapAllowanceRequest) {
    const { sdkType, sdkVersion } = OptionsController.state;

    return state.api.get<BlockchainApiSwapAllowanceResponse>({
      path: `/v1/convert/allowance`,
      params: {
        projectId,
        tokenAddress,
        userAddress
      },
      headers: {
        'Content-Type': 'application/json',
        'x-sdk-type': sdkType,
        'x-sdk-version': sdkVersion
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

  fetchSwapQuote({
    projectId,
    amount,
    userAddress,
    from,
    to,
    gasPrice
  }: BlockchainApiSwapQuoteRequest) {
    const { sdkType, sdkVersion } = OptionsController.state;

    return state.api.get<BlockchainApiSwapQuoteResponse>({
      path: `/v1/convert/quotes`,
      headers: {
        'Content-Type': 'application/json',
        'x-sdk-type': sdkType,
        'x-sdk-version': sdkVersion
      },
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
    const { sdkType, sdkVersion } = OptionsController.state;

    return state.api.get<BlockchainApiSwapTokensResponse>({
      path: `/v1/convert/tokens`,
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

  generateSwapCalldata({
    amount,
    from,
    projectId,
    to,
    userAddress
  }: BlockchainApiGenerateSwapCalldataRequest) {
    const { sdkType, sdkVersion } = OptionsController.state;

    return state.api.post<BlockchainApiGenerateSwapCalldataResponse>({
      path: '/v1/convert/build-transaction',
      headers: {
        'Content-Type': 'application/json',
        'x-sdk-type': sdkType,
        'x-sdk-version': sdkVersion
      },
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
    const { sdkType, sdkVersion } = OptionsController.state;

    return state.api.get<BlockchainApiGenerateApproveCalldataResponse>({
      path: `/v1/convert/build-approve`,
      headers: {
        'Content-Type': 'application/json',
        'x-sdk-type': sdkType,
        'x-sdk-version': sdkVersion
      },
      params: {
        projectId,
        userAddress,
        from,
        to
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

  async lookupEnsName(name: string) {
    const { sdkType, sdkVersion } = OptionsController.state;

    return state.api.get<BlockchainApiLookupEnsName>({
      path: `/v1/profile/account/${name}`,
      headers: {
        'Content-Type': 'application/json',
        'x-sdk-type': sdkType,
        'x-sdk-version': sdkVersion
      },
      params: {
        projectId: OptionsController.state.projectId,
        apiVersion: '2'
      }
    });
  },

  setClientId(clientId: string | null) {
    state.clientId = clientId;
    state.api = new FetchUtil({ baseUrl, clientId });
  }
};
