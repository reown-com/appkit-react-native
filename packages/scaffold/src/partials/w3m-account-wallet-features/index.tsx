import { View } from 'react-native';
import { FlexView, IconLink, Tabs, Text } from '@web3modal/ui-react-native';
import styles from './styles';
import { useState } from 'react';
import { AccountNfts } from '../w3m-account-nfts';
import { AccountActivity } from '../w3m-account-activity';
import { AccountTokens } from '../w3m-account-tokens';

export interface AccountWalletFeaturesProps {
  value: string;
}

export function AccountWalletFeatures() {
  const [activeTab, setActiveTab] = useState(0);

  const onTabChange = (index: number) => {
    setActiveTab(index);
  };

  return (
    <View style={styles.container}>
      <Text color="fg-100" style={styles.balanceText}>
        $4798
        <Text color="fg-200" style={styles.balanceText}>
          .75
        </Text>
      </Text>
      <FlexView style={styles.actionsContainer} flexDirection="row" justifyContent="space-around">
        <IconLink
          icon="arrowBottomCircle"
          size="lg"
          iconColor="accent-100"
          background
          backgroundColor="accent-glass-010"
          pressedColor="accent-glass-020"
          style={[styles.action, styles.actionLeft]}
        />
        <IconLink
          icon="paperplane"
          size="lg"
          iconColor="accent-100"
          background
          backgroundColor="accent-glass-010"
          pressedColor="accent-glass-020"
          style={[styles.action, styles.actionRight]}
        />
      </FlexView>
      <Tabs tabs={['Tokens', 'NFTs', 'Activity']} onTabChange={onTabChange} />
      <FlexView
        alignItems="center"
        justifyContent="center"
        padding="4xl"
        style={styles.tabContainer}
      >
        {activeTab === 0 && <AccountTokens />}
        {activeTab === 1 && <AccountNfts />}
        {activeTab === 2 && <AccountActivity />}
      </FlexView>
    </View>
  );
}
