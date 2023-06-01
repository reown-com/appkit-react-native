import { View, Alert, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useSnapshot } from 'valtio';
import { SvgXml } from 'react-native-svg';

import { ClientCtrl } from '../controllers/ClientCtrl';
import DisconnectIcon from '../assets/Disconnect';
import CopyIcon from '../assets/CopySmall';
import { AccountCtrl } from '../controllers/AccountCtrl';
import { LightTheme } from '../constants/Colors';
import { ModalCtrl } from '../controllers/ModalCtrl';
import { UiUtil } from '../utils/UiUtil';
import Web3Text from '../components/Web3Text';
import type { RouterProps } from 'src/types/routerTypes';
import Web3Avatar from '../components/Web3Avatar';
import ConnectionBadge from '../components/ConnectionBadge';

export function Account({ onCopyClipboard }: RouterProps) {
  const accountState = useSnapshot(AccountCtrl.state);

  const onDisconnect = () => {
    try {
      ClientCtrl.provider()?.disconnect();
      ModalCtrl.close();
    } catch (err: unknown) {
      Alert.alert('Error', 'Error disconnecting');
    }
  };

  const onCopy = () => {
    if (onCopyClipboard && accountState.address) {
      onCopyClipboard(accountState.address);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Web3Avatar
              address={accountState.address ?? ''}
              style={styles.avatar}
            />
            <Web3Text style={styles.address}>
              {UiUtil.truncate(accountState.address ?? '')}
            </Web3Text>
          </View>
          <ConnectionBadge />
        </View>
        <View style={styles.footer}>
          {onCopyClipboard && (
            <TouchableOpacity onPress={onCopy} style={styles.button}>
              <View style={styles.iconContainer}>
                <SvgXml xml={CopyIcon} height={14} width={14} fill="white" />
              </View>
              <Text style={styles.buttonText}>Copy address</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onDisconnect} style={styles.button}>
            <View style={styles.iconContainer}>
              <SvgXml xml={DisconnectIcon} width={14} fill="white" />
            </View>
            <Text style={styles.buttonText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
  },
  header: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  avatar: {
    height: 70,
    width: 70,
    borderRadius: 100,
    marginBottom: 10,
  },
  address: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LightTheme.accent,
    borderRadius: 100,
    height: 30,
    width: 30,
    marginBottom: 4,
  },
  icon: {
    height: 14,
    width: 14,
    tintColor: 'white',
  },
  disconnectIcon: {
    height: 13,
  },
  button: {
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: LightTheme.accent,
    fontWeight: '600',
    fontSize: 13,
  },
});
