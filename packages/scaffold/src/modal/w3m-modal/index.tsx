import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useRef } from 'react';
import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps
} from '@gorhom/bottom-sheet';
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
  type AppKitFrameProvider
} from '@reown/appkit-core-react-native';
import { useTheme } from '@reown/appkit-ui-react-native';

import { AppKitRouter } from '../w3m-router';
import { Header } from '../../partials/w3m-header';
import { Snackbar } from '../../partials/w3m-snackbar';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';

export function AppKit() {
  const Theme = useTheme();
  const { open, loading } = useSnapshot(ModalController.state);
  const { connectors } = useSnapshot(ConnectorController.state);
  const { caipAddress, isConnected } = useSnapshot(AccountController.state);
  const { isSiweEnabled } = OptionsController.state;
  const { isLandscape } = useCustomDimensions();
  const authProvider = connectors.find(c => c.type === 'AUTH')?.provider as AppKitFrameProvider;
  const AuthView = authProvider?.AuthView;
  const SocialView = authProvider?.Webview;
  const bottomSheetRef = useRef<BottomSheet>(null);

  const prefetch = async () => {
    await ApiController.prefetch();
    EventsController.sendEvent({ type: 'track', event: 'MODAL_LOADED' });
  };

  const handleClose = useCallback(async () => {
    ModalController.close();
    if (isSiweEnabled) {
      const { SIWEController } = await import('@reown/appkit-siwe-react-native');

      if (SIWEController.state.status !== 'success' && AccountController.state.isConnected) {
        await ConnectionController.disconnect();
      }
    }
  }, [isSiweEnabled]);

  const onNewAddress = useCallback(
    async (address?: CaipAddress) => {
      if (!isConnected || loading) {
        return;
      }

      const newAddress = CoreHelperUtil.getPlainAddress(address);
      TransactionsController.resetTransactions();
      TransactionsController.fetchTransactions(newAddress);

      if (isSiweEnabled) {
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
    if (ModalController.state.open) {
      RouterController.push('ConnectingSiwe');
    } else {
      ModalController.open({ view: 'ConnectingSiwe' });
    }
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} opacity={0.7} onPress={handleClose} />
    ),
    [handleClose]
  );

  useEffect(() => {
    prefetch();
  }, []);

  useEffect(() => {
    if (open) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [open]);

  useEffect(() => {
    onNewAddress(caipAddress);
  }, [caipAddress, onNewAddress]);

  return (
    <>
      <BottomSheet
        index={-1}
        ref={bottomSheetRef}
        enableDynamicSizing
        backdropComponent={renderBackdrop}
        keyboardBlurBehavior="restore"
        handleComponent={Header}
        topInset={isLandscape ? 70 : 100}
        backgroundStyle={{ backgroundColor: Theme['bg-100'] }}
      >
        <AppKitRouter />
        <Snackbar />
      </BottomSheet>

      {!!authProvider && AuthView && <AuthView />}
      {!!authProvider && SocialView && <SocialView />}
    </>
  );
}
