import React, { useEffect } from 'react';

import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ModalCtrl } from '../controllers/ModalCtrl';
import { LightTheme } from '../constants/Colors';
import { OptionsCtrl } from '../controllers/OptionsCtrl';

export function Web3Button() {
  const [isConnected, setIsConnected] = React.useState<boolean | undefined>(
    OptionsCtrl.state.isConnected
  );

  useEffect(() => {
    const unsubscribeAccount = OptionsCtrl.subscribe(
      ({ isConnected: connected }) => {
        setIsConnected(connected);
      }
    );
    return () => {
      unsubscribeAccount();
    };
  }, []);

  return (
    <TouchableOpacity
      onPress={() => ModalCtrl.open()}
      style={styles.blueButton}
    >
      {isConnected ? (
        <Text style={styles.blueButtonText}>View Account</Text>
      ) : (
        <Text style={styles.blueButtonText}>Connect</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  blueButton: {
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
  blueButtonText: {
    color: 'white',
    fontWeight: '700',
  },
});
