import { StyleSheet } from 'react-native';
import { FlexView } from '@reown/appkit-ui-react-native';
import { useAccount } from '@reown/appkit-react-native';

// import { EthersActionsView } from './EthersActionsView';
import { SolanaActionsView } from './SolanaActionsView';
import { BitcoinActionsView } from './BitcoinActionsView';
import { WagmiActionsView } from './WagmiActionsView';

export function ActionsView() {
  const isConnected = true;
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
    </FlexView>
  ) : null;
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    gap: 8
  }
});
