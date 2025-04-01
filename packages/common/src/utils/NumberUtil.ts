import * as BigNumber from 'bignumber.js';

export const NumberUtil = {
  bigNumber(value: BigNumber.BigNumber.Value) {
    if (typeof value === 'string') {
      return new BigNumber.BigNumber(value.replace(/,/g, ''));
    }

    return new BigNumber.BigNumber(value);
  },

  /**
   * Multiply two numbers represented as strings with BigNumber to handle decimals correctly
   * @param a string
   * @param b string
   * @returns
   */
  multiply(a: BigNumber.BigNumber.Value | undefined, b: BigNumber.BigNumber.Value | undefined) {
    if (a === undefined || b === undefined) {
      return BigNumber.BigNumber(0);
    }

    const aBigNumber = new BigNumber.BigNumber(typeof a === 'string' ? a.replace(/,/gu, '') : a);
    const bBigNumber = new BigNumber.BigNumber(typeof b === 'string' ? b.replace(/,/gu, '') : b);

    return aBigNumber.multipliedBy(bBigNumber);
  },

  roundNumber(number: number, threshold: number, fixed: number) {
    const roundedNumber =
      number.toString().length >= threshold ? Number(number).toFixed(fixed) : number;

    return roundedNumber;
  },

  nextMultipleOfTen(amount?: number) {
    if (!amount) return 10;

    return Math.max(Math.ceil(amount / 10) * 10, 10);
  },

  /**
   * Format the given number or string to human readable numbers with the given number of decimals
   * @param value - The value to format. It could be a number or string. If it's a string, it will be parsed to a float then formatted.
   * @param decimals - number of decimals after dot
   * @returns
   */
  formatNumberToLocalString(value: string | number | undefined, decimals = 2) {
    const options: Intl.NumberFormatOptions = {
      maximumFractionDigits: decimals
      // Omit minimumFractionDigits to remove trailing zeros
    };

    if (value === undefined) {
      // Use undefined locale to get system default
      return (0).toLocaleString(undefined, options);
    }

    let numberValue: number;
    if (typeof value === 'string') {
      // Attempt to parse the string, handling potential locale-specific formats might be complex here,
      // assuming parseFloat works for common cases after removing grouping separators might be needed if issues arise.
      // For now, stick to parseFloat as it was.
      numberValue = parseFloat(value);
    } else {
      numberValue = value;
    }

    if (isNaN(numberValue)) {
      // Handle cases where parsing might fail, return a default or based on requirements
      return (0).toLocaleString(undefined, options);
    }

    return numberValue.toLocaleString(undefined, options);
  },
  /**
   * Parse a formatted local string back to a number
   * @param value - The formatted string to parse
   * @returns
   */
  parseLocalStringToNumber(value: string | undefined): number {
    if (value === undefined || value === null || value.trim() === '') {
      return 0;
    }

    const decimalSeparator = this.getLocaleDecimalSeparator();
    let processedValue = value;

    if (decimalSeparator === ',') {
      // If locale uses COMMA for decimal:
      // 1. Remove all period characters (thousand separators)
      processedValue = processedValue.replace(/\./g, '');
      // 2. Replace the comma decimal separator with a period
      processedValue = processedValue.replace(/,/g, '.');
    } else {
      // If locale uses PERIOD for decimal (or anything else):
      // 1. Remove all comma characters (thousand separators)
      processedValue = processedValue.replace(/,/g, '');
      // 2. Period decimal separator is already correct
    }

    // Parse the cleaned string which should now use '.' as decimal and no thousand separators
    const result = parseFloat(processedValue);

    // Return the parsed number, or 0 if parsing failed (NaN)
    return isNaN(result) ? 0 : result;
  },

  /**
   * Determines the decimal separator based on the user's locale.
   * @returns The locale's decimal separator (e.g., '.' or ',').
   */
  getLocaleDecimalSeparator(): string {
    // Format a known decimal number and extract the second character
    return (1.1).toLocaleString().substring(1, 2);
  }
};
