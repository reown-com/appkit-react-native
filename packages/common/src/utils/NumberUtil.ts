import * as BigNumber from 'bignumber.js';

export const NumberUtil = {
  bigNumber(value: BigNumber.BigNumber.Value) {
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

    const aBigNumber = new BigNumber.BigNumber(a);
    const bBigNumber = new BigNumber.BigNumber(b);

    return aBigNumber.multipliedBy(bBigNumber);
  },

  roundNumber(number: number, threshold: number, fixed: number) {
    const roundedNumber =
      number.toString().length >= threshold ? Number(number).toFixed(fixed) : number;

    return roundedNumber;
  }
};
