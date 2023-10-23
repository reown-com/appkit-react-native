import { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { RouterController } from '@web3modal/core-react-native';
import {
  CardSelectWidth,
  FlexView,
  IconLink,
  SearchBar,
  Spacing,
  useTheme
} from '@web3modal/ui-react-native';

import styles from './styles';
import { useDebounceCallback } from '../../hooks/useDebounceCallback';
import { AllWalletsList } from '../../partials/w3m-all-wallets-list';
import { AllWalletsSearch } from '../../partials/w3m-all-wallets-search';

export function AllWalletsView() {
  const Theme = useTheme();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { width } = useWindowDimensions();
  const usableWidth = width - Spacing.s * 2;
  const numColumns = Math.floor(usableWidth / CardSelectWidth);
  const gap = Math.abs(Math.trunc((usableWidth - numColumns * CardSelectWidth) / (numColumns - 1)));

  const onInputChange = useDebounceCallback({ callback: setSearchQuery });

  const headerTemplate = () => {
    return (
      <FlexView
        padding={['s', 'm', 's', 's']}
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        style={[styles.header, { backgroundColor: Theme['bg-125'], shadowColor: Theme['bg-125'] }]}
      >
        <SearchBar onChangeText={onInputChange} />
        <IconLink
          icon="qrCode"
          iconColor="accent-100"
          background
          size="lg"
          onPress={() => RouterController.push('ConnectingWalletConnect')}
          style={styles.icon}
        />
      </FlexView>
    );
  };

  const listTemplate = () => {
    if (searchQuery) {
      return <AllWalletsSearch columns={numColumns} gap={gap} searchQuery={searchQuery} />;
    }

    return <AllWalletsList columns={numColumns} gap={gap} />;
  };

  return (
    <>
      {headerTemplate()}
      {listTemplate()}
    </>
  );
}
