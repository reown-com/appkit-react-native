import { useState } from 'react';
import { useSnapshot } from 'valtio';
import {
  ConnectionController,
  ConnectorController,
  EventsController,
  RouterController,
  type WcWallet
} from '@reown/core-react-native';
import { FlexView, IconLink, SearchBar, Spacing, useTheme } from '@reown/ui-react-native';

import styles from './styles';
import { useDebounceCallback } from '../../hooks/useDebounceCallback';
import { AllWalletsList } from '../../partials/w3m-all-wallets-list';
import { AllWalletsSearch } from '../../partials/w3m-all-wallets-search';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';

export function AllWalletsView() {
  const Theme = useTheme();
  const { connectors } = useSnapshot(ConnectorController.state);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { maxWidth } = useCustomDimensions();
  const numColumns = 4;
  const usableWidth = maxWidth - Spacing.xs * 2;
  const itemWidth = Math.abs(Math.trunc(usableWidth / numColumns));

  const onInputChange = useDebounceCallback({ callback: setSearchQuery });

  const onWalletPress = (wallet: WcWallet) => {
    const connector = connectors.find(c => c.explorerId === wallet.id);
    if (connector) {
      RouterController.push('ConnectingExternal', { connector, wallet });
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
    ConnectionController.removePressedWallet();
    ConnectionController.removeWcLinking();
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
        alignItems="center"
        style={[
          styles.header,
          { backgroundColor: Theme['bg-125'], shadowColor: Theme['bg-125'], width: maxWidth }
        ]}
      >
        <SearchBar onChangeText={onInputChange} testID="input-search" />
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
        />
      );
    }

    return (
      <AllWalletsList columns={numColumns} itemWidth={itemWidth} onItemPress={onWalletPress} />
    );
  };

  return (
    <>
      {headerTemplate()}
      {listTemplate()}
    </>
  );
}
