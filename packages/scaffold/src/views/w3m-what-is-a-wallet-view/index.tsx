import { ScrollView } from 'react-native';
import { Button, FlexView, Text, Visual } from '@reown/appkit-ui-react-native';
import { EventsController, RouterController } from '@reown/appkit-core-react-native';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';

export function WhatIsAWalletView() {
  const { padding } = useCustomDimensions();

  const onGetWalletPress = () => {
    RouterController.push('GetWallet');
    EventsController.sendEvent({ type: 'track', event: 'CLICK_GET_WALLET' });
  };

  return (
    <ScrollView
      bounces={false}
      fadingEdgeLength={20}
      style={{ paddingHorizontal: padding }}
      testID="what-is-a-wallet-view"
    >
      <FlexView alignItems="center" padding={['xs', '4xl', 'xl', '4xl']}>
        <FlexView flexDirection="row" padding={['0', '0', 's', '0']}>
          <Visual name="login" />
          <Visual name="profile" style={styles.visual} />
          <Visual name="lock" />
        </FlexView>
        <Text variant="paragraph-500" style={styles.text}>
          Your web3 account
        </Text>
        <Text variant="small-500" color="fg-200" center>
          Create a wallet with your email or by choosing a wallet provider.
        </Text>
        <FlexView flexDirection="row" padding={['xl', '0', 's', '0']}>
          <Visual name="defi" />
          <Visual name="nft" style={styles.visual} />
          <Visual name="eth" />
        </FlexView>
        <Text variant="paragraph-500" style={styles.text}>
          The home for your digital assets
        </Text>
        <Text variant="small-500" color="fg-200" center>
          Store, send, and receive digital assets like crypto and NFTs.
        </Text>
        <FlexView flexDirection="row" padding={['xl', '0', 's', '0']}>
          <Visual name="browser" />
          <Visual name="noun" style={styles.visual} />
          <Visual name="dao" />
        </FlexView>
        <Text variant="paragraph-500" style={styles.text}>
          Your gateway to web3 apps
        </Text>
        <Text variant="small-500" color="fg-200" center>
          Connect your wallet to start exploring DeFi, DAOs, and much more.
        </Text>
        <Button
          size="sm"
          iconLeft="walletSmall"
          style={styles.getWalletButton}
          onPress={onGetWalletPress}
          testID="get-a-wallet-button"
        >
          Get a wallet
        </Button>
      </FlexView>
    </ScrollView>
  );
}
