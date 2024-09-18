import { DateUtil, type Transaction } from '@reown/appkit-common-react-native';
import { TransactionUtil } from '@reown/appkit-ui-react-native';
import type { TransactionType } from '@reown/appkit-ui-react-native/lib/typescript/utils/TypesUtil';

export function getTransactionListItemProps(transaction: Transaction) {
  const date = DateUtil.formatDate(transaction?.metadata?.minedAt);
  const descriptions = TransactionUtil.getTransactionDescriptions(transaction);

  const transfers = transaction?.transfers;
  const transfer = transaction?.transfers?.[0];
  const isAllNFT =
    Boolean(transfer) && transaction?.transfers?.every(item => Boolean(item.nft_info));
  const images = TransactionUtil.getTransactionImages(transfers);

  return {
    date,
    direction: transfer?.direction,
    descriptions,
    isAllNFT,
    images,
    status: transaction.metadata?.status,
    transfers,
    type: transaction.metadata?.operationType as TransactionType
  };
}
