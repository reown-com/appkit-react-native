import { useCallback, useMemo, useState } from 'react';
import { useSnapshot } from 'valtio';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { ScrollView, RefreshControl } from 'react-native-gesture-handler';
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
  EventsController,
  NetworkController,
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
  const { loading, transactions, next } = useSnapshot(TransactionsController.state);
  const { caipNetwork } = useSnapshot(NetworkController.state);
  const networkImage = AssetUtil.getNetworkImage(caipNetwork);

  const handleLoadMore = () => {
    TransactionsController.fetchTransactions(AccountController.state.address);
    EventsController.sendEvent({
      type: 'track',
      event: 'LOAD_MORE_TRANSACTIONS',
      properties: {
        address: AccountController.state.address,
        projectId: OptionsController.state.projectId,
        cursor: TransactionsController.state.next,
        isSmartAccount: AccountController.state.preferredAccountType === 'smartAccount'
      }
    });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await TransactionsController.fetchTransactions(AccountController.state.address, true);
    setRefreshing(false);
  }, []);

  const transactionsByYear = useMemo(() => {
    return TransactionsController.getTransactionsByYearAndMonth(transactions as Transaction[]);
  }, [transactions]);

  if (loading && !transactions.length) {
    return (
      <FlexView style={[styles.placeholder, style]} alignItems="center" justifyContent="center">
        <LoadingSpinner />
      </FlexView>
    );
  }

  if (!Object.keys(transactionsByYear).length) {
    return (
      <Placeholder
        icon="swapHorizontal"
        title="No activity yet"
        description="Your next transactions will appear here"
        style={style}
      />
    );
  }

  return (
    <ScrollView
      style={[styles.container, style]}
      fadingEdgeLength={20}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          // @ts-ignore
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
      {(next || loading) && (
        <FlexView style={styles.footer} alignItems="center" justifyContent="center">
          {next && !loading && (
            <Link size="md" style={styles.loadMoreButton} onPress={handleLoadMore}>
              Load more
            </Link>
          )}
          {loading && !refreshing && <LoadingSpinner color="accent-100" />}
        </FlexView>
      )}
    </ScrollView>
  );
}
