import { EventEmitter } from 'events';
import type { ChainNamespace, CaipAddress, CaipNetworkId } from '../common';
import type { AppKitNetwork } from '../blockchain/network';
import type { Provider } from '../blockchain/adapter';
import type { WalletInfo, Metadata } from './wallet-info';
import type { ConnectionProperties } from './connection';
import type { Storage } from '../storage';
import type { WcWallet } from '../api/wallet-api';

export type ConnectorType = 'walletconnect' | 'coinbase' | 'phantom' | 'solflare';

export interface BaseNamespace {
  chains?: CaipNetworkId[];
  accounts: CaipAddress[];
  methods: string[];
  events: string[];
}

type Namespace = BaseNamespace;

export type Namespaces = Record<string, Namespace>;

export type ProposalNamespaces = Record<
  string,
  Omit<Namespace, 'accounts'> &
    Required<Pick<Namespace, 'chains'>> & { rpcMap: Record<string, string> }
>;

export type ConnectOptions = {
  namespaces?: ProposalNamespaces;
  defaultNetwork?: AppKitNetwork;
  universalLink?: string;
};

export type ConnectorInitOptions = {
  storage: Storage;
  metadata: Metadata;
};

export abstract class WalletConnector extends EventEmitter {
  public type: ConnectorType;
  protected provider?: Provider;
  protected namespaces?: Namespaces;
  protected wallet?: WalletInfo;
  protected storage?: Storage;
  protected metadata?: Metadata;
  protected properties?: ConnectionProperties;

  constructor({ type }: { type: ConnectorType }) {
    super();
    this.type = type;
  }

  public async init(ops: ConnectorInitOptions) {
    this.storage = ops.storage;
    this.metadata = ops.metadata;
  }

  public setProvider(provider: Provider) {
    this.provider = provider;
  }

  public async disconnect() {
    await this.provider?.disconnect();
    this.namespaces = undefined;
    this.wallet = undefined;
    this.properties = undefined;
  }

  abstract connect(opts: ConnectOptions): Promise<Namespaces | undefined>;
  abstract getProvider(namespace?: ChainNamespace): Provider;
  abstract getNamespaces(): Namespaces;
  abstract getChainId(namespace: ChainNamespace): CaipNetworkId | undefined;
  abstract getWalletInfo(): WalletInfo | undefined;
  abstract getProperties(): ConnectionProperties | undefined;
  abstract switchNetwork(network: AppKitNetwork): Promise<void>;
  abstract restoreSession(): Promise<boolean>;
}

export type AppKitConnectOptions = {
  walletId?: string;
  wallet?: WcWallet;
};
