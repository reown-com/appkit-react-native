import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  StyleSheet,
  useColorScheme,
} from 'react-native';

import * as Clipboard from 'expo-clipboard';
import { DEVICE_HEIGHT, DEVICE_WIDTH } from '../constants/Platform';
import NavHeader from '../components/NavHeader';
import QRCode from '../components/QRCode';
import CopyIcon from '../assets/Copy.png';
import { DarkTheme, LightTheme } from '../constants/Colors';
import { RouterCtrl } from '../controllers/RouterCtrl';
import { OptionsCtrl } from '../controllers/OptionsCtrl';

function QRCodeView() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [wcUri, setWCUri] = useState(OptionsCtrl.state.sessionUri);
  const isDarkMode = useColorScheme() === 'dark';

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(wcUri!).then(() => {
      Alert.alert('Copied to clipboard');
    });
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    const unsubscribeOptions = OptionsCtrl.subscribe((state) => {
      setWCUri(state.sessionUri);
    });
    return () => {
      unsubscribeOptions();
    };
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <NavHeader
        title="Scan the code"
        onBackPress={RouterCtrl.goBack}
        actionIcon={CopyIcon}
        onActionPress={copyToClipboard}
        actionDisabled={!wcUri}
      />
      {wcUri ? (
        <QRCode
          uri={wcUri}
          size={DEVICE_WIDTH * 0.9}
          theme={isDarkMode ? 'dark' : 'light'}
        />
      ) : (
        <ActivityIndicator
          style={styles.loader}
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
  loader: {
    height: DEVICE_HEIGHT * 0.4,
  },
});

export default QRCodeView;
