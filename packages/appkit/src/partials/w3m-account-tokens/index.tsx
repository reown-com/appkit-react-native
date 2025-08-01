import { useCallback, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import { useSnapshot } from 'valtio';
import {
  AssetController,
  AssetUtil,
  ConnectionsController,
  RouterController
} from '@reown/appkit-core-react-native';
import {
  FlexView,
  ListItem,
  Text,
  ListToken,
  useTheme,
  Spacing,
  LoadingSpinner
} from '@reown/appkit-ui-react-native';

interface Props {
  style?: StyleProp<ViewStyle>;
  isLoading?: boolean;
}

export function AccountTokens({ style, isLoading }: Props) {
  const Theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const { activeNetwork, balances } = useSnapshot(ConnectionsController.state);
  const { networkImages } = useSnapshot(AssetController.state);
  const networkImage = AssetUtil.getNetworkImage(activeNetwork, networkImages);

  const getBalance = useCallback(async () => {
    setRefreshing(true);
    await ConnectionsController.fetchBalance();
    setRefreshing(false);
  }, []);

  const onReceivePress = () => {
    RouterController.push('WalletReceive');
  };

  if (!balances?.length) {
    return (
      <>
        <ListItem
          icon="arrowBottomCircle"
          iconColor="magenta-100"
          onPress={onReceivePress}
          style={styles.receiveButton}
        >
          <FlexView flexDirection="column" alignItems="flex-start">
            <Text variant="paragraph-500" color="fg-100">
              Receive funds
            </Text>
            <Text variant="small-400" color="fg-200">
              Transfer tokens on your wallet
            </Text>
          </FlexView>
        </ListItem>
        {isLoading && <LoadingSpinner size="sm" style={styles.loadingSpinner} />}
      </>
    );
  }

  return (
    <ScrollView
      fadingEdgeLength={20}
      style={style}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={getBalance}
          tintColor={Theme['accent-100']}
          colors={[Theme['accent-100']]}
        />
      }
    >
      {balances.map(token => (
        <ListToken
          key={token.symbol}
          name={token.name || 'Unknown'}
          imageSrc={token.iconUrl}
          networkSrc={networkImage}
          value={token.value}
          amount={token.quantity?.numeric}
          currency={token.symbol}
          pressable={false}
        />
      ))}
      {isLoading && <LoadingSpinner size="sm" style={styles.loadingSpinner} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  receiveButton: {
    width: 'auto',
    marginHorizontal: Spacing.s
  },
  loadingSpinner: {
    marginTop: Spacing.m
  }
});
