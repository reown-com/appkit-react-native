import { useRef, useEffect, useMemo } from 'react';
import {
  Animated,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSnapshot } from 'valtio';

import { DarkTheme, LightTheme } from '../constants/Colors';
import WalletItem, { ITEM_HEIGHT } from '../components/WalletItem';
import NavHeader from '../components/NavHeader';
import { RouterCtrl } from '../controllers/RouterCtrl';
import { ExplorerCtrl } from '../controllers/ExplorerCtrl';
import { OptionsCtrl } from '../controllers/OptionsCtrl';
import type { RouterProps } from '../types/routerTypes';

function ViewAllExplorer({
  isPortrait,
  windowHeight,
  windowWidth,
  isDarkMode,
}: RouterProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const optionsState = useSnapshot(OptionsCtrl.state);
  const loading = !optionsState.isDataLoaded || !optionsState.sessionUri;
  const wallets = useMemo(() => {
    return ExplorerCtrl.state.wallets.listings;
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
        maxHeight: isPortrait ? windowHeight * 0.7 : windowHeight * 0.8,
      }}
    >
      <>
        <NavHeader
          title="Connect your Wallet"
          onBackPress={RouterCtrl.goBack}
        />
        {loading ? (
          <ActivityIndicator
            style={{
              height: windowHeight * 0.6,
            }}
            color={isDarkMode ? LightTheme.accent : DarkTheme.accent}
          />
        ) : (
          <FlatList
            data={wallets || []}
            contentContainerStyle={styles.listContentContainer}
            indicatorStyle={isDarkMode ? 'white' : 'black'}
            showsVerticalScrollIndicator
            numColumns={isPortrait ? 4 : 6}
            key={isPortrait ? 'portrait' : 'landscape'}
            getItemLayout={(_data, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            })}
            renderItem={({ item }) => (
              <WalletItem
                currentWCURI={optionsState.sessionUri}
                walletInfo={item}
                style={{
                  width: isPortrait ? windowWidth / 4 : windowWidth / 7,
                }}
              />
            )}
          />
        )}
      </>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  listContentContainer: {
    paddingHorizontal: 4,
    paddingBottom: 12,
    alignItems: 'center',
  },
});

export default ViewAllExplorer;
