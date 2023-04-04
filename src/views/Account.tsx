import { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Image,
} from 'react-native';
import { DEVICE_HEIGHT } from '../constants/Platform';
import { ClientCtrl } from '../controllers/ClientCtrl';
import DisconnectIcon from '../assets/Disconnect.png';

import { OptionsCtrl } from '../controllers/OptionsCtrl';
import { DarkTheme, LightTheme } from '../constants/Colors';
import { ModalCtrl } from '../controllers/ModalCtrl';
import type { RouterProps } from '../types/routerTypes';
import NavHeader from '../components/NavHeader';

export function Account(_: RouterProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const [address, setAddress] = useState<string | undefined>(
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

  useEffect(() => {
    const unsubscribe = OptionsCtrl.subscribe((state) => {
      setAddress(state.address);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <NavHeader title="Connected Account" />
      <View>
        <Text
          style={[
            styles.text,
            {
              color: isDarkMode
                ? DarkTheme.foreground1
                : LightTheme.foreground1,
            },
          ]}
        >
          Account
        </Text>
        <Text
          style={{
            color: isDarkMode ? DarkTheme.foreground1 : LightTheme.foreground1,
          }}
        >
          {address}
        </Text>
      </View>
      <TouchableOpacity onPress={onDisconnect} style={styles.button}>
        <View style={styles.iconContainer}>
          <Image source={DisconnectIcon} style={styles.icon} />
        </View>
        <Text style={styles.buttonText}>Disconnect</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: DEVICE_HEIGHT * 0.4,
    padding: 16,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
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
    fontWeight: 'bold',
  },
  buttonText: {
    color: LightTheme.accent,
    fontWeight: '600',
    fontSize: 12,
  },
});
