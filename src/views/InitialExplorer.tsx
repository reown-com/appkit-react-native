import { useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { useSnapshot } from 'valtio';

import WalletItem from '../components/WalletItem';
import ViewAllBox from '../components/ViewAllBox';
import QRIcon from '../assets/QR.png';
import NavHeader from '../components/NavHeader';
import { DEVICE_HEIGHT } from '../constants/Platform';
import { DarkTheme, LightTheme } from '../constants/Colors';
import type { Listing } from '../types/controllerTypes';
import { RouterCtrl } from '../controllers/RouterCtrl';
import { ExplorerCtrl } from '../controllers/ExplorerCtrl';
import { OptionsCtrl } from '../controllers/OptionsCtrl';
import type { RouterProps } from '../types/routerTypes';

function InitialExplorer(_: RouterProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isDarkMode = useColorScheme() === 'dark';
  const optionsState = useSnapshot(OptionsCtrl.state);
  const loading = !optionsState.isDataLoaded || !optionsState.sessionUri;

  const wallets = useMemo(() => {
    return ExplorerCtrl.state.wallets.listings.slice(0, 7);
  }, []);

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
        onActionPress={() => RouterCtrl.push('Qrcode')}
        actionIcon={QRIcon}
        actionIconStyle={styles.qrIcon}
      />
      {loading ? (
        <ActivityIndicator
          style={styles.loader}
          color={isDarkMode ? LightTheme.accent : DarkTheme.accent}
        />
      ) : (
        <View style={styles.explorerContainer}>
          {wallets.map((item: Listing) => (
            <WalletItem
              walletInfo={item}
              key={item.id}
              currentWCURI={optionsState.sessionUri}
            />
          ))}
          <ViewAllBox onPress={() => RouterCtrl.push('WalletExplorer')} />
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
    height: DEVICE_HEIGHT * 0.3,
  },
  qrIcon: {
    height: 24,
    width: 24,
  },
});

export default InitialExplorer;
