import * as BigNumber from 'bignumber.js';

export const NumberUtil = {
  /**
   * Creates a BigNumber instance from a given value.
   * If the value is a string, commas are removed before conversion.
   * @param value - The input value (string, number, or BigNumber) to convert to a BigNumber.
   * @returns A BigNumber instance.
   */
  bigNumber(value: BigNumber.BigNumber.Value) {
    if (typeof value === 'string') {
      return new BigNumber.BigNumber(value.replace(/,/g, ''));
    }

    return new BigNumber.BigNumber(value);
  },

  /**
   * Multiplies two numbers using BigNumber for precision, especially with decimals.
   * Handles undefined inputs by returning BigNumber(0).
   * @param a - The first multiplicand (string, number, or BigNumber). Commas are removed if it's a string.
   * @param b - The second multiplicand (string, number, or BigNumber). Commas are removed if it's a string.
   * @returns The product as a BigNumber instance, or BigNumber(0) if either input is undefined.
   */
  multiply(a: BigNumber.BigNumber.Value | undefined, b: BigNumber.BigNumber.Value | undefined) {
    if (a === undefined || b === undefined) {
      return BigNumber.BigNumber(0);
    }

    const aBigNumber = new BigNumber.BigNumber(typeof a === 'string' ? a.replace(/,/gu, '') : a);
    const bBigNumber = new BigNumber.BigNumber(typeof b === 'string' ? b.replace(/,/gu, '') : b);

    return aBigNumber.multipliedBy(bBigNumber);
  },

  /**
   * Rounds a number to a specified number of decimal places if its string representation meets a certain length threshold.
   * @param number - The number to potentially round.
   * @param threshold - The minimum string length of the number to trigger rounding.
   * @param fixed - The number of decimal places to round to.
   * @returns The rounded number (as a string if rounded, otherwise the original number) or the original number.
   */
  roundNumber(number: number, threshold: number, fixed: number) {
    const roundedNumber =
      number.toString().length >= threshold ? Number(number).toFixed(fixed) : number;

    return roundedNumber;
  },

  /**
   * Calculates the next multiple of ten greater than or equal to the given amount.
   * Defaults to 10 if no amount is provided or if the calculated multiple is less than 10.
   * @param amount - The number for which to find the next multiple of ten. Optional.
   * @returns The next multiple of ten, at least 10.
   */
  nextMultipleOfTen(amount?: number) {
    if (!amount) return 10;

    return Math.max(Math.ceil(amount / 10) * 10, 10);
  },

  /**
   * Formats a number or string to a human-readable string with a specified number of decimal places, using US locale formatting.
   * @param value - The value to format (string, number, or undefined). If undefined, returns '0.00'.
   * @param decimals - The number of decimal places to display. Defaults to 2.
   * @returns A locale-formatted string representation of the number.
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
   * Parses a locale-formatted numeric string (e.g., with commas) back into a number.
   * @param value - The formatted string to parse. If undefined, returns 0.
   * @returns The parsed number, or 0 if the input is undefined.
   */
  parseLocalStringToNumber(value: string | undefined) {
    if (value === undefined) {
      return 0;
    }

    // Remove any commas used as thousand separators and parse the float
    return parseFloat(value.replace(/,/gu, ''));
  },

  /**
   * Converts a numeric value (BigInt, number, or string representation of a number) to a 0x-prefixed hexadecimal string.
   * This is often required for Ethereum RPC parameters like value, gas, gasPrice.
   * @param value - The value to convert. Can be BigInt, number, or a string (decimal or hex).
   * @returns A 0x-prefixed hexadecimal string, or undefined if the input is undefined or null.
   * @throws Error if the value cannot be converted to BigInt.
   */
  convertNumericToHexString: (value: any): string | undefined => {
    if (value === undefined || value === null) {
      return undefined;
    }
    try {
      // This handles BigInt, number, or string representation of a number (decimal or hex)
      const bigIntValue = BigInt(value);
      // Ethereum RPC spec requires "0x0" for zero, and other values to be 0x-prefixed hex.

      return '0x' + bigIntValue.toString(16);
    } catch (error) {
      throw new Error(`NumberUtil: Invalid parameter, cannot convert to hex: ${value}`);
    }
  }
};
