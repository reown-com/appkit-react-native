import { useSnapshot } from 'valtio';
import { AccountController, RouterController } from '@web3modal/core-react-native';
import { FlexView, ListItem, Text, ListToken } from '@web3modal/ui-react-native';
import { ScrollView } from 'react-native';

export function AccountTokens() {
  const { tokenBalance } = useSnapshot(AccountController.state);
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
    <ScrollView bounces={false}>
      {tokenBalance.map(token => (
        <ListToken
          key={token.name}
          name={token.name}
          imageSrc={token.iconUrl}
          value={token.value}
          amount={token.quantity.numeric}
          currency={token.symbol}
        />
      ))}
    </ScrollView>
  );
}
