export type OnRampCountry = {
  countryCode: string;
  flagImageUrl: string;
  name: string;
};

export type OnRampCountryDefaults = {
  countryCode: string;
  defaultCurrencyCode: string;
  defaultPaymentMethods: string[];
};
