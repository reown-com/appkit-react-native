import { useSnapshot } from 'valtio';
import { memo, useEffect, useRef, useState } from 'react';
import { Animated, SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import {
  ConnectorController,
  RouterController,
  WebviewController
} from '@reown/appkit-core-react-native';
import { useTheme, BorderRadius, IconLink, Spacing } from '@reown/appkit-ui-react-native';
import type { AppKitFrameProvider } from './AppKitFrameProvider';
import { AppKitFrameConstants } from './AppKitFrameConstants';

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

function _AppKitWebview() {
  const webviewRef = useRef<WebView>(null);
  const Theme = useTheme();
  const authConnector = ConnectorController.getAuthConnector();
  const { webviewVisible, webviewUrl } = useSnapshot(WebviewController.state);
  const [isBackdropVisible, setIsBackdropVisible] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0));
  const backdropOpacity = useRef(new Animated.Value(0));
  const webviewOpacity = useRef(new Animated.Value(0));
  const provider = authConnector?.provider as AppKitFrameProvider;

  const show = animatedHeight.current.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '80%']
  });

  const onClose = () => {
    WebviewController.setWebviewVisible(false);
    WebviewController.setConnecting(false);
    WebviewController.setConnectingProvider(undefined);
    RouterController.goBack();
  };

  useEffect(() => {
    Animated.timing(animatedHeight.current, {
      toValue: webviewVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: false
    }).start();

    Animated.timing(webviewOpacity.current, {
      toValue: webviewVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: false
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
      useNativeDriver: false
    }).start(() => setIsBackdropVisible(webviewVisible));
  }, [animatedHeight, backdropOpacity, webviewVisible, setIsBackdropVisible]);

  if (!webviewUrl) return null;

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
        <IconLink
          icon="close"
          size="md"
          onPress={onClose}
          testID="button-close"
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

export const AppKitWebview = memo(_AppKitWebview);

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
  },
  closeButton: {
    top: -60,
    right: 0,
    zIndex: 999,
    position: 'absolute',
    margin: Spacing.l
  }
});
