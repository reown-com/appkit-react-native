import { DateUtil } from '@reown/appkit-common-react-native';
import type {
  TransactionTransfer,
  Transaction,
  TransactionImage,
  TransactionMetadata
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
    const isAllNFT = Boolean(transfers[0]) && transfers?.every(item => Boolean(item.nft_info));
    const haveMultipleTransfers = transfers?.length > 1;
    const haveTwoTransfers = transfers?.length === 2;

    if (haveTwoTransfers && !isAllNFT) {
      const first = transfers.find(t => t?.direction === 'out');
      const second = transfers.find(t => t?.direction === 'in');

      return [this.getTransactionImage(first), this.getTransactionImage(second)];
    }

    if (haveMultipleTransfers) {
      return transfers.map(item => this.getTransactionImage(item));
    }

    return [this.getTransactionImage(transfers[0])];
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
    if (!transaction.metadata) {
      return ['Unknown transaction'];
    }

    const type = transaction?.metadata?.operationType as TransactionType;
    const transfers = transaction?.transfers;

    // Early return for trade transactions
    if (type === 'trade') {
      return this.getTradeDescriptions(transfers);
    }

    // Handle multiple transfers
    if (transfers.length > 1) {
      return transfers.map(transfer => this.getTransferDescription(transfer));
    }

    // Handle single transfer
    if (transfers.length === 1) {
      return [this.formatSingleTransfer(transfers[0]!, type, transaction.metadata)];
    }

    return [transaction.metadata.status];
  },

  isSendReceiveTransaction(type: TransactionType): boolean {
    return type === 'send' || type === 'receive';
  },

  hasFungibleTransfers(transfers: TransactionTransfer[]): boolean {
    return transfers.every(transfer => Boolean(transfer?.fungible_info));
  },

  getSendReceiveDescriptions(metadata: TransactionMetadata): string[] {
    return [this.truncateAddress(metadata.sentFrom), this.truncateAddress(metadata.sentTo)];
  },

  truncateAddress(address: string): string {
    return UiUtil.getTruncateString({
      string: address,
      charsStart: 4,
      charsEnd: 6,
      truncate: 'middle'
    });
  },

  formatSingleTransfer(
    transfer: TransactionTransfer,
    type: TransactionType,
    metadata: TransactionMetadata
  ): string {
    const prefix = this.getPrefix(type);
    let description = prefix.concat(this.getTransferDescription(transfer));

    if (this.isSendReceiveTransaction(type)) {
      const isSend = type === 'send';

      const address = this.truncateAddress(isSend ? metadata.sentTo : metadata.sentFrom);
      const arrow = isSend ? '→' : '←';
      description = description.concat(` ${arrow} ${address}`);
    }

    return description;
  },

  getPrefix(type: TransactionType): string {
    if (plusTypes.includes(type)) return '+';
    if (minusTypes.includes(type)) return '-';

    return '';
  },

  getTradeDescriptions(transfers: TransactionTransfer[]): string[] {
    const outTransfer = transfers.find(transfer => transfer?.direction === 'out');
    const inTransfer = transfers.find(transfer => transfer?.direction === 'in');

    return [this.getTransferDescription(outTransfer), this.getTransferDescription(inTransfer)];
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
    // Determine the number of decimals based on the value
    const decimals = parsedValue > 1 ? FLOAT_FIXED_VALUE : SMALL_FLOAT_FIXED_VALUE;

    // Use locale-aware formatting
    return UiUtil.formatNumberToLocalString(parsedValue, decimals);
  }
};
