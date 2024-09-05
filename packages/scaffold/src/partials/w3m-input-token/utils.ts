import { type Balance, NumberUtil } from '@web3modal/common-react-native';
import { UiUtil } from '@web3modal/ui-react-native';

export function getSendValue(token?: Balance, sendTokenAmount?: number) {
  if (token && sendTokenAmount) {
    const price = token.price;
    const totalValue = price * sendTokenAmount;

    return totalValue ? `$${UiUtil.formatNumberToLocalString(totalValue, 2)}` : 'Incorrect value';
  }

  return null;
}

export function getMaxAmount(token?: Balance) {
  if (token) {
    return NumberUtil.roundNumber(Number(token.quantity.numeric), 6, 5);
  }

  return null;
}
