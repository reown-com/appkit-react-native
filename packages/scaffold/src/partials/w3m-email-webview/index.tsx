import { useSnapshot } from 'valtio';
import { useEffect, useRef, useState } from 'react';
import { Appearance, Platform, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { W3mFrameProvider } from '@web3modal/email-react-native';
import {
  ConnectorController,
  OptionsController,
  ModalController
} from '@web3modal/core-react-native';
import { useTheme } from '@web3modal/ui-react-native';
import styles from './styles';

// TODO: move to frame constants
const injectedJavaScript = `
  const iframe = document.getElementById("frame-mobile-sdk");
  iframe.onload = () => {
    window.addEventListener('message', ({ data }) => {
      window.ReactNativeWebView.postMessage(JSON.stringify(data))
    })
  }
`;

export function EmailWebview() {
  const webviewRef = useRef<WebView>(null);
  const Theme = useTheme();
  const { connectors } = useSnapshot(ConnectorController.state);
  const { projectId, sdkVersion } = useSnapshot(OptionsController.state);
  const [isVisible, setIsVisible] = useState(false);
  const emailConnector = connectors.find(c => c.type === 'EMAIL');
  const provider = emailConnector?.provider as W3mFrameProvider;

  const handleMessage = (e: WebViewMessageEvent) => {
    let event = JSON.parse(e.nativeEvent.data);

    if (typeof event === 'string') {
      //TODO: Check why this double parsing is needed
      event = JSON.parse(event);
    }

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

  useEffect(() => {
    provider?.setWebviewRef(webviewRef);
  }, [provider, webviewRef]);

  return provider ? (
    <>
      <View
        style={[
          styles.backdrop,
          !isVisible && styles.hidden,
          { backgroundColor: Theme['gray-glass-080'] }
        ]}
      />
      <View
        style={[
          styles.container,
          { borderColor: Theme['gray-glass-020'] },
          isVisible ? styles.visible : styles.hidden
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
          style={styles.webview}
          injectedJavaScript={injectedJavaScript}
          ref={webviewRef}
          webviewDebuggingEnabled={__DEV__}
          onLoadEnd={({ nativeEvent }) => {
            if (!nativeEvent.loading) {
              if (Platform.OS === 'android') {
                webviewRef.current?.injectJavaScript(injectedJavaScript);
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
      </View>
    </>
  ) : null;
}
