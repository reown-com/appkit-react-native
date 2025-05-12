import { EventEmitter } from 'events';

export type CaipAddress = `${string}:${string}:${string}`;

export type CaipNetworkId = `${string}:${string}`;

export type ChainNamespace = 'eip155' | 'solana' | 'polkadot' | 'bip122';

export type AppKitNetwork = {
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

  // AppKit specific / CAIP properties (Optional in type, but often needed in practice)
  chainNamespace?: ChainNamespace; // e.g., 'eip155'
  caipNetworkId?: CaipNetworkId; // e.g., 'eip155:1'
  testnet?: boolean;
  deprecatedCaipNetworkId?: CaipNetworkId; // for Solana
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

//********** Adapter Types **********//
export abstract class BlockchainAdapter extends EventEmitter {
  public projectId: string;
  public connector?: WalletConnector;
  public supportedNamespace: ChainNamespace;

  constructor({
    projectId,
    supportedNamespace
  }: {
    projectId: string;
    supportedNamespace: ChainNamespace;
  }) {
    super();
    this.projectId = projectId;
    this.supportedNamespace = supportedNamespace;
  }

  setConnector(connector: WalletConnector) {
    this.connector = connector;
    this.subscribeToEvents();
  }

  removeConnector() {
    this.connector = undefined;
  }

  getProvider(): Provider {
    if (!this.connector) throw new Error('No active connector');

    return this.connector.getProvider();
  }

  subscribeToEvents(): void {
    const provider = this.connector?.getProvider();
    if (!provider) return;

    provider.on('chainChanged', this.onChainChanged.bind(this));
    provider.on('accountsChanged', this.onAccountsChanged.bind(this));
    provider.on('disconnect', this.onDisconnect.bind(this));
  }

  onChainChanged(chainId: string): void {
    this.emit('chainChanged', { chainId, namespace: this.getSupportedNamespace() });
  }

  onAccountsChanged(accounts: string[]): void {
    const _accounts = this.getAccounts();
    const shouldEmit = _accounts?.some(account => {
      const accountAddress = account.split(':')[2];

      return accountAddress !== undefined && accounts.includes(accountAddress);
    });

    if (shouldEmit) {
      this.emit('accountsChanged', { accounts, namespace: this.getSupportedNamespace() });
    }
  }

  onDisconnect(): void {
    this.emit('disconnect', { namespace: this.getSupportedNamespace() });

    const provider = this.connector?.getProvider();
    if (provider) {
      provider.off('chainChanged', this.onChainChanged.bind(this));
      provider.off('accountsChanged', this.onAccountsChanged.bind(this));
      provider.off('disconnect', this.onDisconnect.bind(this));
    }

    this.connector = undefined;
  }

  abstract disconnect(): Promise<void>;
  abstract request(method: string, params?: any[]): Promise<any>;
  abstract getSupportedNamespace(): ChainNamespace;
  abstract getBalance(params: GetBalanceParams): Promise<GetBalanceResponse>;
  abstract getAccounts(): CaipAddress[] | undefined;
  abstract switchNetwork(network: AppKitNetwork): Promise<void>;
}

export abstract class EVMAdapter extends BlockchainAdapter {
  // ens logic
}

export abstract class SolanaBaseAdapter extends BlockchainAdapter {}

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

  abstract connect(opts: {
    namespaces?: ProposalNamespaces;
    defaultChain?: CaipNetworkId;
  }): Promise<Namespaces | undefined>;
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
