import type { CaipAddress } from '../common';
import type { Tokens } from '../wallet';
import type { AppKitNetwork } from './network';

export interface Balance {
  name?: string;
  amount: string;
  symbol: string;
  quantity?: {
    decimals: string;
    numeric: string;
  };
  chainId?: string;
  address?: CaipAddress | string; // contract address
  value?: number; //total value of the amount in currency
  price?: number; //price of the token in currency
  iconUrl?: string;
}

export interface GetBalanceParams {
  network: AppKitNetwork;
  address?: CaipAddress;
  tokens?: Tokens;
}

export type GetBalanceResponse = Balance;

export type BalanceChangedEvent = {
  address: CaipAddress;
  balance: Balance;
};
