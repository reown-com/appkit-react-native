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

import styles from './styles';
import { AuthButtons } from './components/auth-buttons';

export function AccountDefaultView() {
  const {
    address,
    profileName,
    profileImage,
    balance,
    balanceSymbol,
    addressExplorerUrl,
    preferredAccountType
  } = useSnapshot(AccountController.state);
  const { loading } = useSnapshot(ModalController.state);
  const [disconnecting, setDisconnecting] = useState(false);
  const { caipNetwork } = useSnapshot(NetworkController.state);
  const { connectedConnector } = useSnapshot(ConnectorController.state);
  const { connectedSocialProvider } = useSnapshot(ConnectionController.state);
  const { history } = useSnapshot(RouterController.state);
  const networkImage = AssetUtil.getNetworkImage(caipNetwork);
  const showCopy = OptionsController.isClipboardAvailable();
  const isAuth = connectedConnector === 'AUTH';
  const showBalance = balance && !isAuth;
  const showExplorer = addressExplorerUrl && !isAuth;
  const showBack = history.length > 1;
  const showSwitchAccountType = isAuth && NetworkController.checkIfSmartAccountEnabled();
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

  const onSwitchAccountType = async () => {
    try {
      if (isAuth) {
        ModalController.setLoading(true);
        const accountType =
          AccountController.state.preferredAccountType === 'eoa' ? 'smartAccount' : 'eoa';
        const provider = ConnectorController.getAuthConnector()?.provider as AppKitFrameProvider;
        await provider?.setPreferredAccount(accountType);
        EventsController.sendEvent({
          type: 'track',
          event: 'SET_PREFERRED_ACCOUNT_TYPE',
          properties: {
            accountType,
            network: NetworkController.state.caipNetwork?.id || ''
          }
        });
      }
    } catch (error) {
      ModalController.setLoading(false);
      SnackController.showError('Error switching account type');
    }
  };

  const getUserEmail = () => {
    const provider = ConnectorController.getAuthConnector()?.provider as AppKitFrameProvider;
    if (!provider) return '';

    return provider.getEmail();
  };

  const getUsername = () => {
    const provider = ConnectorController.getAuthConnector()?.provider as AppKitFrameProvider;
    if (!provider) return '';

    return provider.getUsername();
  };

  const onExplorerPress = () => {
    if (AccountController.state.addressExplorerUrl) {
      Linking.openURL(AccountController.state.addressExplorerUrl);
    }
  };

  const onCopyAddress = () => {
    if (AccountController.state.profileName) {
      OptionsController.copyToClipboard(AccountController.state.profileName);
      SnackController.showSuccess('Name copied');
    } else if (AccountController.state.address) {
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
    if (ConnectionController.state.connectedSocialProvider) return;
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
          <Avatar imageSrc={profileImage} address={address} />
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
              <AuthButtons
                onUpgradePress={onUpgradePress}
                socialProvider={connectedSocialProvider}
                onPress={onEmailPress}
                style={styles.actionButton}
                text={UiUtil.getTruncateString({
                  string: getUsername() || getUserEmail() || '',
                  charsStart: 30,
                  charsEnd: 0,
                  truncate: 'end'
                })}
              />
            )}
            <ListItem
              chevron
              icon="networkPlaceholder"
              iconBackgroundColor="gray-glass-010"
              imageSrc={networkImage}
              imageHeaders={ApiController._getApiHeaders()}
              onPress={onNetworkPress}
              testID="w3m-account-select-network"
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
            {showSwitchAccountType && (
              <ListItem
                chevron
                icon="swapHorizontal"
                onPress={onSwitchAccountType}
                testID="account-button-type"
                style={styles.actionButton}
                loading={loading}
              >
                <Text color="fg-100">{`Switch to your ${
                  preferredAccountType === 'eoa' ? 'smart account' : 'EOA'
                }`}</Text>
              </ListItem>
            )}
            <ListItem
              icon="disconnect"
              onPress={onDisconnect}
              loading={disconnecting}
              iconBackgroundColor="gray-glass-010"
              testID="disconnect-button"
            >
              <Text color="fg-200">Disconnect</Text>
            </ListItem>
          </FlexView>
        </FlexView>
      </ScrollView>
    </>
  );
}
