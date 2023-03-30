import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  useColorScheme,
  ImageBackground,
  Alert,
} from 'react-native';
import Modal from 'react-native-modal';

import { DEVICE_WIDTH } from '../constants/Platform';
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

interface Web3ModalProps {
  projectId: string;
  relayUrl: string;
}

export function Web3Modal({ projectId, relayUrl }: Web3ModalProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const isDarkMode = useColorScheme() === 'dark';

  const onSessionCreated = useCallback(async () => {
    OptionsCtrl.getAccount();
    ModalCtrl.close();
  }, []);

  const onSessionError = useCallback(async () => {
    // TODO: Improve this, check why is alerting a lot, and check MaxListeners warning
    // ModalCtrl.close();
    // Alert.alert('Error', 'Error creating session');
  }, []);

  const onSessionDelete = useCallback(async ({ topic }: { topic: string }) => {
    const session = ClientCtrl.session();
    if (topic === session?.topic) {
      OptionsCtrl.resetAccount();
      ClientCtrl.clearSession();
    }
  }, []);

  const onConnect = useCallback(async () => {
    const provider = ClientCtrl.provider();
    createSession(provider)
      .then((session) => {
        if (session) {
          ClientCtrl.setSession(session);
          onSessionCreated();
        }
      })
      .catch(() => {
        onSessionError();
      });
  }, [onSessionCreated, onSessionError]);

  const subscribeToEvents = useCallback(async () => {
    const provider = ClientCtrl.provider();
    if (provider) {
      provider.on('display_uri', (uri: string) => {
        OptionsCtrl.setSessionUri(uri);
      });

      // Subscribe to session ping
      provider.on(
        'session_ping',
        ({ id, topic }: { id: string; topic: any }) => {
          console.log('session_ping', id, topic);
        }
      );

      // Subscribe to session event
      provider.on(
        'session_event',
        ({ event, chainId }: { event: any; chainId: string }) => {
          console.log('session_event', event, chainId);
        }
      );

      // Subscribe to session update
      provider.on(
        'session_update',
        ({ topic, params }: { topic: any; params: any }) => {
          console.log('session_update', topic, params);
        }
      );

      // Subscribe to session delete
      provider.on('session_delete', onSessionDelete);
    }
  }, [onSessionDelete]);

  useEffect(() => {
    const unsubscribeModal = ModalCtrl.subscribe((modalState) => {
      setModalVisible(modalState.open);
    });

    return () => {
      unsubscribeModal();
    };
  }, []);

  useEffect(() => {
    ConfigCtrl.setConfig({ projectId });
    if (!ExplorerCtrl.state.wallets.total) {
      ExplorerCtrl.getAllWallets().then(() => {
        OptionsCtrl.setIsDataLoaded(true);
      });
    }
  }, [projectId]);

  useEffect(() => {
    function createProvider() {
      createUniversalProvider({ projectId, relayUrl })
        .then((provider) => {
          ClientCtrl.setProvider(provider);
          subscribeToEvents();
        })
        .catch(() => {
          Alert.alert('Error', 'Error creating provider');
        });
    }
    createProvider();
  }, [projectId, relayUrl, subscribeToEvents]);

  useEffect(() => {
    if (!projectId) {
      Alert.alert('Error', 'Please provide a projectId');
    } else if (!relayUrl) {
      Alert.alert('Error', 'Please provide a relayUrl');
    }
  }, [projectId, relayUrl]);

  return (
    <Modal
      isVisible={modalVisible}
      style={styles.modal}
      propagateSwipe
      hideModalContentWhileAnimating
      onBackdropPress={ModalCtrl.close}
      onModalWillShow={onConnect}
      useNativeDriver
    >
      <ImageBackground
        style={styles.wcContainer}
        source={Background}
        imageStyle={styles.wcImage}
      >
        <Web3ModalHeader onClose={ModalCtrl.close} />
        <View
          style={[
            styles.connectWalletContainer,
            isDarkMode && styles.connectWalletContainerDark,
          ]}
        >
          <Web3ModalRouter />
        </View>
      </ImageBackground>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  wcContainer: {
    width: DEVICE_WIDTH,
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
