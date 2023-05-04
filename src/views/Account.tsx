import { useCallback } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Image,
} from 'react-native';
import { useSnapshot } from 'valtio';

import { ClientCtrl } from '../controllers/ClientCtrl';
import DisconnectIcon from '../assets/Disconnect.png';
import { AccountCtrl } from '../controllers/AccountCtrl';
import { DarkTheme, LightTheme } from '../constants/Colors';
import { ModalCtrl } from '../controllers/ModalCtrl';
import type { RouterProps } from '../types/routerTypes';
import NavHeader from '../components/NavHeader';

export function Account({ isPortrait, windowHeight }: RouterProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const accountState = useSnapshot(AccountCtrl.state);

  const onDisconnect = useCallback(async () => {
    try {
      ClientCtrl.provider()?.disconnect();
      ModalCtrl.close();
    } catch (err: unknown) {
      Alert.alert('Error', 'Error disconnecting');
    }
  }, []);

  return (
    <>
      <NavHeader title="Connected Account" />
      <View
        style={[
          styles.container,
          { height: isPortrait ? windowHeight * 0.3 : windowHeight * 0.6 },
        ]}
      >
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
          {accountState.address}
        </Text>
        <TouchableOpacity onPress={onDisconnect} style={styles.button}>
          <View style={styles.iconContainer}>
            <Image source={DisconnectIcon} style={styles.icon} />
          </View>
          <Text style={styles.buttonText}>Disconnect</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
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
