import { useSnapshot } from 'valtio';
import { Platform, ScrollView } from 'react-native';
import {
  ConnectorController,
  EventUtil,
  EventsController,
  RouterController,
  type WcWallet
} from '@reown/appkit-core-react-native';
import { FlexView, Spacing } from '@reown/appkit-ui-react-native';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { ConnectEmailInput } from './components/connect-email-input';
import { useKeyboard } from '../../hooks/useKeyboard';
import { ConnectorList } from './components/connectors-list';
import { CustomWalletList } from './components/custom-wallet-list';
import { AllWalletsButton } from './components/all-wallets-button';
import { AllWalletList } from './components/all-wallet-list';
import { RecentWalletList } from './components/recent-wallet-list';
import styles from './styles';

export function ConnectView() {
  const { connectors, emailLoading } = useSnapshot(ConnectorController.state);
  const { padding } = useCustomDimensions();
  const { keyboardShown, keyboardHeight } = useKeyboard();

  const isWalletConnectEnabled = connectors.some(c => c.type === 'WALLET_CONNECT');
  const isEmailEnabled = connectors.some(c => c.type === 'EMAIL');
  const isCoinbaseEnabled = connectors.some(c => c.type === 'COINBASE');

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
        <ConnectEmailInput
          isEmailEnabled={isEmailEnabled}
          showSeparator={isWalletConnectEnabled || isCoinbaseEnabled}
          loading={emailLoading}
        />
        <FlexView padding={['0', 's', '0', 's']}>
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
          <ConnectorList itemStyle={styles.item} isWalletConnectEnabled={isWalletConnectEnabled} />
          <AllWalletsButton
            itemStyle={styles.item}
            onPress={onViewAllPress}
            isWalletConnectEnabled={isWalletConnectEnabled}
          />
        </FlexView>
      </FlexView>
    </ScrollView>
  );
}
