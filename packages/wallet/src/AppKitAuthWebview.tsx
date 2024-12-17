import { useSnapshot } from 'valtio';
import { memo, useEffect, useRef, useState } from 'react';
import { Animated, Appearance, Linking, Platform, SafeAreaView, StyleSheet } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import {
  ConnectorController,
  OptionsController,
  ModalController,
  type OptionsControllerState,
  RouterController,
  WebviewController,
  AccountController,
  NetworkController,
  ConnectionController,
  SnackController
} from '@reown/appkit-core-react-native';
import { ErrorUtil } from '@reown/appkit-common-react-native';
import { useTheme, BorderRadius } from '@reown/appkit-ui-react-native';
import type { AppKitFrameProvider } from './AppKitFrameProvider';
import { AppKitFrameConstants } from './AppKitFrameConstants';
import { AppKitFrameHelpers } from './AppKitFrameHelpers';
import type { AppKitFrameTypes } from './AppKitFrameTypes';

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

function _AuthWebview() {
  const webviewRef = useRef<WebView>(null);
  const Theme = useTheme();
  const authConnector = ConnectorController.getAuthConnector();
  const { projectId, sdkVersion, sdkType } = useSnapshot(
    OptionsController.state
  ) as OptionsControllerState;
  const { frameViewVisible } = useSnapshot(WebviewController.state);
  const [isBackdropVisible, setIsBackdropVisible] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0));
  const backdropOpacity = useRef(new Animated.Value(0));
  const webviewOpacity = useRef(new Animated.Value(0));
  const provider = authConnector?.provider as AppKitFrameProvider;

  const parseMessage = (event: WebViewMessageEvent) => {
    if (!event.nativeEvent.data) return;
    let message: any = event.nativeEvent.data;
    if (typeof message === 'string') {
      // Solves issues parsing eth_signTypedData_v4. Replace escaped double quotes and extra quotes around curly braces
      const cleanedJsonString = message
        .replace(/\\"/g, '"')
        .replace(/"{/g, '{')
        .replace(/}"/g, '}');
      message = JSON.parse(cleanedJsonString);
    }

    return message;
  };

  const handleMessage = (e: WebViewMessageEvent) => {
    try {
      let event = parseMessage(e);

      provider.onMessage(event);
    } catch (error) {}
  };

  const show = animatedHeight.current.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '80%']
  });

  useEffect(() => {}, [provider]);

  useEffect(() => {
    Animated.timing(animatedHeight.current, {
      toValue: frameViewVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: false
    }).start();

    Animated.timing(webviewOpacity.current, {
      toValue: frameViewVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: false
    }).start();

    if (frameViewVisible) {
      setIsBackdropVisible(true);
    }

    Animated.timing(backdropOpacity.current, {
      toValue: frameViewVisible ? 0.7 : 0,
      duration: 300,
      useNativeDriver: false
    }).start(() => setIsBackdropVisible(frameViewVisible));
  }, [animatedHeight, backdropOpacity, frameViewVisible, setIsBackdropVisible]);

  useEffect(() => {
    if (provider) {
      provider.setWebviewRef(webviewRef);
      provider.onRpcRequest((request: AppKitFrameTypes.RPCRequest) => {
        if (AppKitFrameHelpers.checkIfRequestExists(request)) {
          if (!AppKitFrameHelpers.checkIfRequestIsAllowed(request)) {
            WebviewController.setFrameViewVisible(true);
          }
        }
      });

      provider.onRpcSuccess((_, request) => {
        const isSafeRequest = AppKitFrameHelpers.checkIfRequestIsSafe(request);
        if (isSafeRequest) {
          return;
        }

        if (RouterController.state.transactionStack.length === 0) {
          ModalController.close();
        } else {
          RouterController?.popTransactionStack();
        }
        WebviewController.setFrameViewVisible(false);
      });

      provider.onRpcError(() => {
        if (ModalController.state.open) {
          if (RouterController.state.transactionStack.length === 0) {
            ModalController.close();
          } else {
            RouterController?.popTransactionStack(true);
          }
        }
        WebviewController.setFrameViewVisible(false);
      });

      provider.onIsConnected(({ smartAccountDeployed, preferredAccountType }) => {
        provider.getSmartAccountEnabledNetworks();
        AccountController.setPreferredAccountType(preferredAccountType);
        AccountController.setSmartAccountDeployed(smartAccountDeployed);
        ConnectorController.setAuthLoading(false);
        ModalController.setLoading(false);
      });

      provider.onNotConnected(() => {
        ConnectorController.setAuthLoading(false);
        ModalController.setLoading(false);
        if (ConnectorController.state.connectedConnector === 'AUTH') {
          ConnectionController.disconnect();
        }
      });

      provider.onGetSmartAccountEnabledNetworks(({ smartAccountEnabledNetworks }) => {
        return NetworkController.setSmartAccountEnabledNetworks(smartAccountEnabledNetworks);
      });
    }
  }, [provider, webviewRef]);

  return provider ? (
    <>
      <Animated.View
        style={[
          styles.backdrop,
          !isBackdropVisible && styles.hidden,
          { backgroundColor: Theme['inverse-000'], opacity: backdropOpacity.current }
        ]}
      />
      <AnimatedSafeAreaView
        style={[
          styles.container,
          { backgroundColor: Theme['bg-100'], height: show, opacity: webviewOpacity.current }
        ]}
      >
        <WebView
          source={{
            uri: provider.getSecureSiteURL(),
            headers: provider.getSecureSiteHeaders()
          }}
          bounces={false}
          scalesPageToFit
          onMessage={handleMessage}
          containerStyle={styles.webview}
          injectedJavaScript={AppKitFrameConstants.FRAME_MESSAGES_HANDLER}
          ref={webviewRef}
          onOpenWindow={syntheticEvent => {
            const { nativeEvent } = syntheticEvent;
            const { targetUrl } = nativeEvent;
            Linking.openURL(targetUrl);
          }}
          onLoadStart={() => {
            ConnectorController.setAuthLoading(true);
          }}
          onLoadEnd={({ nativeEvent }) => {
            if (!nativeEvent.loading) {
              if (Platform.OS === 'android') {
                webviewRef.current?.injectJavaScript(AppKitFrameConstants.FRAME_MESSAGES_HANDLER);
              }
              const themeMode = Appearance.getColorScheme() ?? undefined;

              setTimeout(() => {
                provider?.syncTheme({
                  themeMode,
                  w3mThemeVariables: {
                    '--w3m-accent': Theme['accent-100'],
                    '--w3m-background': Theme['bg-100']
                  }
                });
                provider?.syncDappData?.({ projectId, sdkVersion, sdkType });
                provider?.onWebviewLoaded();
                provider?.isConnected();
              }, 1500);
            }
          }}
          onError={({ nativeEvent }) => {
            provider?.onWebviewLoadError(nativeEvent.description);
          }}
          onHttpError={() => {
            SnackController.showInternalError(ErrorUtil.ALERT_ERRORS.SOCIALS_TIMEOUT);
          }}
        />
      </AnimatedSafeAreaView>
    </>
  ) : null;
}

export const AuthWebview = memo(_AuthWebview);

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0
  },
  container: {
    bottom: 0,
    position: 'absolute',
    width: '100%',
    borderTopLeftRadius: BorderRadius.l,
    borderTopRightRadius: BorderRadius.l,
    zIndex: 999
  },
  hidden: {
    display: 'none'
  },
  webview: {
    borderTopLeftRadius: BorderRadius.l,
    borderTopRightRadius: BorderRadius.l
  }
});
