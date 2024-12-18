import type { Transaction } from '@reown/appkit-common-react-native';
import { proxy, subscribe as sub } from 'valtio/vanilla';
import { OptionsController } from './OptionsController';
import { EventsController } from './EventsController';
import { SnackController } from './SnackController';
import { NetworkController } from './NetworkController';
import { BlockchainApiController } from './BlockchainApiController';
import { AccountController } from './AccountController';

// -- Types --------------------------------------------- //
type TransactionByMonthMap = Record<string, Transaction[]>;
type TransactionByYearMap = Record<string, TransactionByMonthMap>;

export interface TransactionsControllerState {
  transactions: Transaction[];
  loading: boolean;
  empty: boolean;
  next: string | undefined;
}

// -- State --------------------------------------------- //
const state = proxy<TransactionsControllerState>({
  transactions: [],
  loading: false,
  empty: false,
  next: undefined
});

// -- Controller ---------------------------------------- //
export const TransactionsController = {
  state,

  subscribe(callback: (newState: TransactionsControllerState) => void) {
    return sub(state, () => callback(state));
  },

  async fetchTransactions(accountAddress?: string, reset?: boolean) {
    const { projectId } = OptionsController.state;

    if (!projectId || !accountAddress) {
      throw new Error("Transactions can't be fetched without a projectId and an accountAddress");
    }

    state.loading = true;

    if (reset) {
      state.next = undefined;
    }

    try {
      const response = await BlockchainApiController.fetchTransactions({
        account: accountAddress,
        projectId,
        cursor: state.next
      });

      const nonSpamTransactions = this.filterSpamTransactions(response?.data ?? []);
      let filteredTransactions = [...state.transactions, ...nonSpamTransactions];

      if (reset) {
        filteredTransactions = nonSpamTransactions;
      }

      state.loading = false;

      state.transactions = filteredTransactions;

      state.empty = nonSpamTransactions.length === 0;
      state.next = response?.next ? response.next : undefined;
    } catch (error) {
      EventsController.sendEvent({
        type: 'track',
        event: 'ERROR_FETCH_TRANSACTIONS',
        properties: {
          address: accountAddress,
          projectId,
          cursor: state.next,
          isSmartAccount: AccountController.state.preferredAccountType === 'smartAccount'
        }
      });
      SnackController.showError('Failed to fetch transactions');
      state.loading = false;
      state.empty = true;
      state.next = undefined;
    }
  },

  getTransactionsByYearAndMonth(transactions: Transaction[]) {
    const grouped: TransactionByYearMap = {};
    let filteredTransactions = this.filterByConnectedChain(transactions);

    filteredTransactions.forEach(transaction => {
      const year = new Date(transaction.metadata.minedAt).getFullYear();
      const month = new Date(transaction.metadata.minedAt).getMonth();

      const yearTransactions = grouped[year] ?? {};
      const monthTransactions = yearTransactions[month] ?? [];

      // If there's a transaction with the same id, remove the old one
      const newMonthTransactions = monthTransactions.filter(tx => tx.id !== transaction.id);

      grouped[year] = {
        ...yearTransactions,
        [month]: [...newMonthTransactions, transaction].sort(
          (a, b) => new Date(b.metadata.minedAt).getTime() - new Date(a.metadata.minedAt).getTime()
        )
      };
    });

    return grouped;
  },

  filterSpamTransactions(transactions: Transaction[]) {
    return transactions.filter(transaction => {
      const isAllSpam = transaction.transfers.every(
        transfer => transfer.nft_info?.flags.is_spam === true
      );

      return !isAllSpam;
    });
  },

  filterByConnectedChain(transactions: Transaction[]) {
    const chainId = NetworkController.state.caipNetwork?.id;
    const filteredTransactions = transactions.filter(
      transaction => transaction.metadata.chain === chainId
    );

    return filteredTransactions;
  },

  clearCursor() {
    state.next = undefined;
  },

  resetTransactions() {
    state.transactions = [];
    state.loading = false;
    state.empty = false;
    state.next = undefined;
  }
};
