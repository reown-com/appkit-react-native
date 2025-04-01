import { type Balance, NumberUtil } from '@reown/appkit-common-react-native';
import { UiUtil } from '@reown/appkit-ui-react-native';

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
    // Format using locale-aware function, 5 decimals
    return NumberUtil.formatNumberToLocalString(token.quantity.numeric, 5);
  }

  return null;
}
