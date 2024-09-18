import { DateUtil } from '@reown/appkit-common-react-native';
import type {
  TransactionTransfer,
  Transaction,
  TransactionImage
} from '@reown/appkit-common-react-native';
import type { TransactionType } from './TypesUtil';
import { UiUtil } from './UiUtil';

// -- Helpers --------------------------------------------- //
const FLOAT_FIXED_VALUE = 2;
const SMALL_FLOAT_FIXED_VALUE = 4;
const plusTypes: TransactionType[] = ['receive', 'deposit', 'borrow', 'claim'];
const minusTypes: TransactionType[] = ['withdraw', 'repay', 'burn'];

export const TransactionUtil = {
  getTransactionGroupTitle(year: string, month: string) {
    const currentYear = DateUtil.getYear().toString();
    const monthName = DateUtil.getMonth(parseInt(month));
    const isCurrentYear = year === currentYear;
    const groupTitle = isCurrentYear ? monthName : `${monthName} ${year}`;

    return groupTitle;
  },

  getTransactionImages(transfers: TransactionTransfer[]): TransactionImage[] {
    const [transfer, secondTransfer] = transfers;
    const isAllNFT = Boolean(transfer) && transfers?.every(item => Boolean(item.nft_info));
    const haveMultipleTransfers = transfers?.length > 1;
    const haveTwoTransfers = transfers?.length === 2;

    if (haveTwoTransfers && !isAllNFT) {
      return [this.getTransactionImage(transfer), this.getTransactionImage(secondTransfer)];
    }

    if (haveMultipleTransfers) {
      return transfers.map(item => this.getTransactionImage(item));
    }

    return [this.getTransactionImage(transfer)];
  },

  getTransactionImage(transfer?: TransactionTransfer): TransactionImage {
    return {
      type: TransactionUtil.getTransactionTransferTokenType(transfer),
      url: TransactionUtil.getTransactionImageURL(transfer)
    };
  },

  getTransactionImageURL(transfer: TransactionTransfer | undefined) {
    let imageURL;
    const isNFT = Boolean(transfer?.nft_info);
    const isFungible = Boolean(transfer?.fungible_info);

    if (transfer && isNFT) {
      imageURL = transfer?.nft_info?.content?.preview?.url;
    } else if (transfer && isFungible) {
      imageURL = transfer?.fungible_info?.icon?.url;
    }

    return imageURL;
  },

  getTransactionTransferTokenType(transfer?: TransactionTransfer): 'FUNGIBLE' | 'NFT' | undefined {
    if (transfer?.fungible_info) {
      return 'FUNGIBLE';
    } else if (transfer?.nft_info) {
      return 'NFT';
    }

    return undefined;
  },

  getTransactionDescriptions(transaction: Transaction) {
    const type = transaction?.metadata?.operationType as TransactionType;

    const transfers = transaction?.transfers;
    const haveTransfer = transaction?.transfers?.length > 0;
    const haveMultipleTransfers = transaction?.transfers?.length > 1;
    const isSendOrReceive = type === 'send' || type === 'receive';
    const isFungible =
      haveTransfer && transfers?.every(transfer => Boolean(transfer?.fungible_info));
    const [firstTransfer, secondTransfer] = transfers;

    let firstDescription = this.getTransferDescription(firstTransfer);
    let secondDescription = this.getTransferDescription(secondTransfer);

    if (!haveTransfer) {
      if (isSendOrReceive && isFungible) {
        firstDescription = UiUtil.getTruncateString({
          string: transaction?.metadata.sentFrom,
          charsStart: 4,
          charsEnd: 6,
          truncate: 'middle'
        });
        secondDescription = UiUtil.getTruncateString({
          string: transaction?.metadata.sentTo,
          charsStart: 4,
          charsEnd: 6,
          truncate: 'middle'
        });

        return [firstDescription, secondDescription];
      }

      return [transaction.metadata.status];
    }

    if (haveMultipleTransfers) {
      return transfers.map(item => this.getTransferDescription(item));
    }

    let prefix = '';
    if (plusTypes.includes(type)) {
      prefix = '+';
    } else if (minusTypes.includes(type)) {
      prefix = '-';
    }

    firstDescription = prefix.concat(firstDescription);

    if (isSendOrReceive) {
      const isSend = type === 'send';
      const address = UiUtil.getTruncateString({
        string: isSend ? transaction.metadata.sentTo : transaction.metadata.sentFrom,
        charsStart: 4,
        charsEnd: 4,
        truncate: 'middle'
      });
      const arrow = isSend ? '→' : '←';
      firstDescription = firstDescription.concat(` ${arrow} ${address}`);
    }

    return [firstDescription];
  },

  getTransferDescription(transfer?: TransactionTransfer) {
    let description = '';

    if (!transfer) {
      return description;
    }

    if (transfer?.nft_info) {
      description = transfer?.nft_info?.name || '-';
    } else if (transfer?.fungible_info) {
      description = this.getFungibleTransferDescription(transfer) ?? '-';
    }

    return description;
  },

  getFungibleTransferDescription(transfer?: TransactionTransfer) {
    if (!transfer) {
      return null;
    }

    const quantity = this.getQuantityFixedValue(transfer?.quantity.numeric);
    const description = [quantity, transfer?.fungible_info?.symbol].join(' ').trim();

    return description;
  },

  getQuantityFixedValue(value: string | undefined) {
    if (!value) {
      return null;
    }

    const parsedValue = parseFloat(value);

    return parsedValue.toFixed(parsedValue > 1 ? FLOAT_FIXED_VALUE : SMALL_FLOAT_FIXED_VALUE);
  }
};
