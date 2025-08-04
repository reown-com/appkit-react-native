export type OnRampPaymentMethod = {
  logos: {
    dark: string;
    light: string;
  };
  name: string;
  paymentMethod: string;
  paymentType: string;
};

export type OnRampQuote = {
  countryCode: string;
  customerScore: number;
  destinationAmount: number;
  destinationAmountWithoutFees: number;
  destinationCurrencyCode: string;
  exchangeRate: number;
  fiatAmountWithoutFees: number;
  lowKyc: boolean;
  networkFee: number;
  paymentMethodType: string;
  serviceProvider: string;
  sourceAmount: number;
  sourceAmountWithoutFees: number;
  sourceCurrencyCode: string;
  totalFee: number;
  transactionFee: number;
  transactionType: string;
};

export type OnRampServiceProvider = {
  categories: string[];
  categoryStatuses: {
    additionalProp: string;
  };
  logos: {
    dark: string;
    darkShort: string;
    light: string;
    lightShort: string;
  };
  name: string;
  serviceProvider: string;
  status: string;
  websiteUrl: string;
};
