import { useSnapshot } from 'valtio';
import { useState } from 'react';
import { Linking, ScrollView } from 'react-native';
import {
  AccountController,
  ApiController,
  AssetUtil,
  CoreHelperUtil,
  EventsController,
  ModalController,
  OptionsController,
  RouterController,
  SnackController,
  ConstantsUtil,
  SwapController,
  OnRampController,
  ConnectionsController
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

import { useAppKit } from '../../AppKitContext';

import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { AuthButtons } from './components/auth-buttons';
import styles from './styles';

export function AccountDefaultView() {
  const { profileName, profileImage } = useSnapshot(AccountController.state);
  const { loading } = useSnapshot(ModalController.state);
  const {
    activeAddress: address,
    activeBalance: balance,
    activeNetwork,
    activeNamespace,
    connection,
    accountType
  } = useSnapshot(ConnectionsController.state);
  const account = address?.split(':')[2];
  const [disconnecting, setDisconnecting] = useState(false);
  const { features, isOnRampEnabled } = useSnapshot(OptionsController.state);
  const { history } = useSnapshot(RouterController.state);
  const networkImage = AssetUtil.getNetworkImage(activeNetwork?.id);
  const showCopy = OptionsController.isClipboardAvailable();
  const isAuth = connection?.properties?.email || connection?.properties?.username;
  const showBalance = balance && !isAuth;
  const showExplorer = Object.keys(activeNetwork?.blockExplorers ?? {}).length > 0 && !isAuth;
  const showBack = history.length > 1;
  const showSwitchAccountType = isAuth;
  const showActivity =
    !isAuth &&
    activeNamespace &&
    activeNetwork?.caipNetworkId &&
    ConstantsUtil.ACTIVITY_SUPPORTED_CHAINS.includes(activeNetwork.caipNetworkId);
  const showSwaps =
    !isAuth &&
    features?.swaps &&
    activeNetwork?.caipNetworkId &&
    ConstantsUtil.SWAP_SUPPORTED_NETWORKS.includes(activeNetwork.caipNetworkId);
  const { padding } = useCustomDimensions();
  const { disconnect } = useAppKit();

  async function onDisconnect() {
    setDisconnecting(true);
    await disconnect(ConnectionsController.state.activeNamespace);
    setDisconnecting(false);
  }

  const onSwitchAccountType = async () => {
    try {
      if (isAuth && ConnectionsController.state.activeNamespace) {
        const newType = ConnectionsController.state.accountType === 'eoa' ? 'smartAccount' : 'eoa';
        ConnectionsController.setAccountType(
          ConnectionsController.state.activeNamespace,
          ConnectionsController.state.accountType === 'eoa' ? 'smartAccount' : 'eoa'
        );

        EventsController.sendEvent({
          type: 'track',
          event: 'SET_PREFERRED_ACCOUNT_TYPE',
          properties: {
            // eslint-disable-next-line valtio/state-snapshot-rule
            accountType: newType,
            network: ConnectionsController.state.activeNetwork?.caipNetworkId || ''
          }
        });
      }
    } catch (error) {
      ModalController.setLoading(false);
      SnackController.showError('Error switching account type');
    }
  };

  const onExplorerPress = () => {
    if (showExplorer && ConnectionsController.state.activeNetwork?.blockExplorers?.default?.url) {
      Linking.openURL(ConnectionsController.state.activeNetwork?.blockExplorers?.default?.url);
    }
  };

  const onCopyAddress = () => {
    //TODO: Check ENS name
    if (OptionsController.isClipboardAvailable() && ConnectionsController.state.activeAddress) {
      const _address = ConnectionsController.state.activeAddress.split(':')[2];
      if (_address) {
        OptionsController.copyToClipboard(_address);
        SnackController.showSuccess('Address copied');
      }
    }
  };

  const onSwapPress = () => {
    SwapController.resetState();
    EventsController.sendEvent({
      type: 'track',
      event: 'OPEN_SWAP',
      properties: {
        network: ConnectionsController.state.activeNetwork?.caipNetworkId || '',
        isSmartAccount: false
      }
    });
    RouterController.push('Swap');
  };

  const onBuyPress = () => {
    EventsController.sendEvent({
      type: 'track',
      event: 'SELECT_BUY_CRYPTO'
    });

    OnRampController.resetState();
    RouterController.push('OnRamp');
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
    const email = ConnectionsController.state.connection?.properties?.email;
    const provider = ConnectionsController.state.connection?.properties?.provider;
    if (provider !== 'email' || !email) return;
    RouterController.push('UpdateEmailWallet', { email });
  };

  return (
    <>
      {showBack && (
        <IconLink icon="chevronLeft" style={styles.backIcon} onPress={RouterController.goBack} />
      )}
      <IconLink
        icon="close"
        style={styles.closeIcon}
        onPress={ModalController.close}
        testID="header-close"
      />
      <ScrollView bounces={false} fadingEdgeLength={20} style={{ paddingHorizontal: padding }}>
        <FlexView alignItems="center" padding={['3xl', 's', '3xl', 's']}>
          <Avatar imageSrc={profileImage} address={account ?? ''} />
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
                    string: account ?? '',
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
              {CoreHelperUtil.formatBalance(balance.amount, balance.symbol, 6)}
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
                socialProvider={connection?.properties?.provider}
                onPress={onEmailPress}
                style={styles.actionButton}
                text={UiUtil.getTruncateString({
                  string: connection?.properties?.username || connection?.properties?.email || '',
                  charsStart: 30,
                  charsEnd: 0,
                  truncate: 'end'
                })}
              />
            )}
            <ListItem
              chevron
              icon="networkPlaceholder"
              iconColor="accent-100"
              iconBackgroundColor="accent-glass-015"
              imageSrc={networkImage}
              imageHeaders={ApiController._getApiHeaders()}
              onPress={onNetworkPress}
              testID="button-network"
              style={styles.actionButton}
            >
              <Text numberOfLines={1} color="fg-100" testID="account-select-network-text">
                {activeNetwork?.name}
              </Text>
            </ListItem>
            {!isAuth && isOnRampEnabled && (
              <ListItem
                chevron
                icon="card"
                iconColor="accent-100"
                iconBackgroundColor="accent-glass-015"
                onPress={onBuyPress}
                testID="button-onramp"
                style={styles.actionButton}
              >
                <Text color="fg-100">Buy crypto</Text>
              </ListItem>
            )}
            {showSwaps && (
              <ListItem
                chevron
                icon="recycleHorizontal"
                iconColor="accent-100"
                iconBackgroundColor="accent-glass-015"
                onPress={onSwapPress}
                testID="button-swap"
                style={styles.actionButton}
              >
                <Text color="fg-100">Swap</Text>
              </ListItem>
            )}
            {showActivity && (
              <ListItem
                chevron
                icon="clock"
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
                iconColor="accent-100"
                iconBackgroundColor="accent-glass-015"
                style={styles.actionButton}
                loading={loading}
              >
                <Text color="fg-100">{`Switch to your ${
                  accountType === 'eoa' ? 'smart account' : 'EOA'
                }`}</Text>
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
