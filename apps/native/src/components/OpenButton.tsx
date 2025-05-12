import { StyleSheet } from 'react-native';
import { Button } from '@reown/appkit-ui-react-native';
import { useAppKit } from '@reown/appkit-react-native';
import { useAccount } from 'wagmi';

export function OpenButton() {
  const { open } = useAppKit();
  const { isConnected } = useAccount();

  return !isConnected ? (
    <Button testID="open-hook-button" style={styles.button} onPress={() => open()}>
      Open hook
    </Button>
  ) : null;
}

const styles = StyleSheet.create({
  button: {
    height: 40,
    marginVertical: 8
  }
});
