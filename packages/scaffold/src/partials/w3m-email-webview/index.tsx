import { useSnapshot } from 'valtio';
import { useEffect, useRef, useState } from 'react';
import { Animated, Appearance, Platform } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { W3mFrameConstants, W3mFrameProvider } from '@web3modal/email-react-native';
import {
  ConnectorController,
  OptionsController,
  ModalController
} from '@web3modal/core-react-native';
import { useTheme } from '@web3modal/ui-react-native';
import styles from './styles';

export function EmailWebview() {
  const webviewRef = useRef<WebView>(null);
  const Theme = useTheme();
  const { connectors } = useSnapshot(ConnectorController.state);
  const { projectId, sdkVersion } = useSnapshot(OptionsController.state);
  const [isVisible, setIsVisible] = useState(false);
  const [isBackdropVisible, setIsBackdropVisible] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0));
  const animatedOpacity = useRef(new Animated.Value(0));
  const emailConnector = connectors.find(c => c.type === 'EMAIL');
  const provider = emailConnector?.provider as W3mFrameProvider;

  const parseMessage = (event: WebViewMessageEvent) => {
    if (!event.nativeEvent.data) return;
    let message: any = event.nativeEvent.data;
    if (typeof message === 'string') {
      message = JSON.parse(message);
    }

    return message;
  };

  const handleMessage = (e: WebViewMessageEvent) => {
    let event = parseMessage(e);

    provider.onMessage(event);

    provider.onRpcRequest(event, () => {
      setIsVisible(true);
    });

    provider.onRpcResponse(event, () => {
      setIsVisible(false);
    });

    provider.onIsConnected(event, () => {
      ModalController.setLoading(false);
    });

    provider.onNotConnected(event, () => {
      ModalController.setLoading(false);
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

    if (isVisible) {
      setIsBackdropVisible(true);
    }

    Animated.timing(animatedOpacity.current, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: false
    }).start(() => setIsBackdropVisible(isVisible));
  }, [animatedHeight, animatedOpacity, isVisible, setIsBackdropVisible]);

  useEffect(() => {
    provider?.setWebviewRef(webviewRef);
  }, [provider, webviewRef]);

  return provider ? (
    <>
      <Animated.View
        style={[
          styles.backdrop,
          !isBackdropVisible && styles.hidden,
          { backgroundColor: Theme['gray-glass-070'], opacity: animatedOpacity.current }
        ]}
      />
      <Animated.View
        style={[
          styles.container,
          { borderColor: Theme['gray-glass-020'], height: show, opacity: animatedOpacity.current }
        ]}
      >
        <WebView
          source={{
            uri: provider.getSecureSiteURL(),
            headers: { 'X-Bundle-Id': 'host.exp.exponent' } // TODO: use CoreHelper
          }}
          bounces={false}
          scalesPageToFit
          onMessage={handleMessage}
          containerStyle={styles.webview}
          injectedJavaScript={W3mFrameConstants.FRAME_MESSAGES_HANDLER}
          ref={webviewRef}
          onLoadEnd={({ nativeEvent }) => {
            if (!nativeEvent.loading) {
              if (Platform.OS === 'android') {
                webviewRef.current?.injectJavaScript(W3mFrameConstants.FRAME_MESSAGES_HANDLER);
              }
              const themeMode = Appearance.getColorScheme() ?? undefined;
              provider?.syncTheme({ themeMode });
              provider?.syncDappData?.({ projectId, sdkVersion });
              provider?.onWebviewLoaded();
            }
          }}
          onError={({ nativeEvent }) => {
            provider?.onWebviewLoadError(nativeEvent.description);
          }}
        />
      </Animated.View>
    </>
  ) : null;
}
