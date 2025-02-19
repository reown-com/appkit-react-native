import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useRef } from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
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
  type AppKitFrameProvider,
  ThemeController
} from '@reown/appkit-core-react-native';
import { ThemeProvider, useTheme } from '@reown/appkit-ui-react-native';
import { SIWEController } from '@reown/appkit-siwe-react-native';

import { AppKitRouter } from '../w3m-router';
import { Header } from '../../partials/w3m-header';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';

export function AppKit() {
  const Theme = useTheme();
  const { open, loading } = useSnapshot(ModalController.state);
  const { connectors, connectedConnector } = useSnapshot(ConnectorController.state);
  const { caipAddress, isConnected } = useSnapshot(AccountController.state);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { themeMode, themeVariables } = useSnapshot(ThemeController.state);
  const { isLandscape } = useCustomDimensions();
  const authProvider = connectors.find(c => c.type === 'AUTH')?.provider as AppKitFrameProvider;
  const AuthView = authProvider?.AuthView;
  const SocialView = authProvider?.Webview;
  const showAuth = !connectedConnector || connectedConnector === 'AUTH';

  const prefetch = async () => {
    await ApiController.prefetch();
    EventsController.sendEvent({ type: 'track', event: 'MODAL_LOADED' });
  };

  const handleClose = useCallback(async () => {
    ModalController.close();
    if (OptionsController.state.isSiweEnabled) {
      if (SIWEController.state.status !== 'success' && AccountController.state.isConnected) {
        await ConnectionController.disconnect();
      }
    }

    if (
      RouterController.state.view === 'OnRampLoading' &&
      EventsController.state.data.event === 'BUY_SUBMITTED'
    ) {
      // Send event only if the onramp url was already created
      EventsController.sendEvent({ type: 'track', event: 'BUY_CANCEL' });
    }
  }, []);

  const onNewAddress = useCallback(
    async (address?: CaipAddress) => {
      if (!isConnected || loading) {
        return;
      }

      const newAddress = CoreHelperUtil.getPlainAddress(address);
      TransactionsController.resetTransactions();
      TransactionsController.fetchTransactions(newAddress, true);

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
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [open]);

  useEffect(() => {
    onNewAddress(caipAddress);
  }, [caipAddress, onNewAddress]);

  return (
    <ThemeProvider themeMode={themeMode} themeVariables={themeVariables}>
      <BottomSheetModal
        ref={bottomSheetRef}
        enableDynamicSizing
        backdropComponent={renderBackdrop}
        keyboardBlurBehavior="restore"
        handleComponent={Header}
        stackBehavior="push"
        onDismiss={handleClose}
        topInset={isLandscape ? 70 : 100}
        backgroundStyle={{ backgroundColor: Theme['bg-100'] }}
      >
        <AppKitRouter />
      </BottomSheetModal>

      {!!showAuth && AuthView && <AuthView />}
      {!!showAuth && SocialView && <SocialView />}
    </ThemeProvider>
  );
}
