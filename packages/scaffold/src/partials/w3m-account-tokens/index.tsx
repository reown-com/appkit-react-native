import { useCallback, useState } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { useSnapshot } from 'valtio';
import { ScrollView, RefreshControl } from 'react-native-gesture-handler';
import {
  AccountController,
  AssetUtil,
  NetworkController,
  RouterController
} from '@reown/appkit-core-react-native';
import { FlexView, ListItem, Text, ListToken, useTheme } from '@reown/appkit-ui-react-native';

interface Props {
  style?: StyleProp<ViewStyle>;
}

export function AccountTokens({ style }: Props) {
  const Theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const { tokenBalance } = useSnapshot(AccountController.state);
  const { caipNetwork } = useSnapshot(NetworkController.state);
  const networkImage = AssetUtil.getNetworkImage(caipNetwork);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    AccountController.fetchTokenBalance();
    setRefreshing(false);
  }, []);

  const onReceivePress = () => {
    RouterController.push('WalletReceive');
  };

  if (!tokenBalance?.length) {
    return (
      <ListItem icon="arrowBottomCircle" iconColor="magenta-100" onPress={onReceivePress}>
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
      {tokenBalance.map(token => (
        <ListToken
          key={token.name}
          name={token.name}
          imageSrc={token.iconUrl}
          networkSrc={networkImage}
          value={token.value}
          amount={token.quantity.numeric}
          currency={token.symbol}
        />
      ))}
    </ScrollView>
  );
}
