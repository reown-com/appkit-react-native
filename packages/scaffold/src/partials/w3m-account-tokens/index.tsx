import { SnackController } from '@web3modal/core-react-native';
import { FlexView, ListItem, Text } from '@web3modal/ui-react-native';

export function AccountTokens() {
  // TODO: Implement this feature
  const onMissingPress = () => {
    SnackController.showError('Feature not implemented');
  };

  return (
    <ListItem icon="arrowBottomCircle" iconColor="magenta-100" onPress={onMissingPress}>
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
