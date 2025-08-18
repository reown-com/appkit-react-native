import { useState } from 'react';
import { WcController, EventsController, RouterController } from '@reown/appkit-core-react-native';
import { type WcWallet } from '@reown/appkit-common-react-native';
import {
  FlexView,
  IconLink,
  SearchBar,
  Spacing,
  useTheme,
  useCustomDimensions
} from '@reown/appkit-ui-react-native';

import styles from './styles';
import { useDebounceCallback } from '../../hooks/useDebounceCallback';
import { AllWalletsList } from '../../partials/w3m-all-wallets-list';
import { AllWalletsSearch } from '../../partials/w3m-all-wallets-search';
import { WcHelpersUtil } from '../../utils/HelpersUtil';
import type { LayoutChangeEvent } from 'react-native';

export function AllWalletsView() {
  const Theme = useTheme();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { maxWidth } = useCustomDimensions();
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const numColumns = 4;
  const usableWidth = maxWidth - Spacing.xs * 2;
  const itemWidth = Math.abs(Math.trunc(usableWidth / numColumns));

  const { debouncedCallback: onInputChange } = useDebounceCallback({ callback: setSearchQuery });

  const onHeaderLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height);
  };

  const onWalletPress = (wallet: WcWallet) => {
    const isExternal = WcHelpersUtil.isExternalWallet(wallet);
    if (isExternal) {
      RouterController.push('ConnectingExternal', { wallet });
    } else {
      RouterController.push('ConnectingWalletConnect', { wallet });
    }

    EventsController.sendEvent({
      type: 'track',
      event: 'SELECT_WALLET',
      properties: { name: wallet.name ?? 'Unknown', platform: 'mobile', explorer_id: wallet.id }
    });
  };

  const onQrCodePress = () => {
    WcController.removePressedWallet();
    WcController.removeWcLinking();
    RouterController.push('ConnectingWalletConnect');

    EventsController.sendEvent({
      type: 'track',
      event: 'SELECT_WALLET',
      properties: { name: 'WalletConnect', platform: 'qrcode' }
    });
  };

  const headerTemplate = () => {
    return (
      <FlexView
        padding={['s', 'l', 'xs', 'l']}
        flexDirection="row"
        onLayout={onHeaderLayout}
        alignItems="center"
        style={[
          styles.header,
          { backgroundColor: Theme['bg-100'], shadowColor: Theme['bg-100'], width: maxWidth }
        ]}
      >
        <SearchBar
          onChangeText={onInputChange}
          placeholder="Search wallet"
          style={styles.searchBar}
        />
        <IconLink
          icon="qrCode"
          iconColor="accent-100"
          pressedColor="accent-glass-020"
          backgroundColor="accent-glass-010"
          size="lg"
          onPress={onQrCodePress}
          style={[styles.icon, { borderColor: Theme['accent-glass-010'] }]}
          testID="button-qr-code"
        />
      </FlexView>
    );
  };

  const listTemplate = () => {
    if (searchQuery) {
      return (
        <AllWalletsSearch
          columns={numColumns}
          itemWidth={itemWidth}
          searchQuery={searchQuery}
          onItemPress={onWalletPress}
          headerHeight={headerHeight}
        />
      );
    }

    return (
      <AllWalletsList
        columns={numColumns}
        itemWidth={itemWidth}
        onItemPress={onWalletPress}
        headerHeight={headerHeight}
      />
    );
  };

  return (
    <>
      {headerTemplate()}
      {listTemplate()}
    </>
  );
}
