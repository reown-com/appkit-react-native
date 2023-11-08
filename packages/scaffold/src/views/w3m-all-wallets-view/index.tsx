import { useState } from 'react';
import { ConnectionController, RouterController } from '@web3modal/core-react-native';
import { FlexView, IconLink, SearchBar, Spacing, useTheme } from '@web3modal/ui-react-native';

import styles from './styles';
import { useDebounceCallback } from '../../hooks/useDebounceCallback';
import { AllWalletsList } from '../../partials/w3m-all-wallets-list';
import { AllWalletsSearch } from '../../partials/w3m-all-wallets-search';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';

export function AllWalletsView() {
  const Theme = useTheme();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { maxWidth } = useCustomDimensions();
  const numColumns = 4;
  const usableWidth = maxWidth - Spacing.xs * 2;
  const itemWidth = Math.abs(Math.trunc(usableWidth / numColumns));

  const onInputChange = useDebounceCallback({ callback: setSearchQuery });

  const onQrCodePress = () => {
    ConnectionController.removePressedWallet();
    ConnectionController.removeWcLinking();
    RouterController.push('ConnectingWalletConnect');
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
        <SearchBar onChangeText={onInputChange} />
        <IconLink
          icon="qrCode"
          iconColor="accent-100"
          pressedColor="accent-glass-020"
          backgroundColor="accent-glass-010"
          size="lg"
          onPress={onQrCodePress}
          style={[styles.icon, { borderColor: Theme['accent-glass-010'] }]}
        />
      </FlexView>
    );
  };

  const listTemplate = () => {
    if (searchQuery) {
      return (
        <AllWalletsSearch columns={numColumns} itemWidth={itemWidth} searchQuery={searchQuery} />
      );
    }

    return <AllWalletsList columns={numColumns} itemWidth={itemWidth} />;
  };

  return (
    <>
      {headerTemplate()}
      {listTemplate()}
    </>
  );
}
