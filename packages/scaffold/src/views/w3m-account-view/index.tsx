import { useSnapshot } from 'valtio';
import { useState } from 'react';
import { Linking, ScrollView } from 'react-native';
import {
  AccountController,
  ApiController,
  AssetUtil,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  EventsController,
  ModalController,
  NetworkController,
  OptionsController,
  RouterController,
  SnackController,
  type W3mFrameProvider
} from '@reown/core-react-native';
import {
  Avatar,
  Button,
  FlexView,
  IconLink,
  Text,
  UiUtil,
  Spacing,
  ListItem
} from '@reown/ui-react-native';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { UpgradeWalletButton } from './components/upgrade-wallet-button';
import styles from './styles';

export function AccountView() {
  const { address, profileName, profileImage, balance, balanceSymbol, addressExplorerUrl } =
    useSnapshot(AccountController.state);
  const [disconnecting, setDisconnecting] = useState(false);
  const { caipNetwork } = useSnapshot(NetworkController.state);
  const { connectedConnector } = useSnapshot(ConnectorController.state);
  const networkImage = AssetUtil.getNetworkImage(caipNetwork);
  const showCopy = OptionsController.isClipboardAvailable();
  const isEmail = connectedConnector === 'EMAIL';
  const { padding } = useCustomDimensions();

  async function onDisconnect() {
    try {
      setDisconnecting(true);
      await ConnectionController.disconnect();
      AccountController.setIsConnected(false);
      ModalController.close();
      setDisconnecting(false);
      EventsController.sendEvent({
        type: 'track',
        event: 'DISCONNECT_SUCCESS'
      });
    } catch (error) {
      EventsController.sendEvent({
        type: 'track',
        event: 'DISCONNECT_ERROR'
      });
    }
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

  const onNetworkPress = () => {
    RouterController.push('Networks');

    EventsController.sendEvent({
      type: 'track',
      event: 'CLICK_NETWORKS'
    });
  };

  const onUpgradePress = () => {
    EventsController.sendEvent({ type: 'track', event: 'EMAIL_UPGRADE_FROM_MODAL' });
    RouterController.push('UpgradeEmailWallet');
  };

  const getUserEmail = () => {
    const provider = ConnectorController.getEmailConnector()?.provider as W3mFrameProvider;
    if (!provider) return '';

    return provider.getEmail();
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
            {isEmail && (
              <>
                <UpgradeWalletButton onPress={onUpgradePress} style={styles.upgradeButton} />
                <ListItem
                  variant="icon"
                  icon="mail"
                  iconVariant="overlay"
                  onPress={() =>
                    RouterController.push('UpdateEmailWallet', { email: getUserEmail() })
                  }
                  chevron
                  testID="button-email"
                >
                  <Text color="fg-100">{getUserEmail()}</Text>
                </ListItem>
              </>
            )}
            <ListItem
              variant={networkImage ? 'image' : 'icon'}
              chevron
              icon="networkPlaceholder"
              iconVariant="overlay"
              imageSrc={networkImage}
              imageHeaders={ApiController._getApiHeaders()}
              onPress={onNetworkPress}
              testID="button-network"
              style={styles.networkButton}
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
              testID="button-disconnect"
            >
              <Text color="fg-200">Disconnect</Text>
            </ListItem>
          </FlexView>
        </FlexView>
      </ScrollView>
    </>
  );
}
