import { useSnapshot } from 'valtio';
import { useEffect, useRef, useState } from 'react';
import { Animated, Appearance, Platform, SafeAreaView } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { W3mFrameConstants, W3mFrameProvider } from '@web3modal/email-react-native';
import {
  ConnectorController,
  OptionsController,
  ModalController,
  CoreHelperUtil,
  type OptionsControllerState
} from '@web3modal/core-react-native';
import { useTheme } from '@web3modal/ui-react-native';
import styles from './styles';

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

export function EmailWebview() {
  const webviewRef = useRef<WebView>(null);
  const Theme = useTheme();
  const { connectors } = useSnapshot(ConnectorController.state);
  const { projectId, sdkVersion } = useSnapshot(OptionsController.state) as OptionsControllerState;
  const [isVisible, setIsVisible] = useState(false);
  const [isBackdropVisible, setIsBackdropVisible] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0));
  const backdropOpacity = useRef(new Animated.Value(0));
  const webviewOpacity = useRef(new Animated.Value(0));
  const emailConnector = connectors.find(c => c.type === 'EMAIL');
  const provider = emailConnector?.provider as W3mFrameProvider;

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
      setIsVisible(true);
    });

    provider.onRpcResponse(event, () => {
      setIsVisible(false);
    });

    provider.onIsConnected(event, () => {
      ConnectorController.setEmailLoading(false);
      ModalController.setLoading(false);
    });

    provider.onNotConnected(event, () => {
      ConnectorController.setEmailLoading(false);
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
            headers: { 'X-Bundle-Id': CoreHelperUtil.getBundleId() }
          }}
          bounces={false}
          scalesPageToFit
          onMessage={handleMessage}
          containerStyle={styles.webview}
          injectedJavaScript={W3mFrameConstants.FRAME_MESSAGES_HANDLER}
          ref={webviewRef}
          onLoadStart={() => {
            ConnectorController.setEmailLoading(true);
          }}
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
      </AnimatedSafeAreaView>
    </>
  ) : null;
}
