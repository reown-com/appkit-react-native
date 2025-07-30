import { useSnapshot } from 'valtio';
import { useCallback, useEffect } from 'react';
import { useWindowDimensions, StatusBar } from 'react-native';
import { Card, Modal, ThemeProvider } from '@reown/appkit-ui-react-native';
import {
  ApiController,
  EventsController,
  ModalController,
  OptionsController,
  RouterController,
  ThemeController,
  ConnectionsController
} from '@reown/appkit-core-react-native';
import { SIWEController } from '@reown/appkit-siwe-react-native';

import { AppKitRouter } from '../w3m-router';
import { Header } from '../../partials/w3m-header';
import { Snackbar } from '../../partials/w3m-snackbar';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { useAppKit } from '../../AppKitContext';
import styles from './styles';

export function AppKit() {
  const { disconnect } = useAppKit();
  const { open } = useSnapshot(ModalController.state);
  const { themeMode, themeVariables } = useSnapshot(ThemeController.state);
  const { projectId } = useSnapshot(OptionsController.state);
  const { height } = useWindowDimensions();
  const { isLandscape } = useCustomDimensions();
  const portraitHeight = height - 80;
  const landScapeHeight = height * 0.95 - (StatusBar.currentHeight ?? 0);

  const onBackButtonPress = () => {
    if (RouterController.state.history.length > 1) {
      return RouterController.goBack();
    }

    return handleClose();
  };

  const prefetch = useCallback(async () => {
    await ApiController.prefetch();
    EventsController.sendEvent({ type: 'track', event: 'MODAL_LOADED' });
  }, []);

  const handleClose = async () => {
    if (OptionsController.state.isSiweEnabled) {
      const session = await SIWEController.getSession();
      if (
        !session &&
        SIWEController.state.status !== 'success' &&
        ConnectionsController.state.activeNamespace === 'eip155' &&
        !!ConnectionsController.state.activeAddress
      ) {
        await disconnect();
      }
    }

    if (
      RouterController.state.view === 'OnRampLoading' &&
      EventsController.state.data.event === 'BUY_SUBMITTED'
    ) {
      // Send event only if the onramp url was already created
      EventsController.sendEvent({ type: 'track', event: 'BUY_CANCEL' });
    }
  };
  useEffect(() => {
    if (projectId) {
      prefetch();
    }
  }, [projectId, prefetch]);

  return (
    <>
      <ThemeProvider themeMode={themeMode} themeVariables={themeVariables}>
        <Modal
          visible={open}
          onDismiss={handleClose}
          onRequestClose={onBackButtonPress}
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
      </ThemeProvider>
    </>
  );
}
