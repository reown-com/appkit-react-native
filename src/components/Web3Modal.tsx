import { useCallback, useEffect } from 'react';
import {
  StyleSheet,
  useColorScheme,
  ImageBackground,
  Alert,
  SafeAreaView,
} from 'react-native';
import Modal from 'react-native-modal';
import { useSnapshot } from 'valtio';

import { DarkTheme, LightTheme } from '../constants/Colors';
import Background from '../assets/Background.png';
import Web3ModalHeader from './Web3ModalHeader';
import { createSession } from '../utils/ProviderUtil';
import { ModalCtrl } from '../controllers/ModalCtrl';
import { Web3ModalRouter } from './Web3ModalRouter';
import { AccountCtrl } from '../controllers/AccountCtrl';
import { ClientCtrl } from '../controllers/ClientCtrl';
import { useOrientation } from '../hooks/useOrientation';
import type { ProviderMetadata, SessionParams } from '../types/coreTypes';
import { useConfigure } from '../hooks/useConfigure';
import { defaultSessionParams } from '../constants/Config';
import { ConfigCtrl } from '../controllers/ConfigCtrl';
import { setDeepLinkWallet } from '../utils/StorageUtil';

interface Web3ModalProps {
  projectId: string;
  providerMetadata: ProviderMetadata;
  sessionParams?: SessionParams;
  relayUrl?: string;
  onCopyClipboard?: (value: string) => void;
}

export function Web3Modal({
  projectId,
  providerMetadata,
  sessionParams = defaultSessionParams,
  relayUrl,
  onCopyClipboard,
}: Web3ModalProps) {
  useConfigure({ projectId, providerMetadata, relayUrl });
  const { open } = useSnapshot(ModalCtrl.state);
  const isDarkMode = useColorScheme() === 'dark';
  const { width } = useOrientation();

  const onSessionCreated = useCallback(async () => {
    const deepLink = ConfigCtrl.getRecentWalletDeepLink();
    try {
      if (deepLink) {
        await setDeepLinkWallet(deepLink);
        ConfigCtrl.setRecentWalletDeepLink(undefined);
      }
      AccountCtrl.getAccount();
      ModalCtrl.close();
    } catch (error) {
      Alert.alert('Error', 'Error setting deep link wallet');
    }
  }, []);

  const onSessionError = useCallback(async () => {
    ConfigCtrl.setRecentWalletDeepLink(undefined);
    ModalCtrl.close();
    Alert.alert('Error', 'Error with session');
  }, []);

  const onConnect = useCallback(async () => {
    const provider = ClientCtrl.provider();
    try {
      if (!provider) throw new Error('Provider not initialized');

      const session = await createSession(provider, sessionParams);
      if (session) {
        ClientCtrl.setSessionTopic(session.topic);
        onSessionCreated();
      }
    } catch (error) {
      onSessionError();
    }
  }, [onSessionCreated, onSessionError, sessionParams]);

  useEffect(() => {
    if (!projectId) {
      Alert.alert('Error', 'Please provide a projectId');
    }
  }, [projectId]);

  return (
    <Modal
      isVisible={open}
      style={styles.modal}
      propagateSwipe
      hideModalContentWhileAnimating
      onBackdropPress={ModalCtrl.close}
      onModalWillShow={onConnect}
      useNativeDriver
    >
      <ImageBackground
        style={{ width }}
        source={Background}
        imageStyle={styles.wcImage}
      >
        <Web3ModalHeader onClose={ModalCtrl.close} />
        <SafeAreaView
          style={[
            styles.connectWalletContainer,
            isDarkMode && styles.connectWalletContainerDark,
          ]}
        >
          <Web3ModalRouter onCopyClipboard={onCopyClipboard} />
        </SafeAreaView>
      </ImageBackground>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  wcImage: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  connectWalletContainer: {
    backgroundColor: LightTheme.background1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  connectWalletContainerDark: {
    backgroundColor: DarkTheme.background1,
  },
});
