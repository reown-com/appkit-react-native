import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useSnapshot } from 'valtio';

import NavHeader from '../components/NavHeader';
import QRCode from '../components/QRCode';
import CopyIcon from '../assets/Copy.png';
import { DarkTheme, LightTheme } from '../constants/Colors';
import { RouterCtrl } from '../controllers/RouterCtrl';
import { OptionsCtrl } from '../controllers/OptionsCtrl';
import type { RouterProps } from '../types/routerTypes';
import { useOrientation } from '../hooks/useOrientation';

function QRCodeView({ onCopyClipboard }: RouterProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const optionsState = useSnapshot(OptionsCtrl.state);
  const isDarkMode = useColorScheme() === 'dark';
  const { height, width, isPortrait } = useOrientation();

  const copyToClipboard = async () => {
    if (onCopyClipboard && optionsState.sessionUri) {
      onCopyClipboard(optionsState.sessionUri);
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
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <NavHeader
        title="Scan the code"
        onBackPress={RouterCtrl.goBack}
        actionIcon={CopyIcon}
        onActionPress={onCopyClipboard ? copyToClipboard : undefined}
        actionDisabled={!optionsState.sessionUri}
      />
      {optionsState?.sessionUri ? (
        <QRCode
          uri={optionsState.sessionUri}
          size={isPortrait ? width * 0.9 : height * 0.5}
          theme={isDarkMode ? 'dark' : 'light'}
        />
      ) : (
        <ActivityIndicator
          style={{ height: isPortrait ? width * 0.9 : height * 0.5 }}
          color={isDarkMode ? LightTheme.accent : DarkTheme.accent}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 32,
  },
});

export default QRCodeView;
