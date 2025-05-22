import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useState } from 'react';
import { useWindowDimensions, StatusBar } from 'react-native';
import Modal from 'react-native-modal';
import { Card, ThemeProvider } from '@reown/appkit-ui-react-native';
import {
  AccountController,
  ApiController,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  EventsController,
  ModalController,
  OptionsController,
  RouterController,
  TransactionsController,
  type CaipAddress,
  type AppKitFrameProvider,
  ThemeController,
  NetworkController
} from '@reown/appkit-core-react-native';
import { SIWEController } from '@reown/appkit-siwe-react-native';

import { AppKitRouter } from '../w3m-router';
import { Header } from '../../partials/w3m-header';
import { Snackbar } from '../../partials/w3m-snackbar';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';

export function AppKit() {
  const { open, loading } = useSnapshot(ModalController.state);
  const { connectors, connectedConnector } = useSnapshot(ConnectorController.state);
  const { caipAddress, isConnected } = useSnapshot(AccountController.state);
  const { caipNetwork } = useSnapshot(NetworkController.state);
  const { themeMode, themeVariables } = useSnapshot(ThemeController.state);
  const [isNetworkStateStable, setIsNetworkStateStable] = useState(false);
  const { height } = useWindowDimensions();
  const { isLandscape } = useCustomDimensions();
  const portraitHeight = height - 120;
  const landScapeHeight = height * 0.95 - (StatusBar.currentHeight ?? 0);
  const authProvider = connectors.find(c => c.type === 'AUTH')?.provider as AppKitFrameProvider;
  const AuthView = authProvider?.AuthView;
  const SocialView = authProvider?.Webview;
  const showAuth = !connectedConnector || connectedConnector === 'AUTH';

  const onBackButtonPress = () => {
    if (RouterController.state.history.length > 1) {
      return RouterController.goBack();
    }

    return handleClose();
  };

  const prefetch = async () => {
    await ApiController.prefetch();
    EventsController.sendEvent({ type: 'track', event: 'MODAL_LOADED' });
  };

  const handleClose = async () => {
    if (OptionsController.state.isSiweEnabled) {
      if (SIWEController.state.status !== 'success' && AccountController.state.isConnected) {
        await ConnectionController.disconnect();
      }
    }
  };

  const onNewAddress = useCallback(
    async (address?: CaipAddress) => {
      if (!isConnected || loading) {
        return;
      }

      const newAddress = CoreHelperUtil.getPlainAddress(address);
      TransactionsController.resetTransactions();

      if (OptionsController.state.isSiweEnabled) {
        const newNetworkId = CoreHelperUtil.getNetworkId(address);

        const { signOutOnAccountChange, signOutOnNetworkChange } =
          SIWEController.state._client?.options ?? {};
        const session = await SIWEController.getSession();

        if (session && newAddress && signOutOnAccountChange) {
          // If the address has changed and signOnAccountChange is enabled, sign out
          await SIWEController.signOut();
          onSiweNavigation();
        } else if (
          newNetworkId &&
          session?.chainId.toString() !== newNetworkId &&
          signOutOnNetworkChange
        ) {
          // If the network has changed and signOnNetworkChange is enabled, sign out
          await SIWEController.signOut();
          onSiweNavigation();
        } else if (!session) {
          // If it's connected but there's no session, show sign view
          onSiweNavigation();
        }
      }
    },
    [isConnected, loading]
  );

  const onSiweNavigation = () => {
    if (ModalController.state.open) {
      RouterController.push('ConnectingSiwe');
    } else {
      ModalController.open({ view: 'ConnectingSiwe' });
    }
  };

  useEffect(() => {
    prefetch();
  }, []);

  useEffect(() => {
    onNewAddress(caipAddress);
  }, [caipAddress, onNewAddress]);

  useEffect(() => {
    if (isConnected) {
      const timer = setTimeout(() => {
        setIsNetworkStateStable(true);
      }, 750); // Stability period. Sometimes the network state updates at init

      return () => {
        clearTimeout(timer);
      };
    } else {
      setIsNetworkStateStable(false);

      return () => {};
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected && caipNetwork && isNetworkStateStable) {
      const isNetworkSupported = NetworkController.isActiveNetworkInRequestedNetworks();
      if (!isNetworkSupported) {
        const currentView = RouterController.state.view;
        // Only push/open if not already on UnsupportedChain or actively choosing a network
        if (currentView !== 'UnsupportedChain' && currentView !== 'Networks') {
          if (ModalController.state.open) {
            RouterController.push('UnsupportedChain');
          } else {
            ModalController.open({ view: 'UnsupportedChain' });
          }
        }
      }
    }
  }, [caipNetwork, isConnected, isNetworkStateStable]);

  return (
    <>
      <ThemeProvider themeMode={themeMode} themeVariables={themeVariables}>
        <Modal
          style={styles.modal}
          coverScreen={false}
          isVisible={open}
          useNativeDriver
          useNativeDriverForBackdrop
          statusBarTranslucent
          hideModalContentWhileAnimating
          propagateSwipe
          onModalHide={handleClose}
          onBackdropPress={ModalController.close}
          onBackButtonPress={onBackButtonPress}
          testID="w3m-modal"
        >
          <Card
            style={[styles.card, { maxHeight: isLandscape ? landScapeHeight : portraitHeight }]}
          >
            <Header />
            <AppKitRouter />
            <Snackbar />
          </Card>
        </Modal>
        {!!showAuth && AuthView && <AuthView />}
        {!!showAuth && SocialView && <SocialView />}
      </ThemeProvider>
    </>
  );
}
