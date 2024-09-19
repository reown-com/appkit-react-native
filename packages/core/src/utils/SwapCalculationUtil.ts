// -- Types --------------------------------------------- //

import { NumberUtil } from '@reown/appkit-common-react-native';

// -- Util ---------------------------------------- //
export const SwapCalculationUtil = {
  getGasPriceInEther(gas: bigint, gasPrice: bigint) {
    const totalGasCostInWei = gasPrice * gas;
    const totalGasCostInEther = Number(totalGasCostInWei) / 1e18;

    return totalGasCostInEther;
  },

  getGasPriceInUSD(networkPrice: string, gas: bigint, gasPrice: bigint) {
    const totalGasCostInEther = SwapCalculationUtil.getGasPriceInEther(gas, gasPrice);
    const networkPriceInUSD = NumberUtil.bigNumber(networkPrice);
    const gasCostInUSD = networkPriceInUSD.multipliedBy(totalGasCostInEther);

    return gasCostInUSD.toNumber();
  }
};
