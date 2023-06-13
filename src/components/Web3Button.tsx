import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { useSnapshot } from 'valtio';

import { ModalCtrl } from '../controllers/ModalCtrl';
import { AccountCtrl } from '../controllers/AccountCtrl';
import { ClientCtrl } from '../controllers/ClientCtrl';
import useTheme from '../hooks/useTheme';
import Touchable from './Touchable';

interface Props {
  style?: StyleProp<ViewStyle>;
}

export function Web3Button({ style }: Props) {
  const Theme = useTheme();
  const { isConnected } = useSnapshot(AccountCtrl.state);
  const { initialized } = useSnapshot(ClientCtrl.state);

  return (
    <Touchable
      onPress={() => ModalCtrl.open()}
      style={[
        styles.container,
        { backgroundColor: Theme.accent, borderColor: Theme.overlayThin },
        style,
      ]}
      disabled={!initialized}
    >
      {initialized ? (
        isConnected ? (
          <Text style={styles.text}>View Account</Text>
        ) : (
          <Text style={styles.text}>Connect</Text>
        )
      ) : (
        <ActivityIndicator color="white" />
      )}
    </Touchable>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    width: 150,
    height: 50,
    borderWidth: 1,
  },
  text: {
    color: 'white',
    fontWeight: '700',
  },
});
