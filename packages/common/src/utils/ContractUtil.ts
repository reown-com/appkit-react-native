import { erc20ABI } from '../contracts/erc20';
import { usdtABI } from '../contracts/usdt';
import { ConstantsUtil } from './ConstantsUtil';

export const ContractUtil = {
  getERC20Abi: (tokenAddress: string) => {
    if (ConstantsUtil.USDT_CONTRACT_ADDRESSES.includes(tokenAddress)) {
      return usdtABI;
    }

    return erc20ABI;
  }
};
