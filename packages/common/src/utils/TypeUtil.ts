import type { Chain as BaseChain } from 'viem/chains';
import type { ChainFormatters } from 'viem';

export type ChainNamespace = 'eip155' | 'solana' | 'polkadot' | 'bip122';

export type CaipNetworkId = `${ChainNamespace}:${ChainId}`;

export type ChainId = string | number;

export type CaipNetwork<
  formatters extends ChainFormatters | undefined = ChainFormatters | undefined,
  custom extends Record<string, unknown> | undefined = Record<string, unknown> | undefined
> = Omit<BaseChain<formatters, custom>, 'id'> & {
  id: number | string;
  chainNamespace: ChainNamespace;
  caipNetworkId: CaipNetworkId;
  assets?: {
    imageId: string | undefined;
    imageUrl: string | undefined;
  };
};

export type BaseNetwork<
  formatters extends ChainFormatters | undefined = ChainFormatters | undefined,
  custom extends Record<string, unknown> | undefined = Record<string, unknown> | undefined
> = BaseChain<formatters, custom>;

export type AppKitNetwork = BaseNetwork | CaipNetwork;

export interface Balance {
  name: string;
  symbol: string;
  chainId: string;
  address?: string;
  value?: number;
  price: number;
  quantity: BalanceQuantity;
  iconUrl: string;
}

type BalanceQuantity = {
  decimals: string;
  numeric: string;
};

export type TransactionStatus = 'confirmed' | 'failed' | 'pending';
export type TransactionDirection = 'in' | 'out' | 'self';
export type TransactionImage = {
  type: 'FUNGIBLE' | 'NFT' | undefined;
  url: string | undefined;
};

export interface Transaction {
  id: string;
  metadata: TransactionMetadata;
  transfers: TransactionTransfer[];
}

export interface TransactionMetadata {
  application: {
    iconUrl: string | null;
    name: string | null;
  };
  operationType: string;
  hash: string;
  minedAt: string;
  sentFrom: string;
  sentTo: string;
  status: TransactionStatus;
  nonce: number;
  chain?: string;
}

export interface TransactionTransfer {
  fungible_info?: {
    name?: string;
    symbol?: string;
    icon?: {
      url: string;
    };
  };
  nft_info?: TransactionNftInfo;
  direction: TransactionDirection;
  quantity: TransactionQuantity;
  value?: number;
  price?: number;
}

export interface TransactionNftInfo {
  name?: string;
  content?: TransactionContent;
  flags: TransactionNftInfoFlags;
}

export interface TransactionNftInfoFlags {
  is_spam: boolean;
}

export interface TransactionContent {
  preview?: TransactionPreview;
  detail?: TransactionDetail;
}

export interface TransactionPreview {
  url: string;
  content_type?: null;
}

export interface TransactionDetail {
  url: string;
  content_type?: null;
}

export interface TransactionQuantity {
  numeric: string;
}

export type SocialProvider = 'apple' | 'x' | 'discord' | 'farcaster';
