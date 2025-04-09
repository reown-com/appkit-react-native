import { EventEmitter } from "events";

//********** Adapter Types **********//

export abstract class BlockchainAdapter extends EventEmitter {
  public projectId: string;
  public connector?: WalletConnector;
  public supportedNamespace: string;

  constructor({ projectId, supportedNamespace }: { projectId: string, supportedNamespace: string }) {
    super();
    this.projectId = projectId;
    this.supportedNamespace = supportedNamespace;
  }

  setConnector(connector: WalletConnector) {
    this.connector = connector;
  }

  removeConnector() {
    this.connector = undefined;
  }

  abstract disconnect(): Promise<void>;
  abstract request(method: string, params?: any[]): Promise<any>;
  abstract getSupportedNamespace(): string;
}



export abstract class EVMAdapter extends BlockchainAdapter {
  abstract signTransaction(tx: TransactionData): Promise<SignedTransaction>;
  abstract getBalance(address: string): Promise<string>;
  abstract sendTransaction(tx: TransactionData): Promise<TransactionReceipt>;
}

//********** Connector Types **********//

export abstract class WalletConnector extends EventEmitter {
  public type: ConnectorType;
  protected provider: Provider;
  protected namespaces?: string[];

  constructor({ type, provider }: { type: ConnectorType, provider: Provider }) {
    super();
    this.type = type;
    this.provider = provider;
  }

  abstract connect(namespaces?: string[]): Promise<string[]>;
  abstract disconnect(): Promise<void>;
  abstract getProvider(): Provider;
  abstract getNamespaces(): string[];
}

//********** Provider Types **********//

export interface Provider {
  connect<T>(params?: any): Promise<T>;
  disconnect(): Promise<void>;
  request<T = unknown>(args: RequestArguments, chain?: string | undefined, expiry?: number | undefined): Promise<T>;
  on(event: string, listener: (args?: any) => void): any;
  off(event: string, listener: (args?: any) => void): any;
}

export interface RequestArguments {
  method: string;
  params?: unknown[] | Record<string, unknown> | object | undefined;
}

export type ConnectorType = 'walletconnect' | 'coinbase' | 'auth';

//********** Others **********//

export interface TransactionData {
  to: string;
  value?: string;
  data?: string;
  [key: string]: any;
}

export interface SignedTransaction {
  raw: string;
  [key: string]: any;
}

export interface TransactionReceipt {
  transactionHash: string;
  [key: string]: any;
}


export interface ConnectionResponse {
  accounts: string[];
  chainId: string;
  [key: string]: any;
}



