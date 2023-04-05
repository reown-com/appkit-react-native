import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  StyleSheet,
  useColorScheme,
} from 'react-native';
// import Clipboard from '@react-native-clipboard/clipboard';
import * as Clipboard from 'expo-clipboard';
import { DEVICE_HEIGHT, DEVICE_WIDTH } from '../constants/Platform';
import NavHeader from '../components/NavHeader';
import QRCode from '../components/QRCode';
import CopyIcon from '../assets/Copy.png';
import { DarkTheme, LightTheme } from '../constants/Colors';

interface Props {
  uri?: string;
  onBackPress: () => void;
}

function QRCodeView({ uri, onBackPress }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isDarkMode = useColorScheme() === 'dark';

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(uri!).then(() => {
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

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <NavHeader
        title="Scan the code"
        onBackPress={onBackPress}
        actionIcon={CopyIcon}
        onActionPress={copyToClipboard}
        actionDisabled={!uri}
      />
      {uri ? (
        <QRCode
          uri={uri}
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
