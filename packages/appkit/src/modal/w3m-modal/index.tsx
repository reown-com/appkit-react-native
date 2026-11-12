import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useRef, type ComponentType, type ReactNode } from 'react';
import { Animated, useColorScheme } from 'react-native';
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
import { RouterUtil } from '../../utils/RouterUtil';
import styles from './styles';

export interface AppKitModalContentWrapperProps {
  children: ReactNode;
}

export type AppKitModalContentWrapperComponent = ComponentType<AppKitModalContentWrapperProps>;

export interface AppKitProps {
  modalContentWrapper?: AppKitModalContentWrapperComponent;
}

export function AppKit({ modalContentWrapper }: AppKitProps) {
  const theme = useColorScheme();
  const { bottom, top } = useSafeAreaInsets();
  const { close } = useInternalAppKit();
  const { open, shake } = useSnapshot(ModalController.state);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const { themeMode, themeVariables } = useSnapshot(ThemeController.state);
  const { projectId } = useSnapshot(OptionsController.state);

  const handleBackPress = () => {
    // The unsupported network screen can't be left with back, close() shakes the modal instead
    if (RouterController.state.history.length > 1 && !RouterUtil.isUnsupportedChainView()) {
      return RouterController.goBack();
    }

    return handleModalClose();
  };

  useEffect(() => {
    ThemeController.setSystemThemeMode(theme ?? undefined);
  }, [theme]);

  const prefetch = useCallback(async () => {
    await ApiController.prefetch();
    EventsController.sendEvent({ type: 'track', event: 'MODAL_LOADED' });
  }, []);

  const handleModalClose = async () => {
    await close();
  };

  useEffect(() => {
    if (!shake) return;

    const offsets = [-8, 8, -6, 6, -3, 3, 0];
    Animated.sequence(
      offsets.map(toValue =>
        Animated.timing(shakeAnimation, { toValue, duration: 50, useNativeDriver: true })
      )
    ).start();
  }, [shake, shakeAnimation]);

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
        contentWrapper={modalContentWrapper}
      >
        <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
          <Card style={[styles.card, { paddingBottom: bottom, marginTop: top }]}>
            <Header />
            <AppKitRouter />
            <Snackbar />
          </Card>
        </Animated.View>
      </Modal>
    </ThemeProvider>
  );
}
