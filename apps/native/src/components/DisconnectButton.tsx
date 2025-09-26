import { StyleSheet } from 'react-native';
import { useAccount, useAppKit } from '@reown/appkit-react-native';
import { Button } from '@reown/appkit-ui-react-native';

export function DisconnectButton() {
  const { disconnect } = useAppKit();
  const { isConnected } = useAccount();

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
