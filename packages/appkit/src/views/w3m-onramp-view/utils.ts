import {
  OnRampController,
  NetworkController,
  type OnRampFiatCurrency,
  ConstantsUtil
} from '@reown/appkit-core-react-native';

// -------------------------- Utils --------------------------
export const getPurchaseCurrencies = (searchValue?: string, filterSelected?: boolean) => {
  const networkId = NetworkController.state.caipNetwork?.id?.split(':')[1];
  let networkTokens =
    OnRampController.state.purchaseCurrencies?.filter(c => c.chainId === networkId) ?? [];

  if (filterSelected) {
    networkTokens = networkTokens?.filter(
      c => c.currencyCode !== OnRampController.state.purchaseCurrency?.currencyCode
    );
  }

  return searchValue
    ? networkTokens.filter(
        item =>
          item.name.toLowerCase().includes(searchValue) ||
          item.currencyCode.toLowerCase().includes(searchValue)
      )
    : networkTokens;
};

// Helper function to generate values based on limits and default value
function generateValuesFromLimits(
  minAmount: number,
  maxAmount: number,
  defaultAmount?: number | null
): number[] {
  // Use default amount if provided, otherwise calculate a reasonable default
  const baseAmount = defaultAmount || Math.min(maxAmount, Math.max(minAmount * 5, 50));

  // Generate two values less than the default and the default itself
  const value1 = Math.max(minAmount, baseAmount * 0.5);
  const value2 = Math.max(minAmount, baseAmount * 0.75);
  const value3 = baseAmount;

  // Ensure all values are within the maximum limit
  const safeValue1 = Math.min(value1, maxAmount);
  const safeValue2 = Math.min(value2, maxAmount);
  const safeValue3 = Math.min(value3, maxAmount);

  // Round all values to nice numbers
  return [safeValue1, safeValue2, safeValue3].map(v => roundToNiceNumber(v));
}

// Helper function to round to nice numbers
function roundToNiceNumber(value: number): number {
  if (value < 10) return Math.ceil(value);

  if (value < 100) {
    // Round to nearest 10
    return Math.ceil(value / 10) * 10;
  } else if (value < 1000) {
    // Round to nearest 50
    return Math.ceil(value / 50) * 50;
  } else if (value < 10000) {
    // Round to nearest 100
    return Math.ceil(value / 100) * 100;
  } else if (value < 100000) {
    // Round to nearest 1000
    return Math.ceil(value / 1000) * 1000;
  } else if (value < 1000000) {
    // Round to nearest 10000
    return Math.ceil(value / 10000) * 10000;
  } else {
    // Round to nearest 100000
    return Math.ceil(value / 100000) * 100000;
  }
}

export const getCurrencySuggestedValues = (currency?: OnRampFiatCurrency) => {
  if (!currency) return [];

  const limit = OnRampController.getCurrencyLimit(currency);

  // If we have predefined values for this currency, use them
  if (
    ConstantsUtil.CURRENCY_SUGGESTED_VALUES[
      currency.currencyCode as keyof typeof ConstantsUtil.CURRENCY_SUGGESTED_VALUES
    ]
  ) {
    const suggestedValues =
      ConstantsUtil.CURRENCY_SUGGESTED_VALUES[
        currency.currencyCode as keyof typeof ConstantsUtil.CURRENCY_SUGGESTED_VALUES
      ];

    // Ensure values are within limits
    if (limit) {
      const minAmount = limit.minimumAmount ?? 0;
      const maxAmount = limit.maximumAmount ?? Infinity;

      // Filter values that are within limits
      const validValues = suggestedValues?.filter(
        (value: number) => value >= minAmount && value <= maxAmount
      );

      // If we have valid values, return them
      if (validValues?.length) {
        return validValues;
      }

      // If no valid values, generate new ones based on limits and default
      return generateValuesFromLimits(minAmount, maxAmount, limit?.defaultAmount);
    }

    return suggestedValues;
  }

  // Fallback to generating values from limits
  if (limit) {
    const minAmount = limit.minimumAmount ?? 0;
    const maxAmount = limit.maximumAmount ?? Infinity;

    return generateValuesFromLimits(minAmount, maxAmount, limit?.defaultAmount);
  }

  return [];
};
