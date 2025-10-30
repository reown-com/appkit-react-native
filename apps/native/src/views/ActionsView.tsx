import { StyleSheet } from 'react-native';
import { Button, FlexView } from '@reown/appkit-ui-react-native';
import { useAccount, useAppKit, useAppKitState } from '@reown/appkit-react-native';

// import { EthersActionsView } from './EthersActionsView';
import { SolanaActionsView } from './SolanaActionsView';
import { BitcoinActionsView } from './BitcoinActionsView';
import { WagmiActionsView } from './WagmiActionsView';

export function ActionsView() {
  const { switchNetwork, disconnect } = useAppKit();
  const { isConnected } = useAppKitState();
  const { namespace } = useAccount();

  return isConnected ? (
    <FlexView style={styles.container}>
      {namespace === 'eip155' ? (
        <WagmiActionsView />
      ) : namespace === 'solana' ? (
        <SolanaActionsView />
      ) : namespace === 'bip122' ? (
        <BitcoinActionsView />
      ) : null}
      <Button onPress={() => switchNetwork('eip155:1')}>Switch to mainnet</Button>
      <Button onPress={() => disconnect()}>Disconnect</Button>
    </FlexView>
  ) : null;
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    gap: 8
  }
});
