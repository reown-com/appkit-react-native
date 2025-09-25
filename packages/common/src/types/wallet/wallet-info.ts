import type { CaipNetworkId } from '../common';

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
  type?: 'walletconnect' | 'external' | 'unknown';
  [key: string]: unknown;
}

export type Metadata = {
  name: string;
  description: string;
  url: string;
  icons: string[];
  redirect?: {
    native?: string;
    universal?: string;
    linkMode?: boolean;
  };
};

export interface Token {
  address: string;
  image?: string;
}

export type Tokens = Record<CaipNetworkId, Token>;

export interface Identity {
  name: string;
  avatar?: string;
}

export type ConnectedWalletInfo = WalletInfo | undefined;
