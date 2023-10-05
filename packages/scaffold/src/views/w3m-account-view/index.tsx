import { useSnapshot } from 'valtio';
import { Linking } from 'react-native';
import {
  AccountController,
  ApiController,
  AssetController,
  ConnectionController,
  CoreHelperUtil,
  ModalController,
  NetworkController,
  OptionsController,
  RouterController,
  SnackController
} from '@web3modal/core-react-native';
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
import { useState } from 'react';

export function AccountView() {
  const { address, profileName, profileImage, balance, balanceSymbol, addressExplorerUrl } =
    useSnapshot(AccountController.state);

  const [disconnecting, setDisconnecting] = useState(false);
  const { networkImages } = useSnapshot(AssetController.state);
  const { caipNetwork } = useSnapshot(NetworkController.state);
  const clipboardClient = OptionsController._getClipboardClient();
  const networkImage = networkImages[caipNetwork?.imageId ?? ''];

  async function onDisconnect() {
    setDisconnecting(true);
    await ConnectionController.disconnect();
    AccountController.setIsConnected(false);
    ModalController.close();
    setDisconnecting(false);
  }

  const onExplorerPress = () => {
    if (addressExplorerUrl) {
      Linking.openURL(addressExplorerUrl);
    }
  };

  const onCopyAddress = () => {
    if (clipboardClient && address) {
      clipboardClient.setString(profileName ?? address);
      SnackController.showSuccess('Address copied');
    }
  };

  const addressExplorerTemplate = () => {
    if (!addressExplorerUrl) return null;

    return (
      <Button
        size="sm"
        variant="shade"
        iconLeft="compass"
        iconRight="externalLink"
        onPress={onExplorerPress}
        style={{ marginVertical: Spacing.s }}
      >
        Block Explorer
      </Button>
    );
  };

  return (
    <FlexView alignItems="center" padding="s">
      <IconLink icon="close" style={{ alignSelf: 'flex-end' }} onPress={ModalController.close} />
      <Avatar imageSrc={profileImage} address={profileName ?? address} />
      <FlexView flexDirection="row" alignItems="center" gap="4xs" margin={['s', '0', '0', '0']}>
        <Text variant="large-600">
          {profileName
            ? UiUtil.getTruncateString(profileName, 20, 0, 'end')
            : UiUtil.getTruncateString(address ?? '', 4, 6, 'middle')}
        </Text>
        {clipboardClient && (
          <IconLink icon="copy" size="md" iconColor="fg-250" onPress={onCopyAddress} />
        )}
      </FlexView>
      {balance && (
        <Text color="fg-200">{CoreHelperUtil.formatBalance(balance, balanceSymbol)}</Text>
      )}
      {addressExplorerTemplate()}
      <FlexView gap="xs" margin={['s', '0', '0', '0']}>
        <ListItem
          variant={networkImage ? 'image' : 'icon'}
          chevron
          icon="networkPlaceholder"
          iconVariant="overlay"
          imageSrc={networkImage}
          imageHeaders={ApiController._getApiHeaders()}
          onPress={() => RouterController.push('Networks')}
        >
          <Text numberOfLines={1} color="fg-100">
            {caipNetwork?.name}
          </Text>
        </ListItem>
        <ListItem
          variant="icon"
          icon="disconnect"
          iconVariant="overlay"
          onPress={onDisconnect}
          loading={disconnecting}
        >
          <Text color="fg-200">Disconnect</Text>
        </ListItem>
      </FlexView>
    </FlexView>
  );
}
