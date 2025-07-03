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
  Spacing
} from '@reown/appkit-ui-react-native';

interface Props {
  style?: StyleProp<ViewStyle>;
}

export function AccountTokens({ style }: Props) {
  const Theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const { activeNetwork, balances } = useSnapshot(ConnectionsController.state);
  const networkImage = AssetUtil.getNetworkImage(activeNetwork?.id);
  const filteredBalances = balances?.filter(balance => balance.amount > '0');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    ConnectionsController.fetchBalance();
    setRefreshing(false);
  }, []);

  const onReceivePress = () => {
    RouterController.push('WalletReceive');
  };

  if (!filteredBalances?.length) {
    return (
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
    );
  }

  return (
    <ScrollView
      fadingEdgeLength={20}
      style={style}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Theme['accent-100']}
          colors={[Theme['accent-100']]}
        />
      }
    >
      {filteredBalances.map(token => (
        <ListToken
          key={token.symbol}
          name={token.name || 'Unknown'}
          imageSrc={token.iconUrl}
          networkSrc={networkImage}
          value={token.value}
          amount={token.amount}
          currency={token.symbol}
          pressable={false}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  receiveButton: {
    width: 'auto',
    marginHorizontal: Spacing.s
  }
});
