import { useSnapshot } from 'valtio';
import { useEffect } from 'react';
import { useWindowDimensions, StatusBar } from 'react-native';
import Modal from 'react-native-modal';
import { Card, ThemeProvider } from '@reown/appkit-ui-react-native';
import {
  AccountController,
  ApiController,
  ConnectionController,
  ConnectorController,
  EventsController,
  ModalController,
  OptionsController,
  RouterController,
  type AppKitFrameProvider,
  ThemeController
} from '@reown/appkit-core-react-native';
import { SIWEController } from '@reown/appkit-siwe-react-native';

import { AppKitRouter } from '../w3m-router';
import { Header } from '../../partials/w3m-header';
import { Snackbar } from '../../partials/w3m-snackbar';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';

const disableCloseViews = ['UnsupportedChain', 'ConnectingSiwe'];

export function AppKit() {
  const { open } = useSnapshot(ModalController.state);
  const { connectors, connectedConnector } = useSnapshot(ConnectorController.state);

  const { themeMode, themeVariables } = useSnapshot(ThemeController.state);
  const { height } = useWindowDimensions();
  const { isLandscape } = useCustomDimensions();
  const portraitHeight = height - 120;
  const landScapeHeight = height * 0.95 - (StatusBar.currentHeight ?? 0);
  const authProvider = connectors.find(c => c.type === 'AUTH')?.provider as AppKitFrameProvider;
  const AuthView = authProvider?.AuthView;
  const SocialView = authProvider?.Webview;
  const showAuth = !connectedConnector || connectedConnector === 'AUTH';

  const onBackdropPress = () => {
    if (disableCloseViews.includes(RouterController.state.view)) {
      return;
    }

    return ModalController.close();
  };

  const onBackButtonPress = () => {
    if (disableCloseViews.includes(RouterController.state.view)) {
      return;
    }

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

  useEffect(() => {
    prefetch();
  }, []);

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
          onBackdropPress={onBackdropPress}
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
