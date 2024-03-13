import { useSnapshot } from 'valtio';
import {
  ConnectorController,
  OptionsController,
  ModalController
} from '@web3modal/core-react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { View } from 'react-native';
import { W3mFrameConstants, W3mFrameProvider } from '@web3modal/email-react-native';
import { useEffect, useRef, useState } from 'react';

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
  const { connectors } = useSnapshot(ConnectorController.state);
  const [isVisible, setIsVisible] = useState(false);
  const { projectId } = useSnapshot(OptionsController.state);
  const provider = connectors.find(c => c.type === 'EMAIL')?.provider as W3mFrameProvider;
  const uri = `${W3mFrameConstants.SECURE_SITE_SDK}?projectId=${projectId}`;

  const handleMessage = (e: WebViewMessageEvent) => {
    const event = JSON.parse(e.nativeEvent.data);
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
  };

  useEffect(() => {
    provider?.setWebviewRef(webviewRef);
  }, [provider, webviewRef]);

  return provider ? (
    <View style={{ height: isVisible ? 200 : 0, width: isVisible ? 200 : 0 }}>
      <WebView
        source={{
          uri,
          headers: { 'X-Bundle-Id': 'host.exp.exponent' } // TODO: use CoreHelper
        }}
        scalesPageToFit
        onMessage={handleMessage}
        injectedJavaScript={injectedJavaScript}
        ref={webviewRef}
        webviewDebuggingEnabled={__DEV__}
        onLoadEnd={() => {
          provider?.onWebviewLoaded();
        }}
        onError={error => {
          provider?.onWebviewLoadError(error.nativeEvent.description);
        }}
      />
    </View>
  ) : null;
}
