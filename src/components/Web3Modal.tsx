import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  useColorScheme,
  ImageBackground,
} from 'react-native';
import Modal from 'react-native-modal';

import { DEVICE_WIDTH } from '../constants/Platform';
import { DarkTheme, LightTheme } from '../constants/Colors';
import type { Routes } from '../constants/Routes';
import type { Listing } from '../types/controllerTypes';

import Background from '../assets/Background.png';
import Web3ModalHeader from './Web3ModalHeader';
import { ExplorerUtil } from '../utils/ExplorerUtil';
import InitialExplorer from '../views/InitialExplorer';
import ViewAllExplorer from '../views/ViewAllExplorer';
import QRCodeView from '../views/QRCodeView';

const INITIAL_ROUTE = 'INIT_WALLETS';

interface Web3ModalProps {
  projectId: string;
  isVisible: boolean;
  onClose: () => void;
  currentWCURI?: string;
}

export function Web3Modal({ projectId, isVisible, onClose }: Web3ModalProps) {
  const [isWalletListLoading, setWalletListLoading] = useState(true);
  const [initialWallets, setInitialWallets] = useState<Listing[]>([]);
  const [allWallets, setAllWallets] = useState<Listing[]>([]);

  const isDarkMode = useColorScheme() === 'dark';

  const [viewStack, setViewStack] = useState<Routes[]>([INITIAL_ROUTE]);

  const fetchWallets = useCallback(() => {
    ExplorerUtil.fetchWallets(projectId).then((wallets) => {
      setWalletListLoading(false);
      if (wallets) {
        setInitialWallets(wallets.listings.slice(0, 7));
        setAllWallets(wallets.listings);
      }
    });
  }, [projectId]);

  const onNavigate = useCallback(
    (route: Routes) => {
      setViewStack(viewStack.concat([route]));
    },
    [viewStack]
  );

  const onNavigateBack = useCallback(() => {
    if (viewStack.length > 1) {
      setViewStack(viewStack.slice(0, -1));
    }
  }, [viewStack]);

  const SCREENS = useMemo(() => {
    return {
      ['INIT_WALLETS']: (
        <InitialExplorer
          isLoading={isWalletListLoading}
          explorerData={initialWallets}
          onViewAllPress={() => onNavigate('ALL_WALLETS')}
          currentWCURI={'currentWCURI'}
          onQRPress={() => onNavigate('QR_CODE')}
        />
      ),
      ['ALL_WALLETS']: (
        <ViewAllExplorer
          isLoading={isWalletListLoading}
          explorerData={allWallets}
          onBackPress={onNavigateBack}
          currentWCURI={'currentWCURI'}
        />
      ),
      ['QR_CODE']: (
        <QRCodeView uri={'currentWCURI'} onBackPress={onNavigateBack} />
      ),
    };
  }, [
    initialWallets,
    isWalletListLoading,
    onNavigateBack,
    onNavigate,
    allWallets,
  ]);

  useEffect(() => {
    if (!allWallets.length) {
      fetchWallets();
    }
  }, [allWallets, fetchWallets]);

  return (
    <Modal
      isVisible={isVisible}
      style={styles.modal}
      propagateSwipe
      hideModalContentWhileAnimating
      onBackdropPress={onClose}
      onModalHide={() => {
        setViewStack([INITIAL_ROUTE]);
      }}
      useNativeDriver
    >
      <ImageBackground
        style={styles.wcContainer}
        source={Background}
        imageStyle={styles.wcImage}
      >
        <Web3ModalHeader onClose={onClose} />
        <View
          style={[
            styles.connectWalletContainer,
            isDarkMode && styles.connectWalletContainerDark,
          ]}
        >
          {SCREENS[viewStack.at(-1) ?? INITIAL_ROUTE]}
        </View>
      </ImageBackground>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  wcContainer: {
    width: DEVICE_WIDTH,
  },
  wcImage: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  connectWalletContainer: {
    backgroundColor: LightTheme.background1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  connectWalletContainerDark: {
    backgroundColor: DarkTheme.background1,
  },
});
