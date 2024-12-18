import { useSnapshot } from 'valtio';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import {
  ConnectionController,
  ConnectorController,
  EventsController,
  RouterController,
  WebviewController
} from '@reown/appkit-core-react-native';
import { useTheme, BorderRadius, IconLink, Spacing } from '@reown/appkit-ui-react-native';
import type { AppKitFrameProvider } from './AppKitFrameProvider';
import { AppKitFrameConstants } from './AppKitFrameConstants';

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AppKitWebview() {
  const webviewRef = useRef<WebView>(null);
  const Theme = useTheme();
  const authConnector = ConnectorController.getAuthConnector();
  const { webviewVisible, webviewUrl } = useSnapshot(WebviewController.state);
  const [isBackdropVisible, setIsBackdropVisible] = useState(false);
  const backdropOpacity = useRef(new Animated.Value(0));
  const webviewOpacity = useRef(new Animated.Value(0));
  const provider = authConnector?.provider as AppKitFrameProvider;
  const display = webviewVisible ? 'flex' : 'none';

  const onClose = () => {
    EventsController.sendEvent({
      type: 'track',
      event: 'SOCIAL_LOGIN_CANCELED',
      properties: { provider: ConnectionController.state.selectedSocialProvider! }
    });

    WebviewController.setWebviewVisible(false);
    WebviewController.setConnecting(false);
    WebviewController.setConnectingProvider(undefined);
    RouterController.goBack();
  };

  useEffect(() => {
    Animated.timing(webviewOpacity.current, {
      toValue: webviewVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true
    }).start(({ finished }) => {
      if (finished && !webviewVisible) {
        WebviewController.setWebviewUrl('');
      }
    });

    if (webviewVisible) {
      setIsBackdropVisible(true);
    }

    Animated.timing(backdropOpacity.current, {
      toValue: webviewVisible ? 0.7 : 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => setIsBackdropVisible(webviewVisible));
  }, [backdropOpacity, webviewVisible, setIsBackdropVisible]);

  if (!webviewUrl) return null;

  return provider ? (
    <>
      <AnimatedPressable
        onPress={onClose}
        style={[
          styles.backdrop,
          !isBackdropVisible && styles.hidden,
          { backgroundColor: Theme['inverse-000'], opacity: backdropOpacity.current }
        ]}
      />
      <AnimatedSafeAreaView
        style={[
          styles.container,
          { backgroundColor: Theme['bg-100'], display, opacity: webviewOpacity.current }
        ]}
      >
        <IconLink
          icon="close"
          size="md"
          onPress={onClose}
          testID="header-close"
          style={styles.closeButton}
          iconColor="inverse-100"
          backgroundColor="gray-glass-030"
          pressedColor="gray-glass-080"
        />
        <WebView
          source={{
            uri: webviewUrl
          }}
          bounces={false}
          scalesPageToFit
          containerStyle={styles.webview}
          ref={webviewRef}
          onNavigationStateChange={async navState => {
            if (
              !navState.loading &&
              navState.url.includes(`${AppKitFrameConstants.SECURE_SITE_ORIGIN}/sdk/oauth`)
            ) {
              provider.events.emit('social', navState.url);
            }
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
    top: 0,
    zIndex: 999
  },
  container: {
    bottom: 0,
    position: 'absolute',
    height: '80%',
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
  },
  closeButton: {
    top: -60,
    right: 0,
    zIndex: 999,
    position: 'absolute',
    margin: Spacing.l
  }
});
