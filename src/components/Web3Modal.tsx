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
import { createUniversalProvider, createSession } from '../utils/ProviderUtil';
import { ModalCtrl } from '../controllers/ModalCtrl';
import { Web3ModalRouter } from './Web3ModalRouter';
import { ExplorerCtrl } from '../controllers/ExplorerCtrl';
import { ConfigCtrl } from '../controllers/ConfigCtrl';
import { OptionsCtrl } from '../controllers/OptionsCtrl';
import { ClientCtrl } from '../controllers/ClientCtrl';
import { useOrientation } from '../hooks/useOrientation';

interface Web3ModalProps {
  projectId: string;
  relayUrl?: string;
  onCopyClipboard?: (value: string) => void;
}

export function Web3Modal({
  projectId,
  relayUrl,
  onCopyClipboard,
}: Web3ModalProps) {
  const modalState = useSnapshot(ModalCtrl.state);
  const isDarkMode = useColorScheme() === 'dark';
  const { width } = useOrientation();

  const onSessionCreated = useCallback(async () => {
    OptionsCtrl.getAccount();
    ModalCtrl.close();
  }, []);

  const onSessionError = useCallback(async () => {
    ModalCtrl.close();
    Alert.alert('Error', 'Error with session');
  }, []);

  const onSessionDelete = useCallback(async ({ topic }: { topic: string }) => {
    const session = ClientCtrl.session();
    if (topic === session?.topic) {
      OptionsCtrl.resetAccount();
      ClientCtrl.clearSession();
    }
  }, []);

  const onDisplayUri = useCallback(async (uri: string) => {
    OptionsCtrl.setSessionUri(uri);
  }, []);

  const onConnect = useCallback(async () => {
    const provider = ClientCtrl.provider();
    try {
      const session = await createSession(provider);
      if (session) {
        ClientCtrl.setSession(session);
        onSessionCreated();
      }
    } catch (error) {
      onSessionError();
    }
  }, [onSessionCreated, onSessionError]);

  useEffect(() => {
    async function fetchWallets() {
      try {
        if (!ExplorerCtrl.state.wallets.total) {
          await ExplorerCtrl.getMobileWallets({ version: 2 });
          OptionsCtrl.setIsDataLoaded(true);
        }
      } catch (error) {
        Alert.alert('Error', 'Error fetching wallets');
      }
    }

    ConfigCtrl.setConfig({ projectId });
    fetchWallets();
  }, [projectId]);

  useEffect(() => {
    async function createProvider() {
      try {
        const provider = await createUniversalProvider({ projectId, relayUrl });
        if (provider) {
          ClientCtrl.setProvider(provider);
          provider.on('display_uri', onDisplayUri);
          provider.on('session_delete', onSessionDelete);
        }
      } catch (error) {
        Alert.alert('Error', 'Error creating provider');
      }
    }
    createProvider();

    return () => {
      // Unsubscribe from events
      const provider = ClientCtrl.provider();
      provider?.removeListener('display_uri', onDisplayUri);
      provider?.removeListener('session_delete', onSessionDelete);
    };
  }, [onDisplayUri, onSessionDelete, projectId, relayUrl]);

  useEffect(() => {
    if (!projectId) {
      Alert.alert('Error', 'Please provide a projectId');
    }
  }, [projectId, relayUrl]);

  return (
    <Modal
      isVisible={modalState.open}
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
