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
  type AppKitFrameProvider
} from '@reown/appkit-core-react-native';
import {
  Avatar,
  Button,
  FlexView,
  IconLink,
  Text,
  UiUtil,
  Spacing,
  ListItem
} from '@reown/appkit-ui-react-native';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { UpgradeWalletButton } from './components/upgrade-wallet-button';
import styles from './styles';

export function AccountDefaultView() {
  const { address, profileName, profileImage, balance, balanceSymbol, addressExplorerUrl } =
    useSnapshot(AccountController.state);
  const [disconnecting, setDisconnecting] = useState(false);
  const { caipNetwork } = useSnapshot(NetworkController.state);
  const { connectedConnector } = useSnapshot(ConnectorController.state);
  const { history } = useSnapshot(RouterController.state);
  const networkImage = AssetUtil.getNetworkImage(caipNetwork);
  const showCopy = OptionsController.isClipboardAvailable();
  const isAuth = connectedConnector === 'AUTH';
  const showBalance = balance && !isAuth;
  const showExplorer = addressExplorerUrl && !isAuth;
  const showBack = history.length > 1;
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

  const getUserEmail = () => {
    const provider = ConnectorController.getAuthConnector()?.provider as AppKitFrameProvider;
    if (!provider) return '';

    return provider.getEmail();
  };

  const onExplorerPress = () => {
    if (AccountController.state.addressExplorerUrl) {
      Linking.openURL(AccountController.state.addressExplorerUrl);
    }
  };

  const onCopyAddress = () => {
    if (AccountController.state.address) {
      OptionsController.copyToClipboard(
        AccountController.state.profileName ?? AccountController.state.address
      );
      SnackController.showSuccess('Address copied');
    }
  };

  const onActivityPress = () => {
    RouterController.push('Transactions');
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

  const onEmailPress = () => {
    RouterController.push('UpdateEmailWallet', { email: getUserEmail() });
  };

  return (
    <>
      {showBack && (
        <IconLink icon="chevronLeft" style={styles.backIcon} onPress={RouterController.goBack} />
      )}
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
                iconColor="fg-275"
                onPress={onCopyAddress}
                style={styles.copyButton}
              />
            )}
          </FlexView>
          {showBalance && (
            <Text variant="paragraph-400" color="fg-200">
              {CoreHelperUtil.formatBalance(balance, balanceSymbol)}
            </Text>
          )}
          {showExplorer && (
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
          )}
          <FlexView margin={['s', '0', '0', '0']}>
            {isAuth && (
              <>
                <UpgradeWalletButton onPress={onUpgradePress} style={styles.upgradeButton} />
                <ListItem
                  icon="mail"
                  onPress={onEmailPress}
                  chevron
                  testID="button-email"
                  style={styles.actionButton}
                >
                  <Text color="fg-100">{getUserEmail()}</Text>
                </ListItem>
              </>
            )}
            <ListItem
              chevron
              icon="networkPlaceholder"
              iconBackgroundColor="gray-glass-010"
              imageSrc={networkImage}
              imageHeaders={ApiController._getApiHeaders()}
              onPress={onNetworkPress}
              testID="button-network"
              style={styles.actionButton}
            >
              <Text numberOfLines={1} color="fg-100">
                {caipNetwork?.name}
              </Text>
            </ListItem>
            {!isAuth && (
              <ListItem
                chevron
                icon="swapHorizontal"
                iconColor="accent-100"
                iconBackgroundColor="accent-glass-015"
                onPress={onActivityPress}
                testID="button-activity"
                style={styles.actionButton}
              >
                <Text color="fg-100">Activity</Text>
              </ListItem>
            )}
            <ListItem
              icon="disconnect"
              onPress={onDisconnect}
              loading={disconnecting}
              iconBackgroundColor="gray-glass-010"
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
