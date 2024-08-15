import { useMemo } from 'react';
import { useSnapshot } from 'valtio';
import { ScrollView, View } from 'react-native';
import { ListTransaction, LoadingSpinner, Text, TransactionUtil } from '@web3modal/ui-react-native';
import { type Transaction, type TransactionImage } from '@web3modal/common-react-native';
import { AssetUtil, NetworkController, TransactionsController } from '@web3modal/core-react-native';
import { AccountPlaceholder } from '../w3m-account-placeholder';
import { getTransactionListItemProps } from './utils';
import styles from './styles';

export function AccountActivity() {
  const { loading, transactions } = useSnapshot(TransactionsController.state);
  const { caipNetwork } = useSnapshot(NetworkController.state);
  const networkImage = AssetUtil.getNetworkImage(caipNetwork);

  const transactionsByYear = useMemo(() => {
    return TransactionsController.getTransactionsByYearAndMonth(transactions as Transaction[]);
  }, [transactions]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!Object.keys(transactionsByYear).length) {
    return (
      <AccountPlaceholder
        icon="swapHorizontal"
        title="No activity yet"
        description="Your next transactions will appear here"
      />
    );
  }

  return (
    <ScrollView bounces={false} style={styles.container}>
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

                    if (hasMultipleTransfers) {
                      return transfers.map((transfer, index) => {
                        const description = TransactionUtil.getTransferDescription(transfer);

                        return (
                          <ListTransaction
                            key={`${transaction.id}@${description}`}
                            date={date}
                            type={type}
                            descriptions={[description]}
                            status={status}
                            images={[images[index]] as TransactionImage[]}
                            networkSrc={networkImage}
                            style={styles.transactionItem}
                            isAllNFT={isAllNFT}
                          />
                        );
                      });
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
    </ScrollView>
  );
}
