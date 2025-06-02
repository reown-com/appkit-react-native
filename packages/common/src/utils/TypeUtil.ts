import { EventEmitter } from 'events';

export type CaipAddress = `${string}:${string}:${string}`;

export type CaipNetworkId = `${string}:${string}`;

export type ChainNamespace = 'eip155' | 'solana' | 'polkadot' | 'bip122';

export type Network = {
  // Core viem/chain properties
  id: number | string;
  name: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: {
    default: { http: readonly string[] };
    [key: string]: { http: readonly string[] } | undefined;
  };
  blockExplorers?: {
    default: { name: string; url: string };
    [key: string]: { name: string; url: string } | undefined;
  };

  // AppKit specific / CAIP properties (Optional in type, but needed in practice)
  chainNamespace?: ChainNamespace; // e.g., 'eip155'
  caipNetworkId?: CaipNetworkId; // e.g., 'eip155:1'
  testnet?: boolean;
  deprecatedCaipNetworkId?: CaipNetworkId; // for Solana deprecated id
};

export type AppKitNetwork = Network & {
  chainNamespace: ChainNamespace; // e.g., 'eip155'
  caipNetworkId: CaipNetworkId; // e.g., 'eip155:1'
  testnet?: boolean;
  deprecatedCaipNetworkId?: CaipNetworkId; // for Solana deprecated id
};

export interface CaipNetwork {
  id: CaipNetworkId;
  name?: string;
  imageId?: string;
  imageUrl?: string;
}

export interface Balance {
  name: string;
  symbol: string;
  chainId: string;
  address?: CaipAddress;
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

export type ThemeMode = 'dark' | 'light';

export interface ThemeVariables {
  accent?: string;
}

export interface Token {
  address: string;
  image?: string;
}

export type Tokens = Record<CaipNetworkId, Token>;

export type ConnectorType = 'WALLET_CONNECT' | 'COINBASE' | 'AUTH' | 'EXTERNAL';

//********** Adapter Event Payloads **********//
export type AccountsChangedEvent = {
  accounts: string[];
};

export type ChainChangedEvent = {
  chainId: string;
};

export type DisconnectEvent = {};

export type BalanceChangedEvent = {
  address: CaipAddress;
  balance: {
    amount: string;
    symbol: string;
    contractAddress?: ContractAddress;
  };
};

//********** Adapter Event Map **********//
export interface AdapterEvents {
  accountsChanged: (event: AccountsChangedEvent) => void;
  chainChanged: (event: ChainChangedEvent) => void;
  disconnect: (event: DisconnectEvent) => void;
  balanceChanged: (event: BalanceChangedEvent) => void;
}

export interface GetBalanceParams {
  address?: CaipAddress;
  network?: AppKitNetwork;
  tokens?: Tokens;
}

type ContractAddress = CaipAddress;

export interface GetBalanceResponse {
  amount: string;
  symbol: string;
  contractAddress?: ContractAddress;
}

//********** Connector Types **********//
interface BaseNamespace {
  chains?: CaipNetworkId[];
  accounts: CaipAddress[];
  methods: string[];
  events: string[];
}

type Namespace = BaseNamespace;

export type Namespaces = Record<string, Namespace>;

export type ProposalNamespaces = Record<
  string,
  Omit<Namespace, 'accounts'> & Required<Pick<Namespace, 'chains'>>
>;

export type ConnectOptions = {
  namespaces?: ProposalNamespaces;
  defaultChain?: CaipNetworkId;
  universalLink?: string;
};

export abstract class WalletConnector extends EventEmitter {
  public type: New_ConnectorType;
  protected provider: Provider;
  protected namespaces?: Namespaces;
  protected wallet?: WalletInfo;

  constructor({ type, provider }: { type: New_ConnectorType; provider: Provider }) {
    super();
    this.type = type;
    this.provider = provider;
  }

  abstract connect(opts: ConnectOptions): Promise<Namespaces | undefined>;
  abstract disconnect(): Promise<void>;
  abstract getProvider(): Provider;
  abstract getNamespaces(): Namespaces;
  abstract getChainId(namespace: ChainNamespace): CaipNetworkId | undefined;
  abstract getWalletInfo(): WalletInfo | undefined;
  abstract switchNetwork(network: AppKitNetwork): Promise<void>;
}

//********** Provider Types **********//

export interface Provider {
  connect<T>(params?: any): Promise<T>;
  disconnect(): Promise<void>;
  request<T = unknown>(
    args: RequestArguments,
    chain?: string | undefined,
    expiry?: number | undefined
  ): Promise<T>;
  on(event: string, listener: (args?: any) => void): any;
  off(event: string, listener: (args?: any) => void): any;
}

export interface RequestArguments {
  method: string;
  params?: unknown[] | Record<string, unknown> | object | undefined;
}

//TODO: rename this and remove the old one ConnectorType
export type New_ConnectorType = 'walletconnect' | 'coinbase' | 'auth';

//********** Others **********//

export interface ConnectionResponse {
  accounts: string[];
  chainId: string;
  [key: string]: any;
}

export interface WalletInfo {
  name?: string;
  icon?: string;
  description?: string;
  url?: string;
  icons?: string[];
  redirect?: {
    native?: string;
    universal?: string;
    linkMode?: boolean;
  };
  [key: string]: unknown;
}
