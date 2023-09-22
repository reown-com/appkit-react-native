import { useSnapshot } from 'valtio';
import { Linking } from 'react-native';
import { AccountController, ModalController } from '@web3modal/core-react-native';
import {
  Avatar,
  Button,
  FlexView,
  IconLink,
  Text,
  UiUtil,
  Spacing,
  ListItem
} from '@web3modal/ui-react-native';

export function AccountView() {
  const { address, profileName, profileImage, balance, addressExplorerUrl } = useSnapshot(
    AccountController.state
  );
  const testAddress = '0xDBbD65026a07cFbFa1aa92744E4D69951686077d';

  const onExplorerPress = () => {
    if (addressExplorerUrl) {
      Linking.openURL(addressExplorerUrl);
    }
  };

  const addressExplorerTemplate = () => {
    // if (!addressExplorerUrl) return null;

    return (
      <Button
        size="sm"
        variant="shade"
        iconLeft="compass"
        iconRight="externalLink"
        onPress={onExplorerPress}
        style={{ marginVertical: Spacing.l }}
      >
        Block Explorer
      </Button>
    );
  };

  return (
    <FlexView alignItems="center" padding="s">
      <IconLink icon="close" style={{ alignSelf: 'flex-end' }} onPress={ModalController.close} />
      <Avatar imageSrc={profileImage} address={address} />
      <FlexView flexDirection="row" alignItems="center" gap="4xs" margin={['s', '0', '0', '0']}>
        <Text variant="large-600">
          {profileName
            ? UiUtil.getTruncateString(profileName, 20, 'end')
            : UiUtil.getTruncateString(testAddress, 8, 'middle')}
        </Text>
        <IconLink icon="copy" size="md" iconColor="fg-250" />
      </FlexView>
      <Text color="fg-200">{balance ?? '0.527 ETH'}</Text>
      {addressExplorerTemplate()}
      <ListItem variant="icon" icon="disconnect" iconVariant="overlay">
        <Text color="fg-200">Disconnect</Text>
      </ListItem>
    </FlexView>
  );
}
