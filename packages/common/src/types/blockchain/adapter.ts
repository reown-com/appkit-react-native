import type { ChainNamespace, CaipAddress, AdapterType } from '../common';
import type { WalletConnector } from '../wallet';
import type { BalanceChangedEvent } from './balance';

export interface BlockchainAdapterConfig {
  supportedNamespace: ChainNamespace;
  adapterType: AdapterType;
}

export interface BlockchainAdapterInitParams {
  connector: WalletConnector;
}

export interface AdapterEvents {
  accountsChanged: (event: AccountsChangedEvent) => void;
  chainChanged: (event: ChainChangedEvent) => void;
  disconnect: (event: DisconnectEvent) => void;
  balanceChanged: (event: BalanceChangedEvent) => void;
}

export type AccountsChangedEvent = {
  accounts: CaipAddress[];
};

export type ChainChangedEvent = {
  chainId: string;
};

export type DisconnectEvent = undefined;

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

export interface ConnectionResponse {
  accounts: string[];
  chainId: string;
  [key: string]: any;
}
