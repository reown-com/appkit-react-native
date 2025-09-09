import { useSnapshot } from 'valtio';
import { useCallback, useEffect } from 'react';
import { Card, Modal, ThemeProvider } from '@reown/appkit-ui-react-native';
import {
  ApiController,
  EventsController,
  ModalController,
  OptionsController,
  RouterController,
  ThemeController
} from '@reown/appkit-core-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppKitRouter } from '../w3m-router';
import { Header } from '../../partials/w3m-header';
import { Snackbar } from '../../partials/w3m-snackbar';
import { useInternalAppKit } from '../../AppKitContext';
import styles from './styles';

export function AppKit() {
  const { bottom, top } = useSafeAreaInsets();
  const { close } = useInternalAppKit();
  const { open } = useSnapshot(ModalController.state);
  const { themeMode, themeVariables } = useSnapshot(ThemeController.state);
  const { projectId } = useSnapshot(OptionsController.state);

  const handleBackPress = () => {
    if (RouterController.state.history.length > 1) {
      return RouterController.goBack();
    }

    return handleModalClose();
  };

  const prefetch = useCallback(async () => {
    await ApiController.prefetch();
    EventsController.sendEvent({ type: 'track', event: 'MODAL_LOADED' });
  }, []);

  const handleModalClose = async () => {
    await close();
  };

  useEffect(() => {
    if (projectId) {
      prefetch();
    }
  }, [projectId, prefetch]);

  return (
    <ThemeProvider themeMode={themeMode} themeVariables={themeVariables}>
      <Modal
        visible={open}
        onRequestClose={handleBackPress}
        onBackdropPress={handleModalClose}
        testID="w3m-modal"
      >
        <Card style={[styles.card, { paddingBottom: bottom, marginTop: top }]}>
          <Header />
          <AppKitRouter />
          <Snackbar />
        </Card>
      </Modal>
    </ThemeProvider>
  );
}
