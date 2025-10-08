export type OnRampFiatCurrency = {
  currencyCode: string;
  name: string;
  symbolImageUrl: string;
};

export type OnRampCryptoCurrency = {
  currencyCode: string;
  name: string;
  chainCode: string;
  chainName: string;
  chainId: string;
  contractAddress: string | null;
  symbolImageUrl: string;
};

export type OnRampFiatLimit = {
  currencyCode: string;
  defaultAmount: number | null;
  minimumAmount: number;
  maximumAmount: number;
};

export type OnRampTransactionResult = {
  purchaseCurrency: string | null;
  purchaseAmount: string | null;
  purchaseImageUrl: string | null;
  paymentCurrency: string | null;
  paymentAmount: string | null;
  status: string | null;
  network: string | null;
};
