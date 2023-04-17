import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet } from 'react-native';
import { useSnapshot } from 'valtio';

import NavHeader from '../components/NavHeader';
import QRCode from '../components/QRCode';
import CopyIcon from '../assets/Copy.png';
import { DarkTheme, LightTheme } from '../constants/Colors';
import { RouterCtrl } from '../controllers/RouterCtrl';
import { OptionsCtrl } from '../controllers/OptionsCtrl';
import type { RouterProps } from '../types/routerTypes';

function QRCodeView({
  onCopyClipboard,
  isPortrait,
  windowHeight,
  windowWidth,
  isDarkMode,
}: RouterProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const optionsState = useSnapshot(OptionsCtrl.state);

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
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          height: isPortrait ? windowHeight * 0.5 : windowHeight * 0.8,
        },
      ]}
    >
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
    paddingBottom: 32,
  },
});

export default QRCodeView;
