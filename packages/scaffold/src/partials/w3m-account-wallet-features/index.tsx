import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { View } from 'react-native';
import { Balance, FlexView, IconLink, Tabs } from '@web3modal/ui-react-native';
import {
  AccountController,
  CoreHelperUtil,
  EventsController,
  RouterController,
  SnackController
} from '@web3modal/core-react-native';
import type { Balance as BalanceType } from '@web3modal/common-react-native';
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
        isSmartAccount: false
      }
    });
  };

  // TODO: Implement this features
  const onMissingPress = () => {
    SnackController.showError('Feature not implemented');
  };

  const onReceivePress = () => {
    RouterController.push('WalletReceive');
  };

  return (
    <View style={styles.container}>
      <Balance integer={balance.dollars} decimal={balance.pennies} />
      <FlexView style={styles.actionsContainer} flexDirection="row" justifyContent="space-around">
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
          onPress={onMissingPress}
        />
      </FlexView>
      <Tabs tabs={['Tokens', 'NFTs', 'Activity']} onTabChange={onTabChange} />
      <FlexView padding={['m', '0', '0', '0']} style={[styles.tabContainer]}>
        {activeTab === 0 && <AccountTokens />}
        {activeTab === 1 && <AccountNfts />}
        {activeTab === 2 && <AccountActivity />}
      </FlexView>
    </View>
  );
}
