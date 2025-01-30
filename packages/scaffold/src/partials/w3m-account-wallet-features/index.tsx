import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { Balance, FlexView, IconLink, Tabs } from '@reown/appkit-ui-react-native';
import {
  AccountController,
  ConstantsUtil,
  CoreHelperUtil,
  EventsController,
  NetworkController,
  OptionsController,
  RouterController,
  SwapController
} from '@reown/appkit-core-react-native';
import type { Balance as BalanceType } from '@reown/appkit-common-react-native';
import { AccountActivity } from '../w3m-account-activity';
import { AccountTokens } from '../w3m-account-tokens';
import styles from './styles';

export interface AccountWalletFeaturesProps {
  value: string;
}

export function AccountWalletFeatures() {
  const [activeTab, setActiveTab] = useState(0);
  const { tokenBalance } = useSnapshot(AccountController.state);
  const { features, isOnRampEnabled } = useSnapshot(OptionsController.state);
  const balance = CoreHelperUtil.calculateAndFormatBalance(tokenBalance as BalanceType[]);
  const isSwapsEnabled = features?.swaps;
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
      properties: {
        isSmartAccount: AccountController.state.preferredAccountType === 'smartAccount'
      }
    });
  };

  const onSwapPress = () => {
    if (
      NetworkController.state.caipNetwork?.id &&
      !ConstantsUtil.SWAP_SUPPORTED_NETWORKS.includes(`${NetworkController.state.caipNetwork.id}`)
    ) {
      RouterController.push('UnsupportedChain');
    } else {
      SwapController.resetState();
      EventsController.sendEvent({
        type: 'track',
        event: 'OPEN_SWAP',
        properties: {
          network: NetworkController.state.caipNetwork?.id || '',
          isSmartAccount: AccountController.state.preferredAccountType === 'smartAccount'
        }
      });
      RouterController.push('Swap');
    }
  };

  const onSendPress = () => {
    EventsController.sendEvent({
      type: 'track',
      event: 'OPEN_SEND',
      properties: {
        network: NetworkController.state.caipNetwork?.id || '',
        isSmartAccount: AccountController.state.preferredAccountType === 'smartAccount'
      }
    });
    RouterController.push('WalletSend');
  };

  const onReceivePress = () => {
    RouterController.push('WalletReceive');
  };

  const onCardPress = () => {
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
        {isOnRampEnabled && (
          <IconLink
            icon="card"
            size="lg"
            iconColor="accent-100"
            background
            backgroundColor="accent-glass-010"
            pressedColor="accent-glass-020"
            style={[styles.action, isSwapsEnabled ? styles.actionCenter : styles.actionLeft]}
            onPress={onCardPress}
          />
        )}
        {isSwapsEnabled && (
          <IconLink
            icon="recycleHorizontal"
            size="lg"
            iconColor="accent-100"
            background
            backgroundColor="accent-glass-010"
            pressedColor="accent-glass-020"
            style={[styles.action, styles.actionLeft]}
            onPress={onSwapPress}
          />
        )}
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
        <IconLink
          icon="paperplane"
          size="lg"
          iconColor="accent-100"
          background
          backgroundColor="accent-glass-010"
          pressedColor="accent-glass-020"
          style={[styles.action, styles.actionRight]}
          onPress={onSendPress}
        />
      </FlexView>
      <FlexView style={styles.tab}>
        <Tabs tabs={['Tokens', 'Activity']} onTabChange={onTabChange} />
      </FlexView>
      <FlexView padding={['m', '0', '0', '0']} style={styles.tabContainer}>
        {activeTab === 0 && <AccountTokens style={styles.tabContent} />}
        {activeTab === 1 && <AccountActivity style={styles.tabContent} />}
      </FlexView>
    </FlexView>
  );
}
