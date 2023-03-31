import React, { useRef, useEffect, useMemo, useState } from 'react';
import {
  Animated,
  StyleSheet,
  useColorScheme,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { DarkTheme, LightTheme } from '../constants/Colors';
import { DEVICE_HEIGHT } from '../constants/Platform';
import WalletItem, { ITEM_HEIGHT } from '../components/WalletItem';

import NavHeader from '../components/NavHeader';
import { RouterCtrl } from '../controllers/RouterCtrl';
import { ExplorerCtrl } from '../controllers/ExplorerCtrl';
import { OptionsCtrl } from '../controllers/OptionsCtrl';
import type { RouterProps } from '../types/routerTypes';

function ViewAllExplorer(_: RouterProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = useState(!OptionsCtrl.state.isDataLoaded);
  const [wcUri, setWCUri] = useState(OptionsCtrl.state.sessionUri);
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

  useEffect(() => {
    const unsubscribeOptions = OptionsCtrl.subscribe((state) => {
      setIsLoading(!state.isDataLoaded);
      setWCUri(state.sessionUri);
    });
    return () => {
      unsubscribeOptions();
    };
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <>
        <NavHeader
          title="Connect your Wallet"
          onBackPress={RouterCtrl.goBack}
        />
        {isLoading || !wcUri ? (
          <ActivityIndicator
            style={styles.loader}
            color={isDarkMode ? LightTheme.accent : DarkTheme.accent}
          />
        ) : (
          <FlatList
            data={wallets || []}
            style={styles.list}
            contentContainerStyle={styles.listContentContainer}
            indicatorStyle={isDarkMode ? 'white' : 'black'}
            showsVerticalScrollIndicator
            numColumns={4}
            getItemLayout={(_, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            })}
            renderItem={({ item }) => (
              <WalletItem currentWCURI={wcUri} walletInfo={item} />
            )}
          />
        )}
      </>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  list: {
    maxHeight: DEVICE_HEIGHT * 0.6,
  },
  listContentContainer: {
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
  loader: {
    height: DEVICE_HEIGHT * 0.4,
  },
});

export default ViewAllExplorer;
