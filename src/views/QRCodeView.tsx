import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet } from 'react-native';
import { useSnapshot } from 'valtio';

import NavHeader from '../components/NavHeader';
import QRCode from '../components/QRCode';
import CopyIcon from '../assets/Copy.png';
import { DarkTheme, LightTheme } from '../constants/Colors';
import { RouterCtrl } from '../controllers/RouterCtrl';
import { WcConnectionCtrl } from '../controllers/WcConnectionCtrl';
import type { RouterProps } from '../types/routerTypes';

function QRCodeView({
  onCopyClipboard,
  isPortrait,
  windowHeight,
  windowWidth,
  isDarkMode,
}: RouterProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const wcConnectionState = useSnapshot(WcConnectionCtrl.state);

  const copyToClipboard = async () => {
    if (onCopyClipboard && wcConnectionState.pairingUri) {
      onCopyClipboard(wcConnectionState.pairingUri);
      // Show toast
    }
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          maxHeight: isPortrait ? windowHeight * 0.9 : windowHeight * 0.8,
        },
      ]}
    >
      <NavHeader
        title="Scan the code"
        onBackPress={RouterCtrl.goBack}
        actionIcon={CopyIcon}
        onActionPress={onCopyClipboard ? copyToClipboard : undefined}
        actionDisabled={!wcConnectionState.pairingUri}
      />
      {wcConnectionState?.pairingUri ? (
        <QRCode
          uri={wcConnectionState.pairingUri}
          size={isPortrait ? windowWidth * 0.9 : windowHeight * 0.6}
          theme={isDarkMode ? 'dark' : 'light'}
        />
      ) : (
        <ActivityIndicator
          style={{
            height: isPortrait ? windowWidth * 0.9 : windowHeight * 0.6,
          }}
          color={isDarkMode ? LightTheme.accent : DarkTheme.accent}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 12,
  },
});

export default QRCodeView;
