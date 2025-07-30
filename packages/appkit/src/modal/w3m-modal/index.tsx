import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useWindowDimensions, StatusBar, Modal, TouchableOpacity, Animated } from 'react-native';
import { Card, ThemeProvider } from '@reown/appkit-ui-react-native';
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

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(height)).current;
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [cardHeight, setCardHeight] = useState(0);

  const onCardLayout = (event: any) => {
    const { height: measuredHeight } = event.nativeEvent.layout;
    setCardHeight(measuredHeight);
  };

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

  // Handle modal visibility
  useEffect(() => {
    if (open) {
      setModalVisible(true);
      setShowBackdrop(true);
    }
  }, [open]);

  // Handle backdrop animation separately
  useEffect(() => {
    let backdropAnimation: Animated.CompositeAnimation;

    if (open) {
      backdropAnimation = Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      });
      backdropAnimation.start();
    } else if (modalVisible) {
      backdropAnimation = Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true
      });
      backdropAnimation.start(() => {
        setShowBackdrop(false);
      });
    }

    return () => {
      backdropAnimation?.stop();
    };
  }, [open, modalVisible, backdropOpacity]);

  // Handle modal position animation separately
  useEffect(() => {
    let modalAnimation: Animated.CompositeAnimation;

    if (open && modalVisible) {
      // Calculate the target position (screen height - card height)
      const targetY = cardHeight > 0 ? height - cardHeight : height * 0.2; // fallback to 20% from bottom

      modalAnimation = Animated.spring(translateY, {
        toValue: targetY,
        damping: 18,
        stiffness: 220,
        mass: 1,
        useNativeDriver: true
      });
      modalAnimation.start();
    } else if (!open && modalVisible) {
      modalAnimation = Animated.spring(translateY, {
        toValue: height,
        damping: 16,
        stiffness: 260,
        mass: 1,
        useNativeDriver: true
      });
      modalAnimation.start(() => {
        setModalVisible(false);
      });
    }

    return () => {
      modalAnimation?.stop();
    };
  }, [open, modalVisible, translateY, height, cardHeight]);

  // Update position when card height changes (e.g., during navigation)
  useEffect(() => {
    if (open && cardHeight > 0) {
      const targetY = height - cardHeight;
      Animated.spring(translateY, {
        toValue: targetY,
        damping: 20,
        stiffness: 200,
        mass: 1,
        useNativeDriver: true
      }).start();
    }
  }, [cardHeight, open, translateY, height]);

  // Reset animation values when modal is fully closed
  useEffect(() => {
    if (!modalVisible) {
      translateY.setValue(height);
      backdropOpacity.setValue(0);
    }
  }, [modalVisible, translateY, backdropOpacity, height]);

  return (
    <>
      <ThemeProvider themeMode={themeMode} themeVariables={themeVariables}>
        {showBackdrop && (
          <Animated.View style={[styles.outerBackdrop, { opacity: backdropOpacity }]} />
        )}
        <Modal
          visible={modalVisible}
          transparent
          animationType="none"
          statusBarTranslucent
          onDismiss={handleClose}
          onRequestClose={onBackButtonPress}
          testID="w3m-modal"
        >
          {showBackdrop && (
            <TouchableOpacity
              style={styles.innerBackdropTouchable}
              activeOpacity={1}
              onPress={ModalController.close}
            />
          )}
          <Animated.View style={[styles.modal, { transform: [{ translateY }] }]}>
            <Animated.View onLayout={onCardLayout}>
              <Card
                style={[styles.card, { maxHeight: isLandscape ? landScapeHeight : portraitHeight }]}
              >
                <Header />
                <AppKitRouter />
                <Snackbar />
              </Card>
            </Animated.View>
          </Animated.View>
        </Modal>
      </ThemeProvider>
    </>
  );
}
