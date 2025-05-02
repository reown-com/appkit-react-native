import { StyleSheet } from 'react-native';
import { FlexView } from '@reown/appkit-ui-react-native';
import { useAppKitAccount } from '@reown/appkit-react-native';

import { EthersActionsView } from './EthersActionsView';
import { SolanaActionsView } from './SolanaActionsView';

export function ActionsView() {
  const isConnected = true;
  const { chainId } = useAppKitAccount();

  return isConnected ? (
    <FlexView style={styles.container}>
      {chainId?.startsWith('eip155') ? <EthersActionsView /> : <SolanaActionsView />}
    </FlexView>
  ) : null;
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    gap: 8
  }
});
