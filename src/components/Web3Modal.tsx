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
import { SUBSCRIBER_EVENTS } from '@walletconnect/core';

import { DarkTheme, LightTheme } from '../constants/Colors';
import Background from '../assets/Background.png';
import Web3ModalHeader from './Web3ModalHeader';
import { createUniversalProvider, createSession } from '../utils/ProviderUtil';
import { ModalCtrl } from '../controllers/ModalCtrl';
import { Web3ModalRouter } from './Web3ModalRouter';
import { ExplorerCtrl } from '../controllers/ExplorerCtrl';
import { ConfigCtrl } from '../controllers/ConfigCtrl';
import { AccountCtrl } from '../controllers/AccountCtrl';
import { ClientCtrl } from '../controllers/ClientCtrl';
import { useOrientation } from '../hooks/useOrientation';
import { OptionsCtrl } from '../controllers/OptionsCtrl';
import { WcConnectionCtrl } from '../controllers/WcConnectionCtrl';
import type { ProviderMetadata } from '../types/coreTypes';

interface Web3ModalProps {
  projectId: string;
  providerOptions: ProviderMetadata;
  relayUrl?: string;
  onCopyClipboard?: (value: string) => void;
}

export function Web3Modal({
  projectId,
  providerOptions,
  relayUrl,
  onCopyClipboard,
}: Web3ModalProps) {
  const modalState = useSnapshot(ModalCtrl.state);
  const isDarkMode = useColorScheme() === 'dark';
  const { width } = useOrientation();

  const resetApp = useCallback(() => {
    ClientCtrl.resetSession();
    AccountCtrl.resetAccount();
    WcConnectionCtrl.resetConnection();
  }, []);

  const onSessionCreated = useCallback(async () => {
    AccountCtrl.getAccount();
    ModalCtrl.close();
  }, []);

  const onSessionError = useCallback(async () => {
    ModalCtrl.close();
    Alert.alert('Error', 'Error with session');
  }, []);

  const onSessionDelete = useCallback(
    ({ topic }: { topic: string }) => {
      const sessionTopic = ClientCtrl.sessionTopic();
      if (topic === sessionTopic) {
        resetApp();
      }
    },
    [resetApp]
  );

  const onDisplayUri = useCallback(async (uri: string) => {
    WcConnectionCtrl.setPairingUri(uri);
  }, []);

  const onConnect = useCallback(async () => {
    const provider = ClientCtrl.provider();
    try {
      const session = await createSession(provider);
      if (session) {
        ClientCtrl.setSessionTopic(session.topic);
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
        const provider = await createUniversalProvider({
          projectId,
          relayUrl,
          metadata: providerOptions,
        });
        if (provider) {
          ClientCtrl.setProvider(provider);
          provider.on('display_uri', onDisplayUri);
          provider.client.core.relayer.subscriber.on(
            SUBSCRIBER_EVENTS.deleted,
            onSessionDelete
          );
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
      provider?.client.core.relayer.subscriber.removeListener(
        SUBSCRIBER_EVENTS.deleted,
        onSessionDelete
      );
    };
  }, [providerOptions, onDisplayUri, onSessionDelete, projectId, relayUrl]);

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
