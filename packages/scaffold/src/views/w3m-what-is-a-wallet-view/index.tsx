import { ScrollView } from 'react-native';
import { Button, FlexView, Text, Visual } from '@web3modal/ui-react-native';
import { RouterController } from '@web3modal/core-react-native';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';

export function WhatIsAWalletView() {
  const { padding } = useCustomDimensions();

  return (
    <ScrollView bounces={false} fadingEdgeLength={20} style={{ paddingHorizontal: padding }}>
      <FlexView alignItems="center" padding={['l', '4xl', '3xl', '4xl']}>
        <FlexView flexDirection="row" padding={['0', '0', 'xs', '0']}>
          <Visual name="login" />
          <Visual name="profile" style={styles.visual} />
          <Visual name="lock" />
        </FlexView>
        <Text variant="paragraph-500" style={styles.text}>
          One login for all of web3
        </Text>
        <Text variant="small-500" color="fg-200" center>
          Log in to any app by connecting your wallet. Say goodbye to countless passwords!
        </Text>
        <FlexView flexDirection="row" padding={['3xl', '0', 'xs', '0']}>
          <Visual name="defi" />
          <Visual name="nft" style={styles.visual} />
          <Visual name="eth" />
        </FlexView>
        <Text variant="paragraph-500" style={styles.text}>
          A home for your digital assets
        </Text>
        <Text variant="small-500" color="fg-200" center>
          A wallet lets you store, send and receive digital assets like cryptocurrencies and NFTs.
        </Text>
        <FlexView flexDirection="row" padding={['3xl', '0', 'xs', '0']}>
          <Visual name="browser" />
          <Visual name="noun" style={styles.visual} />
          <Visual name="dao" />
        </FlexView>
        <Text variant="paragraph-500" style={styles.text}>
          Your gateway to a new web
        </Text>
        <Text variant="small-500" color="fg-200" center>
          With your wallet, you can explore and interact with DeFi, NFTs, DAOs, and much more.
        </Text>
        <Button
          size="sm"
          iconLeft="walletSmall"
          style={styles.getWalletButton}
          onPress={() => RouterController.push('GetWallet')}
        >
          Get a wallet
        </Button>
      </FlexView>
    </ScrollView>
  );
}
