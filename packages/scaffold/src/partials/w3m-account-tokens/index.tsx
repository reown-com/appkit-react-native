import { ScrollView, type StyleProp, type ViewStyle } from 'react-native';
import { useSnapshot } from 'valtio';
import {
  AccountController,
  AssetUtil,
  NetworkController,
  RouterController
} from '@reown/appkit-core-react-native';
import { FlexView, ListItem, Text, ListToken } from '@reown/appkit-ui-react-native';

interface Props {
  style?: StyleProp<ViewStyle>;
}

export function AccountTokens({ style }: Props) {
  const { tokenBalance } = useSnapshot(AccountController.state);
  const { caipNetwork } = useSnapshot(NetworkController.state);
  const networkImage = AssetUtil.getNetworkImage(caipNetwork);

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
    <ScrollView bounces={false} fadingEdgeLength={20} style={style}>
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
