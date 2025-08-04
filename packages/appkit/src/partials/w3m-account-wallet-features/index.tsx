import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { Balance, FlexView, IconLink, Tabs } from '@reown/appkit-ui-react-native';
import {
  ConnectionsController,
  ConstantsUtil,
  CoreHelperUtil,
  EventsController,
  OnRampController,
  OptionsController,
  RouterController,
  SwapController
} from '@reown/appkit-core-react-native';
import type { Balance as BalanceType } from '@reown/appkit-common-react-native';
import { AccountActivity } from '../w3m-account-activity';
import { AccountTokens } from '../w3m-account-tokens';
import styles from './styles';

export interface AccountWalletFeaturesProps {
  isBalanceLoading: boolean;
}

export function AccountWalletFeatures({ isBalanceLoading }: AccountWalletFeaturesProps) {
  const [activeTab, setActiveTab] = useState(0);
  const { features, isOnRampEnabled } = useSnapshot(OptionsController.state);
  const { activeNetwork, balances, activeNamespace } = useSnapshot(ConnectionsController.state);
  const balance = CoreHelperUtil.calculateAndFormatBalance(balances as BalanceType[]);
  const network = ConnectionsController.state.activeNetwork?.caipNetworkId || '';
  const isSmartAccount = ConnectionsController.state.accountType === 'smartAccount';
  const showSend =
    activeNamespace && ConstantsUtil.SEND_SUPPORTED_NAMESPACES.includes(activeNamespace);
  const isSwapsEnabled =
    features?.swaps &&
    activeNetwork?.caipNetworkId &&
    ConstantsUtil.SWAP_SUPPORTED_NETWORKS.includes(activeNetwork.caipNetworkId);

  const onTabChange = (index: number) => {
    setActiveTab(index);
    if (index === 2) {
      onTransactionsPress();
    }
  };

  const onTransactionsPress = () => {
    EventsController.sendEvent({
      type: 'track',
      event: 'CLICK_TRANSACTIONS',
      properties: { isSmartAccount }
    });
  };

  const onSwapPress = () => {
    SwapController.resetState();
    EventsController.sendEvent({
      type: 'track',
      event: 'OPEN_SWAP',
      properties: { network, isSmartAccount }
    });
    RouterController.push('Swap');
  };

  const onSendPress = () => {
    EventsController.sendEvent({
      type: 'track',
      event: 'OPEN_SEND',
      properties: { network, isSmartAccount }
    });
    RouterController.push('WalletSend');
  };

  const onReceivePress = () => {
    RouterController.push('WalletReceive');
  };

  const onBuyPress = () => {
    EventsController.sendEvent({
      type: 'track',
      event: 'SELECT_BUY_CRYPTO'
    });
    OnRampController.resetState();
    RouterController.push('OnRamp');
  };

  return (
    <FlexView style={styles.container} alignItems="center">
      <Balance integer={balance.dollars} decimal={balance.pennies} />
      <FlexView
        style={styles.actionsContainer}
        flexDirection="row"
        justifyContent="space-around"
        padding={['0', 's', '0', 's']}
      >
        {isOnRampEnabled ? <IconLink
            icon="card"
            size="lg"
            iconColor="accent-100"
            background
            backgroundColor="accent-glass-010"
            pressedColor="accent-glass-020"
            style={[styles.action, isSwapsEnabled ? styles.actionCenter : styles.actionLeft]}
            onPress={onBuyPress}
          /> : null}
        {isSwapsEnabled ? <IconLink
            icon="recycleHorizontal"
            size="lg"
            iconColor="accent-100"
            background
            backgroundColor="accent-glass-010"
            pressedColor="accent-glass-020"
            style={[styles.action, styles.actionLeft]}
            onPress={onSwapPress}
          /> : null}
        <IconLink
          icon="arrowBottomCircle"
          size="lg"
          iconColor="accent-100"
          background
          backgroundColor="accent-glass-010"
          pressedColor="accent-glass-020"
          style={[styles.action, isSwapsEnabled ? styles.actionCenter : styles.actionLeft]}
          onPress={onReceivePress}
        />
        {showSend ? <IconLink
            icon="paperplane"
            size="lg"
            iconColor="accent-100"
            background
            backgroundColor="accent-glass-010"
            pressedColor="accent-glass-020"
            style={[styles.action, styles.actionRight]}
            onPress={onSendPress}
          /> : null}
      </FlexView>
      <FlexView style={styles.tab}>
        <Tabs tabs={['Tokens', 'Activity']} onTabChange={onTabChange} />
      </FlexView>
      <FlexView padding={['m', '0', '0', '0']} style={styles.tabContainer}>
        {activeTab === 0 && (
          <AccountTokens style={styles.tabContent} isLoading={isBalanceLoading} />
        )}
        {activeTab === 1 && <AccountActivity style={styles.tabContent} />}
      </FlexView>
    </FlexView>
  );
}
