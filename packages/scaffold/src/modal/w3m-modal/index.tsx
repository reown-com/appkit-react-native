import { useSnapshot } from 'valtio';
import { useEffect, useRef } from 'react';
import { useWindowDimensions, StatusBar } from 'react-native';
import Modal from 'react-native-modal';
import { Card } from '@web3modal/ui-react-native';
import {
  AccountController,
  ApiController,
  ModalController,
  RouterController
} from '@web3modal/core-react-native';
import WebView from 'react-native-webview';

import { Web3Router } from '../w3m-router';
import { Header } from '../../partials/w3m-header';

import { Snackbar } from '../../partials/w3m-snackbar';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';
import { BaseHtml, FrameSdk, connect } from './FrameSdk';

export function Web3Modal() {
  const { open } = useSnapshot(ModalController.state);
  const { history } = useSnapshot(RouterController.state);
  const { height } = useWindowDimensions();
  const webviewRef = useRef<WebView>(null);
  const { isLandscape } = useCustomDimensions();
  const portraitHeight = height - 120;
  const landScapeHeight = height * 0.95 - (StatusBar.currentHeight ?? 0);

  const onBackButtonPress = () => {
    if (history.length > 1) {
      return RouterController.goBack();
    }

    return ModalController.close();
  };

  useEffect(() => {
    ApiController.prefetch();
  }, []);

  useEffect(() => {
    // This should be true if user uses email connector
    ModalController.setLoading(true);
  }, []);

  const handleMessage = (event: any) => {
    console.log('SECURE RESPONSE: ', event.nativeEvent.data);
    const response = JSON.parse(event.nativeEvent.data);

    if (response?.type?.startsWith('@w3m-frame')) {
      // Valid events;
      if (response?.type === '@w3m-frame/IS_CONNECTED_SUCCESS') {
        ModalController.setLoading(false);
        const { isConnected } = response?.payload || {};
        if (isConnected) {
          //Get user data
          const message = connect();
          webviewRef?.current?.injectJavaScript(message);
        }

        return;
      }

      if (response?.type === '@w3m-frame/CONNECT_EMAIL_SUCCESS') {
        const { action } = response?.payload || {};
        if (action === 'VERIFY_OTP') {
          RouterController.push('EmailVerifyOtp');
        }

        return;
      }

      if (response?.type === '@w3m-frame/CONNECT_OTP_SUCCESS') {
        //Get user data
        const message = connect();
        webviewRef?.current?.injectJavaScript(message);
      }

      if (response?.type === '@w3m-frame/GET_USER_SUCCESS') {
        // SET USER DATA
        // NAVIGATE TO ACCOUNT VIEW
        const { address, chainId } = response?.payload || {};

        //SHOULD USE WAGMI CONNECTOR
        AccountController.setCaipAddress(`eip155:${chainId}:${address}`);
        AccountController.setIsConnected(true);
        if (ModalController.state.open) {
          RouterController.replace('Account');
        }
      }
    }
  };

  return (
    <>
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
          <Web3Router webviewRef={webviewRef} />
          <Snackbar />
        </Card>
      </Modal>
      <WebView
        ref={webviewRef}
        containerStyle={styles.webview}
        originWhitelist={['*']}
        onMessage={handleMessage}
        source={{ html: BaseHtml }}
        injectedJavaScript={FrameSdk}
      />
    </>
  );
}
