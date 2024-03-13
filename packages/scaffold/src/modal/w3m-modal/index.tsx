import { useSnapshot } from 'valtio';
import { useEffect } from 'react';
import { useWindowDimensions, StatusBar } from 'react-native';
import Modal from 'react-native-modal';
import { Card } from '@web3modal/ui-react-native';
import {
  ApiController,
  ConnectorController,
  EventsController,
  ModalController,
  RouterController
} from '@web3modal/core-react-native';

import { Web3Router } from '../w3m-router';
import { Header } from '../../partials/w3m-header';
import { Snackbar } from '../../partials/w3m-snackbar';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { EmailWebview } from '../w3m-email-webview';
import styles from './styles';

export function Web3Modal() {
  const { open } = useSnapshot(ModalController.state);
  const { history } = useSnapshot(RouterController.state);
  const { connectors } = useSnapshot(ConnectorController.state);
  const { height } = useWindowDimensions();
  const { isLandscape } = useCustomDimensions();
  const portraitHeight = height - 120;
  const landScapeHeight = height * 0.95 - (StatusBar.currentHeight ?? 0);
  const hasEmail = connectors.some(c => c.type === 'EMAIL');

  const onBackButtonPress = () => {
    if (history.length > 1) {
      return RouterController.goBack();
    }

    return ModalController.close();
  };

  const prefetch = async () => {
    await ApiController.prefetch();
    EventsController.sendEvent({ type: 'track', event: 'MODAL_LOADED' });
  };

  useEffect(() => {
    prefetch();
  }, []);

  return (
    <>
      {hasEmail && <EmailWebview />}
      <Modal
        style={styles.modal}
        isVisible={open}
        useNativeDriver
        statusBarTranslucent
        hideModalContentWhileAnimating
        propagateSwipe
        onBackdropPress={ModalController.close}
        onBackButtonPress={onBackButtonPress}
      >
        <Card style={[styles.card, { maxHeight: isLandscape ? landScapeHeight : portraitHeight }]}>
          <Header />
          <Web3Router />
          <Snackbar />
        </Card>
      </Modal>
    </>
  );
}
