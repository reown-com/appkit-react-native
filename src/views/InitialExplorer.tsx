import { useEffect, useMemo } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useSnapshot } from 'valtio';

import WalletItem from '../components/WalletItem';
import ViewAllBox from '../components/ViewAllBox';
import QRIcon from '../assets/QRCode';
import NavHeader from '../components/NavHeader';
import type { Listing } from '../types/controllerTypes';
import { RouterCtrl } from '../controllers/RouterCtrl';
import { ExplorerCtrl } from '../controllers/ExplorerCtrl';
import { OptionsCtrl } from '../controllers/OptionsCtrl';
import { WcConnectionCtrl } from '../controllers/WcConnectionCtrl';
import type { RouterProps } from '../types/routerTypes';
import useTheme from '../hooks/useTheme';
import { UiUtil } from '../utils/UiUtil';

function InitialExplorer({ windowHeight, isPortrait }: RouterProps) {
  const Theme = useTheme();
  const { isDataLoaded } = useSnapshot(OptionsCtrl.state);
  const { pairingUri } = useSnapshot(WcConnectionCtrl.state);
  const loading = useMemo(
    () => !isDataLoaded || !pairingUri,
    [isDataLoaded, pairingUri]
  );

  useEffect(() => {
    if (!loading) {
      UiUtil.layoutAnimation();
    }
  }, [loading]);

  const wallets = useMemo(() => {
    return ExplorerCtrl.state.wallets.listings.slice(0, 7);
  }, []);

  const viewAllWallets = useMemo(() => {
    return ExplorerCtrl.state.wallets.listings.slice(7, 11);
  }, []);

  return (
    <>
      <NavHeader
        title="Connect your wallet"
        onActionPress={() => RouterCtrl.push('Qrcode')}
        actionIcon={QRIcon}
      />
      {loading ? (
        <ActivityIndicator
          style={{ height: Math.round(windowHeight * 0.3) }}
          color={Theme.accent}
        />
      ) : (
        <View style={styles.explorerContainer}>
          {wallets.map((item: Listing) => (
            <WalletItem
              walletInfo={item}
              key={item.id}
              currentWCURI={pairingUri}
              style={isPortrait && styles.wallet}
            />
          ))}
          <ViewAllBox
            onPress={() => RouterCtrl.push('WalletExplorer')}
            wallets={viewAllWallets}
            style={isPortrait && styles.wallet}
          />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  explorerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wallet: {
    width: '25%',
  },
});

export default InitialExplorer;
