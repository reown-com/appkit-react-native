export interface Balance {
  name: string;
  symbol: string;
  chainId: string;
  address?: string;
  value?: number;
  price: number;
  quantity: BalanceQuantity;
  iconUrl: string;
}

type BalanceQuantity = {
  decimals: string;
  numeric: string;
};
