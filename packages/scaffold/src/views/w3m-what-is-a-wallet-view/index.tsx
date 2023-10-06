import { ScrollView } from 'react-native';
import { Button, FlexView, Text, Visual } from '@web3modal/ui-react-native';
import { RouterController } from '@web3modal/core-react-native';
import styles from './styles';

export function WhatIsAWalletView() {
  return (
    <ScrollView bounces={false} fadingEdgeLength={20}>
      <FlexView alignItems="center" rowGap="xs" padding="l">
        <FlexView flexDirection="row" columnGap="s" padding={['0', '0', 'xs', '0']}>
          <Visual name="login" />
          <Visual name="profile" />
          <Visual name="lock" />
        </FlexView>
        <Text variant="paragraph-500">One login for all of web3</Text>
        <Text variant="small-500" color="fg-200" center>
          Log in to any app by connecting your wallet. Say goodbye to countless passwords!
        </Text>
        <FlexView flexDirection="row" columnGap="s" padding={['xs', '0', 'xs', '0']}>
          <Visual name="defi" />
          <Visual name="nft" />
          <Visual name="eth" />
        </FlexView>
        <Text variant="paragraph-500">A home for your digital assets</Text>
        <Text variant="small-500" color="fg-200" center>
          A wallet lets you store, send and receive digital assets like cryptocurrencies and NFTs.
        </Text>
        <FlexView flexDirection="row" columnGap="s" padding={['xs', '0', 'xs', '0']}>
          <Visual name="browser" />
          <Visual name="noun" />
          <Visual name="dao" />
        </FlexView>
        <Text variant="paragraph-500">Your gateway to a new web</Text>
        <Text variant="small-500" color="fg-200" center>
          With your wallet, you can explore and interact with DeFi, NFTs, DAOs, and much more.
        </Text>
        <Button
          size="sm"
          iconLeft="wallet"
          style={styles.getWalletButton}
          onPress={() => RouterController.push('GetWallet')}
        >
          Get a Wallet
        </Button>
      </FlexView>
    </ScrollView>
  );
}
