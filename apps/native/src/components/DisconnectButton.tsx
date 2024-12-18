import { StyleSheet } from 'react-native';
import { Button } from '@reown/appkit-ui-react-native';
import { useAccount, useDisconnect } from 'wagmi';

export function DisconnectButton() {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  return isConnected ? (
    <Button testID="disconnect-hook-button" style={styles.button} onPress={() => disconnect()}>
      Disconnect hook
    </Button>
  ) : null;
}

const styles = StyleSheet.create({
  button: {
    height: 40,
    marginVertical: 8
  }
});
