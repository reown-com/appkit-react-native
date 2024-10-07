import { useSnapshot } from 'valtio';
import { Platform, ScrollView, View } from 'react-native';
import {
  ConnectorController,
  EventUtil,
  EventsController,
  OptionsController,
  RouterController,
  type WcWallet
} from '@reown/appkit-core-react-native';
import { FlexView, Icon, ListItem, Separator, Spacing, Text } from '@reown/appkit-ui-react-native';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { ConnectEmailInput } from './components/connect-email-input';
import { useKeyboard } from '../../hooks/useKeyboard';
import { ConnectorList } from './components/connectors-list';
import { CustomWalletList } from './components/custom-wallet-list';
import { AllWalletsButton } from './components/all-wallets-button';
import { AllWalletList } from './components/all-wallet-list';
import { RecentWalletList } from './components/recent-wallet-list';
import { SocialLoginList } from './components/social-login-list';
import styles from './styles';
import { WalletGuide } from './components/wallet-guide';

export function ConnectView() {
  const connectors = ConnectorController.state.connectors;
  const { authLoading } = useSnapshot(ConnectorController.state);
  const { features } = useSnapshot(OptionsController.state);
  const { padding } = useCustomDimensions();
  const { keyboardShown, keyboardHeight } = useKeyboard();

  const isWalletConnectEnabled = connectors.some(c => c.type === 'WALLET_CONNECT');
  const isAuthEnabled = connectors.some(c => c.type === 'AUTH');
  const isCoinbaseEnabled = connectors.some(c => c.type === 'COINBASE');
  const isEmailEnabled = isAuthEnabled && features?.email;
  const isSocialEnabled = isAuthEnabled && features?.socials && features?.socials.length > 0;
  const showConnectWalletsButton =
    isWalletConnectEnabled && isAuthEnabled && !features?.emailShowWallets;
  const showSeparator =
    isAuthEnabled &&
    (isEmailEnabled || isSocialEnabled) &&
    (isWalletConnectEnabled || isCoinbaseEnabled);

  const paddingBottom = Platform.select({
    android: keyboardShown ? keyboardHeight + Spacing['2xl'] : Spacing['2xl'],
    default: Spacing['2xl']
  });

  const onWalletPress = (wallet: WcWallet, isInstalled?: boolean) => {
    const connector = connectors.find(c => c.explorerId === wallet.id);
    if (connector) {
      RouterController.push('ConnectingExternal', { connector, wallet });
    } else {
      RouterController.push('ConnectingWalletConnect', { wallet });
    }

    const platform = EventUtil.getWalletPlatform(wallet, isInstalled);
    EventsController.sendEvent({
      type: 'track',
      event: 'SELECT_WALLET',
      properties: {
        name: wallet.name ?? connector?.name ?? 'Unknown',
        platform,
        explorer_id: wallet.id
      }
    });
  };

  const onViewAllPress = () => {
    RouterController.push('AllWallets');
    EventsController.sendEvent({ type: 'track', event: 'CLICK_ALL_WALLETS' });
  };

  return (
    <ScrollView style={{ paddingHorizontal: padding }} bounces={false}>
      <FlexView padding={['xs', '0', '0', '0']} style={{ paddingBottom }}>
        {isEmailEnabled && <ConnectEmailInput loading={authLoading} />}
        {isSocialEnabled && <SocialLoginList options={features?.socials} disabled={authLoading} />}
        {showSeparator && <Separator text="or" style={styles.socialSeparator} />}

        <FlexView padding={['0', 's', '0', 's']}>
          {showConnectWalletsButton ? (
            <ListItem contentStyle={styles.connectWalletButton} onPress={onViewAllPress}>
              <Icon name="wallet" size="lg" />
              <Text variant="paragraph-500">Connect wallet</Text>
              <View style={styles.connectWalletEmpty} />
            </ListItem>
          ) : (
            <>
              <RecentWalletList
                itemStyle={styles.item}
                onWalletPress={onWalletPress}
                isWalletConnectEnabled={isWalletConnectEnabled}
              />
              <AllWalletList
                itemStyle={styles.item}
                onWalletPress={onWalletPress}
                isWalletConnectEnabled={isWalletConnectEnabled}
              />
              <CustomWalletList
                itemStyle={styles.item}
                onWalletPress={onWalletPress}
                isWalletConnectEnabled={isWalletConnectEnabled}
              />
              <ConnectorList
                itemStyle={styles.item}
                isWalletConnectEnabled={isWalletConnectEnabled}
              />
              <AllWalletsButton
                itemStyle={styles.item}
                onPress={onViewAllPress}
                isWalletConnectEnabled={isWalletConnectEnabled}
              />
            </>
          )}
          {isAuthEnabled && <WalletGuide guide="get-started" />}
        </FlexView>
      </FlexView>
    </ScrollView>
  );
}
