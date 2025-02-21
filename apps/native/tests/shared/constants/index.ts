import type { SessionParams } from '../types';

// Allow localhost
export const BASE_URL = process.env.BASE_URL || 'http://localhost:8081/';
export const WALLET_URL = process.env.WALLET_URL || 'https://react-wallet.walletconnect.com/';
export const DEFAULT_SESSION_PARAMS: SessionParams = {
  reqAccounts: ['1', '2'],
  optAccounts: ['1', '2'],
  accept: true
};

export const TEST_CHAINS = {
  POLYGON: 'Polygon',
  ETHEREUM: 'Ethereum',
  GNOSIS: 'Gnosis'
} as const;

export type SupportedChain = (typeof TEST_CHAINS)[keyof typeof TEST_CHAINS];

export const TIMEOUTS = {
  ANIMATION: 300,
  NETWORK_SWITCH: 500,
  CONNECTION: 5000,
  SESSION_PROPOSAL: 30000
} as const;

export const DEFAULT_CHAIN_NAME = process.env.DEFAULT_CHAIN_NAME || TEST_CHAINS.ETHEREUM;
