import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, Animated, ActivityIndicator } from 'react-native';
import { useSnapshot } from 'valtio';

import WalletItem from '../components/WalletItem';
import ViewAllBox from '../components/ViewAllBox';
import QRIcon from '../assets/QR.png';
import NavHeader from '../components/NavHeader';
import { DarkTheme, LightTheme } from '../constants/Colors';
import type { Listing } from '../types/controllerTypes';
import { RouterCtrl } from '../controllers/RouterCtrl';
import { ExplorerCtrl } from '../controllers/ExplorerCtrl';
import { OptionsCtrl } from '../controllers/OptionsCtrl';
import type { RouterProps } from '../types/routerTypes';

function InitialExplorer({
  windowHeight,
  isPortrait,
  isDarkMode,
}: RouterProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
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
    <Animated.View
      style={{
        opacity: fadeAnim,
      }}
    >
      <NavHeader
        title="Connect your Wallet"
        onActionPress={() => RouterCtrl.push('Qrcode')}
        actionIcon={QRIcon}
        actionIconStyle={styles.qrIcon}
      />
      {loading ? (
        <ActivityIndicator
          style={{
            height: isPortrait ? windowHeight * 0.3 : windowHeight * 0.7,
          }}
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
  explorerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  qrIcon: {
    height: 24,
    width: 24,
  },
});

export default InitialExplorer;
