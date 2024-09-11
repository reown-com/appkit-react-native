import { useSnapshot } from 'valtio';
import { useCallback, useEffect } from 'react';
import { useWindowDimensions, StatusBar } from 'react-native';
import Modal from 'react-native-modal';
import { Card } from '@reown/appkit-ui-react-native';
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
  type CaipAddress,
  type AppKitFrameProvider
} from '@reown/appkit-core-react-native';

import { AppKitRouter } from '../w3m-router';
import { Header } from '../../partials/w3m-header';
import { Snackbar } from '../../partials/w3m-snackbar';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';

export function AppKit() {
  const { open, loading } = useSnapshot(ModalController.state);
  const { history, view } = useSnapshot(RouterController.state);
  const { connectors } = useSnapshot(ConnectorController.state);
  const { caipAddress, isConnected } = useSnapshot(AccountController.state);
  const { isSiweEnabled } = OptionsController.state;
  const { height } = useWindowDimensions();
  const { isLandscape } = useCustomDimensions();
  const portraitHeight = height - 120;
  const landScapeHeight = height * 0.95 - (StatusBar.currentHeight ?? 0);
  const authProvider = connectors.find(c => c.type === 'AUTH')?.provider as AppKitFrameProvider;
  const modalCoverScreen = view !== 'ConnectingSiwe';
  const AuthView = authProvider?.AuthView;

  const onBackButtonPress = () => {
    if (history.length > 1) {
      return RouterController.goBack();
    }

    return handleClose();
  };

  const prefetch = async () => {
    await ApiController.prefetch();
    EventsController.sendEvent({ type: 'track', event: 'MODAL_LOADED' });
  };

  const handleClose = async () => {
    if (isSiweEnabled) {
      const { SIWEController } = await import('@reown/appkit-siwe-react-native');

      if (SIWEController.state.status !== 'success' && isConnected) {
        await ConnectionController.disconnect();
      }
    }
  };

  const onNewAddress = useCallback(
    async (address?: CaipAddress) => {
      if (!isConnected || loading) {
        return;
      }

      if (isSiweEnabled) {
        const newAddress = CoreHelperUtil.getPlainAddress(address);
        const newNetworkId = CoreHelperUtil.getNetworkId(address);
        const { SIWEController } = await import('@reown/appkit-siwe-react-native');
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
    [isSiweEnabled, isConnected, loading]
  );

  const onSiweNavigation = () => {
    const { open: modalOpen } = ModalController.state;
    if (modalOpen) {
      RouterController.push('ConnectingSiwe');
    } else {
      ModalController.open({
        view: 'ConnectingSiwe'
      });
    }
  };

  useEffect(() => {
    prefetch();
  }, []);

  useEffect(() => {
    onNewAddress(caipAddress);
  }, [caipAddress, onNewAddress]);

  return (
    <>
      <Modal
        style={styles.modal}
        coverScreen={modalCoverScreen}
        isVisible={open}
        useNativeDriver
        statusBarTranslucent
        hideModalContentWhileAnimating
        propagateSwipe
        onModalHide={handleClose}
        onBackdropPress={ModalController.close}
        onBackButtonPress={onBackButtonPress}
      >
        <Card style={[styles.card, { maxHeight: isLandscape ? landScapeHeight : portraitHeight }]}>
          <Header />
          <AppKitRouter />
          <Snackbar />
        </Card>
      </Modal>
      {!!authProvider && AuthView && <AuthView />}
    </>
  );
}
