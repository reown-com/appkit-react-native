import type { ConnectParams } from '@walletconnect/universal-provider';

export interface ProviderParams {
  name: string;
  description: string;
  url: string;
  icons: string[];
}

export type SessionParams = ConnectParams;
