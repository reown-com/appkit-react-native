import { useSnapshot } from 'valtio';
import { Linking, ScrollView } from 'react-native';
import {
  AccountController,
  ApiController,
  AssetUtil,
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
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';

export function AccountView() {
  const { address, profileName, profileImage, balance, balanceSymbol, addressExplorerUrl } =
    useSnapshot(AccountController.state);

  const [disconnecting, setDisconnecting] = useState(false);
  const { caipNetwork } = useSnapshot(NetworkController.state);
  const networkImage = AssetUtil.getNetworkImage(caipNetwork);
  const showCopy = OptionsController.isClipboardAvailable();
  const { padding } = useCustomDimensions();

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
    if (address) {
      OptionsController.copyToClipboard(profileName ?? address);
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
    <>
      <IconLink icon="close" style={styles.closeIcon} onPress={ModalController.close} />
      <ScrollView bounces={false} fadingEdgeLength={20} style={{ paddingHorizontal: padding }}>
        <FlexView alignItems="center" padding={['3xl', 's', '3xl', 's']}>
          <Avatar imageSrc={profileImage} address={profileName ?? address} />
          <FlexView flexDirection="row" alignItems="center" margin={['s', '0', '0', '0']}>
            <Text variant="medium-title-600">
              {profileName
                ? UiUtil.getTruncateString({
                    string: profileName,
                    charsStart: 20,
                    charsEnd: 0,
                    truncate: 'end'
                  })
                : UiUtil.getTruncateString({
                    string: address ?? '',
                    charsStart: 4,
                    charsEnd: 6,
                    truncate: 'middle'
                  })}
            </Text>
            {showCopy && (
              <IconLink
                icon="copy"
                size="md"
                iconColor="fg-250"
                onPress={onCopyAddress}
                style={styles.copyButton}
              />
            )}
          </FlexView>
          {balance && (
            <Text variant="paragraph-400" color="fg-200">
              {CoreHelperUtil.formatBalance(balance, balanceSymbol)}
            </Text>
          )}
          {addressExplorerTemplate()}
          <FlexView margin={['s', '0', '0', '0']}>
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
              style={styles.disconnectButton}
            >
              <Text color="fg-200">Disconnect</Text>
            </ListItem>
          </FlexView>
        </FlexView>
      </ScrollView>
    </>
  );
}
