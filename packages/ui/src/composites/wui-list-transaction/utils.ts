import type { TransactionStatus } from '@web3modal/common-react-native';
import type { IconType, TransactionType } from '../../utils/TypesUtil';

export const getIcon = (type: TransactionType): IconType => {
  switch (type) {
    case 'approve':
    case 'execute':
      return 'checkmark';
    case 'repay':
    case 'send':
    case 'stake':
    case 'withdraw':
      return 'arrowTop';
    case 'burn':
    case 'cancel':
      return 'close';
    case 'trade':
      return 'swapHorizontal';
    case 'deploy':
      return 'arrowRight';
    default:
      return 'arrowBottom';
  }
};

//Utils
export const getIconColor = (status?: TransactionStatus) => {
  switch (status) {
    case 'confirmed':
      return 'success-100';
    case 'failed':
      return 'error-100';
    case 'pending':
      return 'fg-200';
    default:
      return 'fg-200';
  }
};

export const getTypeLabel = (type?: TransactionType) => {
  if (!type) {
    return 'Unknown';
  }

  switch (type) {
    case 'approve':
      return 'Approved';
    case 'bought':
      return 'Bought';
    case 'borrow':
      return 'Borrowed';
    case 'burn':
      return 'Burnt';
    case 'cancel':
      return 'Canceled';
    case 'claim':
      return 'Claimed';
    case 'deploy':
      return 'Deployed';
    case 'deposit':
      return 'Deposited';
    case 'execute':
      return 'Executed';
    case 'mint':
      return 'Minted';
    case 'receive':
      return 'Received';
    case 'repay':
      return 'Repaid';
    case 'send':
      return 'Sent';
    case 'stake':
      return 'Staked';
    case 'trade':
      return 'Swapped';
    case 'unstake':
      return 'Unstaked';
    case 'withdraw':
      return 'Withdrawn';
    default:
      return 'Unknown';
  }
};
