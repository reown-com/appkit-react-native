import { useSnapshot } from 'valtio';
import { useEffect, useRef, useState } from 'react';
import { Animated, Appearance, Linking, Platform, SafeAreaView, StyleSheet } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import {
  ConnectorController,
  OptionsController,
  ModalController,
  type OptionsControllerState,
  StorageUtil
} from '@reown/appkit-core-react-native';
import { useTheme, BorderRadius } from '@reown/appkit-ui-react-native';
import type { AppKitFrameProvider } from './AppKitFrameProvider';
import { AppKitFrameConstants, AppKitFrameRpcConstants } from './AppKitFrameConstants';

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

export function AuthWebview() {
  const webviewRef = useRef<WebView>(null);
  const themeMode = Appearance.getColorScheme() ?? undefined;
  const Theme = useTheme();
  const { connectors } = useSnapshot(ConnectorController.state);
  const { projectId, sdkVersion } = useSnapshot(OptionsController.state) as OptionsControllerState;
  const [isVisible, setIsVisible] = useState(false);
  const [isBackdropVisible, setIsBackdropVisible] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0));
  const backdropOpacity = useRef(new Animated.Value(0));
  const webviewOpacity = useRef(new Animated.Value(0));
  const authConnector = connectors.find(c => c.type === 'AUTH');
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
    let event = parseMessage(e);

    provider.onMessage(event);

    provider.onRpcRequest(event, () => {
      if (!AppKitFrameRpcConstants.SAFE_RPC_METHODS.includes(event.payload.method)) {
        setIsVisible(true);
      }
    });

    provider.onRpcResponse(event, () => {
      setIsVisible(false);
    });

    provider.onFrameReady(event, () => {
      provider?.syncTheme({
        themeMode,
        w3mThemeVariables: {
          '--w3m-accent': Theme['accent-100'],
          '--w3m-background': Theme['bg-100']
        }
      });
      provider?.syncDappData?.({ projectId, sdkVersion });
      provider?.onWebviewLoaded();
    });

    provider.onIsConnected(event, () => {
      ConnectorController.setAuthLoading(false);
      ModalController.setLoading(false);
    });

    provider.onNotConnected(event, () => {
      ConnectorController.setAuthLoading(false);
      ModalController.setLoading(false);
      StorageUtil.removeConnectedConnector();
    });
  };

  const show = animatedHeight.current.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '80%']
  });

  useEffect(() => {
    Animated.timing(animatedHeight.current, {
      toValue: isVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: false
    }).start();

    Animated.timing(webviewOpacity.current, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: false
    }).start();

    if (isVisible) {
      setIsBackdropVisible(true);
    }

    Animated.timing(backdropOpacity.current, {
      toValue: isVisible ? 0.7 : 0,
      duration: 300,
      useNativeDriver: false
    }).start(() => setIsBackdropVisible(isVisible));
  }, [animatedHeight, backdropOpacity, isVisible, setIsBackdropVisible]);

  useEffect(() => {
    provider?.setWebviewRef(webviewRef);
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
            }
          }}
          onError={({ nativeEvent }) => {
            provider?.onWebviewLoadError(nativeEvent.description);
          }}
        />
      </AnimatedSafeAreaView>
    </>
  ) : null;
}

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
