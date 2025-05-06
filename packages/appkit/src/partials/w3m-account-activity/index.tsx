import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, View, type StyleProp, type ViewStyle, RefreshControl } from 'react-native';
import {
  FlexView,
  Link,
  ListTransaction,
  LoadingSpinner,
  Text,
  TransactionUtil,
  useTheme
} from '@reown/appkit-ui-react-native';
import { type Transaction, type TransactionImage } from '@reown/appkit-common-react-native';
import {
  AccountController,
  AssetUtil,
  ConnectionsController,
  EventsController,
  OptionsController,
  TransactionsController
} from '@reown/appkit-core-react-native';
import { Placeholder } from '../w3m-placeholder';
import { getTransactionListItemProps } from './utils';
import styles from './styles';

interface Props {
  style?: StyleProp<ViewStyle>;
}

export function AccountActivity({ style }: Props) {
  const Theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const { loading, transactions, next } = useSnapshot(TransactionsController.state);
  const { activeNetwork } = useSnapshot(ConnectionsController.state);
  const networkImage = AssetUtil.getNetworkImage(activeNetwork?.id);

  const handleLoadMore = () => {
    const address = ConnectionsController.state.activeAddress?.split(':')[2];
    TransactionsController.fetchTransactions(address);
    EventsController.sendEvent({
      type: 'track',
      event: 'LOAD_MORE_TRANSACTIONS',
      properties: {
        address,
        projectId: OptionsController.state.projectId,
        cursor: TransactionsController.state.next,
        isSmartAccount: AccountController.state.preferredAccountType === 'smartAccount'
      }
    });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const address = ConnectionsController.state.activeAddress?.split(':')[2];
    await TransactionsController.fetchTransactions(address, true);
    setRefreshing(false);
  }, []);

  const transactionsByYear = useMemo(() => {
    return TransactionsController.getTransactionsByYearAndMonth(transactions as Transaction[]);
  }, [transactions]);

  useEffect(() => {
    if (!TransactionsController.state.transactions.length) {
      const address = ConnectionsController.state.activeAddress?.split(':')[2];
      TransactionsController.fetchTransactions(address, true);
    }
    // Set initial load to false after first fetch
    const timer = setTimeout(() => setInitialLoad(false), 100);

    return () => clearTimeout(timer);
  }, []);

  // Show loading spinner during initial load or when loading with no transactions
  if ((initialLoad || loading) && !transactions.length) {
    return (
      <FlexView style={[styles.placeholder, style]} alignItems="center" justifyContent="center">
        <LoadingSpinner />
      </FlexView>
    );
  }

  // Only show placeholder when we're not in initial load or loading state
  if (!Object.keys(transactionsByYear).length && !loading && !initialLoad) {
    return (
      <Placeholder
        icon="swapHorizontal"
        title="No activity yet"
        description="Your next transactions will appear here"
        style={[styles.placeholder, style]}
      />
    );
  }

  return (
    <ScrollView
      style={[styles.container, style]}
      fadingEdgeLength={20}
      contentContainerStyle={[styles.contentContainer]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Theme['accent-100']}
          colors={[Theme['accent-100']]}
        />
      }
    >
      {Object.keys(transactionsByYear)
        .reverse()
        .map(year => (
          <View key={year}>
            {Object.keys(transactionsByYear[year] || {})
              .reverse()
              .map(month => (
                <View key={month}>
                  <Text variant="paragraph-400" color="fg-200" style={styles.separatorText}>
                    {TransactionUtil.getTransactionGroupTitle(year, month)}
                  </Text>
                  {transactionsByYear[year]?.[month]?.map((transaction: Transaction) => {
                    const { date, type, descriptions, status, images, isAllNFT, transfers } =
                      getTransactionListItemProps(transaction);
                    const hasMultipleTransfers = transfers?.length > 2;

                    // Show only the first transfer
                    if (hasMultipleTransfers) {
                      const description = TransactionUtil.getTransferDescription(transfers[0]);

                      return (
                        <ListTransaction
                          key={`${transaction.id}@${description}`}
                          date={date}
                          type={type}
                          descriptions={[description]}
                          status={status}
                          images={[images[0]] as TransactionImage[]}
                          networkSrc={networkImage}
                          style={styles.transactionItem}
                          isAllNFT={isAllNFT}
                        />
                      );
                    }

                    return (
                      <ListTransaction
                        key={transaction.id}
                        date={date}
                        type={type}
                        descriptions={descriptions}
                        status={status}
                        images={images}
                        networkSrc={networkImage}
                        style={styles.transactionItem}
                        isAllNFT={isAllNFT}
                      />
                    );
                  })}
                </View>
              ))}
          </View>
        ))}
      {(next || loading) && !refreshing && (
        <FlexView style={styles.footer} alignItems="center" justifyContent="center">
          {next && !loading && (
            <Link size="md" style={styles.loadMoreButton} onPress={handleLoadMore}>
              Load more
            </Link>
          )}
          {loading && <LoadingSpinner color="accent-100" />}
        </FlexView>
      )}
    </ScrollView>
  );
}
