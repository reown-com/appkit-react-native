import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { Balance, FlexView, IconLink, Tabs } from '@reown/appkit-ui-react-native';
import {
  AccountController,
  CoreHelperUtil,
  EventsController,
  NetworkController,
  RouterController
} from '@reown/appkit-core-react-native';
import type { Balance as BalanceType } from '@reown/appkit-common-react-native';
import { AccountNfts } from '../w3m-account-nfts';
import { AccountActivity } from '../w3m-account-activity';
import { AccountTokens } from '../w3m-account-tokens';
import styles from './styles';

export interface AccountWalletFeaturesProps {
  value: string;
}

export function AccountWalletFeatures() {
  const [activeTab, setActiveTab] = useState(0);
  const { tokenBalance } = useSnapshot(AccountController.state);
  const balance = CoreHelperUtil.calculateAndFormatBalance(tokenBalance as BalanceType[]);

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

  return (
    <FlexView style={styles.container} alignItems="center">
      <Balance integer={balance.dollars} decimal={balance.pennies} />
      <FlexView
        style={styles.actionsContainer}
        flexDirection="row"
        justifyContent="space-around"
        padding={['0', 's', '0', 's']}
      >
        <IconLink
          icon="arrowBottomCircle"
          size="lg"
          iconColor="accent-100"
          background
          backgroundColor="accent-glass-010"
          pressedColor="accent-glass-020"
          style={[styles.action, styles.actionLeft]}
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
        <Tabs tabs={['Tokens', 'NFTs', 'Activity']} onTabChange={onTabChange} />
      </FlexView>
      <FlexView padding={['m', '0', '0', '0']} style={styles.tabContainer}>
        {activeTab === 0 && <AccountTokens style={styles.tabContent} />}
        {activeTab === 1 && <AccountNfts />}
        {activeTab === 2 && <AccountActivity style={styles.tabContent} />}
      </FlexView>
    </FlexView>
  );
}
