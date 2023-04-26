import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSnapshot } from 'valtio';

import { ModalCtrl } from '../controllers/ModalCtrl';
import { LightTheme } from '../constants/Colors';
import { AccountCtrl } from '../controllers/AccountCtrl';

export function Web3Button() {
  const accountState = useSnapshot(AccountCtrl.state);

  return (
    <TouchableOpacity onPress={() => ModalCtrl.open()} style={styles.container}>
      {accountState.isConnected ? (
        <Text style={styles.text}>View Account</Text>
      ) : (
        <Text style={styles.text}>Connect</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: LightTheme.accent,
    borderRadius: 20,
    width: 150,
    height: 50,
    borderWidth: 1,
    borderColor: LightTheme.overlayThin,
  },
  text: {
    color: 'white',
    fontWeight: '700',
  },
});
