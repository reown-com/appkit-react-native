import React, { useCallback } from 'react';
import { Image } from 'react-native';
import { View, Text, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { DEVICE_HEIGHT } from '../constants/Platform';
import { ClientCtrl } from '../controllers/ClientCtrl';
import DisconnectIcon from '../assets/Disconnect.png';

import { OptionsCtrl } from '../controllers/OptionsCtrl';
import { LightTheme } from '../constants/Colors';
import { ModalCtrl } from '../controllers/ModalCtrl';

export function Account() {
  const [address, setAddress] = React.useState<string | undefined>(
    OptionsCtrl.state.address
  );

  const onDisconnect = useCallback(async () => {
    try {
      ClientCtrl.provider().disconnect();
      ClientCtrl.clearSession();
      OptionsCtrl.resetAccount();
      ModalCtrl.close();
    } catch (err: unknown) {
      Alert.alert('Error', 'Error disconnecting');
    }
  }, []);

  React.useEffect(() => {
    const unsubscribe = OptionsCtrl.subscribe((state) => {
      setAddress(state.address);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View>
        <Text>Account</Text>
        <Text>{address}</Text>
      </View>
      <TouchableOpacity onPress={onDisconnect} style={styles.button}>
        <View style={styles.iconContainer}>
          <Image source={DisconnectIcon} style={styles.icon} />
        </View>
        <Text style={styles.text}>Disconnect</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: DEVICE_HEIGHT * 0.3,
    padding: 16,
    justifyContent: 'space-between',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LightTheme.accent,
    borderRadius: 100,
    height: 32,
    width: 32,
    marginBottom: 4,
  },
  icon: {
    height: 15,
  },
  text: {
    color: LightTheme.accent,
    fontWeight: '600',
    fontSize: 12,
  },
});
