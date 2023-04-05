import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import WalletItem from '../components/WalletItem';
import ViewAllBox from '../components/ViewAllBox';
import QRIcon from '../assets/QR.png';
import NavHeader from '../components/NavHeader';
import { DEVICE_HEIGHT } from '../constants/Platform';
import { DarkTheme, LightTheme } from '../constants/Colors';
import type { Listing } from 'src/types/controllerTypes';

interface InitialExplorerProps {
  isLoading: boolean;
  explorerData: any;
  onViewAllPress: () => void;
  currentWCURI?: string;
  onQRPress: () => void;
}

function InitialExplorer({
  isLoading,
  explorerData,
  onViewAllPress,
  currentWCURI,
  onQRPress,
}: InitialExplorerProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isDarkMode = useColorScheme() === 'dark';

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
        title="Connect your Wallet"
        onActionPress={onQRPress}
        actionIcon={QRIcon}
        actionIconStyle={styles.qrIcon}
      />
      {isLoading || !currentWCURI ? (
        <ActivityIndicator
          style={styles.loader}
          color={isDarkMode ? LightTheme.accent : DarkTheme.accent}
        />
      ) : (
        <View style={styles.explorerContainer}>
          {explorerData.map((item: Listing) => (
            <WalletItem
              walletInfo={item}
              key={item.id}
              currentWCURI={currentWCURI}
            />
          ))}
          <ViewAllBox onPress={onViewAllPress} />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 12,
  },
  explorerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  loader: {
    height: DEVICE_HEIGHT * 0.2,
  },
  qrIcon: {
    height: 24,
    width: 24,
  },
});

export default InitialExplorer;
