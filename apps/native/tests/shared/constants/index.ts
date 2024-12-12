import type { SessionParams } from '../types';

// Allow localhost
export const BASE_URL = process.env.BASE_URL || 'http://localhost:8081/';
export const WALLET_URL = process.env.WALLET_URL || 'https://react-wallet.walletconnect.com/';
export const DEFAULT_SESSION_PARAMS: SessionParams = {
  reqAccounts: ['1', '2'],
  optAccounts: ['1', '2'],
  accept: true
};
export const DEFAULT_CHAIN_NAME = process.env.DEFAULT_CHAIN_NAME || 'Ethereum';
