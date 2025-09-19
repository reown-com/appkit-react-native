import type { CaipAddress } from '../common';

export type SwapToken = {
  name: string;
  symbol: string;
  address: CaipAddress;
  decimals: number;
  logoUri: string;
  eip2612?: boolean;
};

export type SwapTokenWithBalance = SwapToken & {
  quantity: {
    decimals: string;
    numeric: string;
  };
  price: number;
  value: number;
};

export type SwapInputTarget = 'sourceToken' | 'toToken';
