import type { ChainNamespace, CaipNetworkId } from '../common';

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
  imageUrl?: string;
};

export type AppKitNetwork = Network & {
  chainNamespace: ChainNamespace; // mandatory for AppKitNetwork
  caipNetworkId: CaipNetworkId; // mandatory for AppKitNetwork
};

export interface CaipNetwork {
  id: CaipNetworkId;
  name?: string;
  imageId?: string;
  imageUrl?: string;
}

export interface AppKitOpenOptions {
  view: 'Account' | 'Connect' | 'WalletConnect' | 'Networks' | 'Swap' | 'OnRamp';
}
