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

  /**
   * Format the given number or string to human readable numbers with the given number of decimals
   * @param value - The value to format. It could be a number or string. If it's a string, it will be parsed to a float then formatted.
   * @param decimals - number of decimals after dot
   * @returns
   */
  formatNumberToLocalString(value: string | number | undefined, decimals = 2) {
    if (value === undefined) {
      return '0.00';
    }

    if (typeof value === 'number') {
      return value.toLocaleString('en-US', {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals
      });
    }

    return parseFloat(value).toLocaleString('en-US', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals
    });
  },
  /**
   * Parse a formatted local string back to a number
   * @param value - The formatted string to parse
   * @returns
   */
  parseLocalStringToNumber(value: string | undefined) {
    if (value === undefined) {
      return 0;
    }

    // Remove any commas used as thousand separators and parse the float
    return parseFloat(value.replace(/,/gu, ''));
  }
};
