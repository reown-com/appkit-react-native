import type { CaipAddress, CaipNetworkId, BaseError, RequestCache } from '../common';
import type { Transaction } from '../blockchain/transaction';
import type { SwapToken } from '../swap';

export interface BlockchainApiIdentityRequest {
  address: `0x${string}`;
}

export interface BlockchainApiIdentityResponse {
  avatar: string;
  name: string;
}

export interface BlockchainApiBalance {
  name: string;
  symbol: string;
  chainId: string;
  address?: CaipAddress;
  value?: number;
  price: number;
  quantity: {
    decimals: string;
    numeric: string;
  };
  iconUrl: string;
}

export interface BlockchainApiBalanceResponse {
  balances: BlockchainApiBalance[];
}

export interface BlockchainApiTransactionsRequest {
  account: string;
  projectId: string;
  cursor?: string;
  onramp?: 'meld';
  signal?: AbortSignal;
  cache?: RequestCache;
  chainId: CaipNetworkId;
}

export interface BlockchainApiTransactionsResponse {
  data: Transaction[];
  next: string | null;
}

export interface BlockchainApiSwapAllowanceResponse {
  allowance: string;
}

export interface BlockchainApiGenerateSwapCalldataRequest {
  projectId: string;
  userAddress: CaipAddress;
  from: CaipAddress;
  to: CaipAddress;
  amount: string;
  eip155?: {
    slippage: string;
    permit?: string;
  };
}

export interface BlockchainApiGenerateSwapCalldataResponse {
  tx: {
    from: CaipAddress;
    to: CaipAddress;
    data: `0x${string}`;
    amount: string;
    eip155: {
      gas: string;
      gasPrice: string;
    };
  };
}

export interface BlockchainApiGenerateApproveCalldataRequest {
  projectId: string;
  userAddress: CaipAddress;
  from: CaipAddress;
  to: CaipAddress;
  amount?: number;
}

export interface BlockchainApiGenerateApproveCalldataResponse {
  tx: {
    from: CaipAddress;
    to: CaipAddress;
    data: `0x${string}`;
    value: string;
    eip155: {
      gas: number;
      gasPrice: string;
    };
  };
}

export interface BlockchainApiTokenPriceRequest {
  projectId: string;
  currency?: 'usd' | 'eur' | 'gbp' | 'aud' | 'cad' | 'inr' | 'jpy' | 'btc' | 'eth';
  addresses: CaipAddress[];
}

export interface BlockchainApiTokenPriceResponse {
  fungibles: {
    name: string;
    symbol: string;
    iconUrl: string;
    price: number;
  }[];
}

export interface BlockchainApiSwapAllowanceRequest {
  projectId: string;
  tokenAddress: CaipAddress;
  userAddress: CaipAddress;
}

export interface BlockchainApiGasPriceRequest {
  projectId: string;
  chainId: CaipNetworkId;
}

export interface BlockchainApiGasPriceResponse {
  standard: string;
  fast: string;
  instant: string;
}

export interface BlockchainApiEnsError extends BaseError {
  status: string;
  reasons: { name: string; description: string }[];
}

export type ReownName = `${string}.reown.id` | `${string}.wcn.id`;

export interface BlockchainApiLookupEnsName {
  name: ReownName;
  registered: number;
  updated: number;
  addresses: Record<
    string,
    {
      address: string;
      created: string;
    }
  >;
  attributes: {
    avatar?: string;
    bio?: string;
  }[];
}

export interface BlockchainApiSwapQuoteRequest {
  projectId: string;
  chainId?: CaipNetworkId;
  amount: string;
  userAddress: CaipAddress;
  from: CaipAddress;
  to: CaipAddress;
  gasPrice: string;
}

export interface BlockchainApiSwapQuoteResponse {
  quotes: {
    id: string | null;
    fromAmount: string;
    fromAccount: string;
    toAmount: string;
    toAccount: string;
  }[];
}

export interface BlockchainApiSwapTokensRequest {
  projectId: string;
  chainId: CaipNetworkId;
}

export interface BlockchainApiOnRampQuotesRequest {
  countryCode: string;
  paymentMethodType?: string;
  destinationCurrencyCode: string;
  sourceAmount: number;
  sourceCurrencyCode: string;
  walletAddress: string;
  excludeProviders?: string[];
}

export interface BlockchainApiSwapTokensResponse {
  tokens: SwapToken[];
}

export interface BlockchainApiOnRampWidgetRequest {
  countryCode: string;
  destinationCurrencyCode: string;
  paymentMethodType: string;
  serviceProvider: string;
  sourceAmount: number;
  sourceCurrencyCode: string;
  walletAddress: string;
  redirectUrl?: string;
}

export type BlockchainApiOnRampWidgetResponse = {
  widgetUrl: string;
};

export class BlockchainOnRampError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.message = message;
  }
}
