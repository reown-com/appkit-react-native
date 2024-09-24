import { erc20ABI } from '../contracts/erc20';
import { usdtABI } from '../contracts/usdt';
import { ConstantsUtil } from './ConstantsUtil';

export const ContractUtil = {
  getABI: (tokenAddress: string) => {
    switch (tokenAddress) {
      case ConstantsUtil.USDT_CONTRACT_ADDRESS:
        return usdtABI;
      default:
        return erc20ABI;
    }
  }
};
