import { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { RouterController } from '@web3modal/core-react-native';
import { FlexView, IconLink, SearchBar, useTheme } from '@web3modal/ui-react-native';

import styles from './styles';
import { useDebounceCallback } from '../../hooks/useDebounceCallback';
import { AllWalletsList } from '../../partials/w3m-all-wallets-list';
import { AllWalletsSearch } from '../../partials/w3m-all-wallets-search';

export function AllWalletsView() {
  const Theme = useTheme();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { width } = useWindowDimensions();
  const numColumns = Math.floor(width / 80);
  const itemMargin = Math.trunc((width / numColumns - 70) / (numColumns - 1));

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
          iconColor="blue-100"
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
      return (
        <AllWalletsSearch columns={numColumns} itemMargin={itemMargin} searchQuery={searchQuery} />
      );
    }

    return <AllWalletsList columns={numColumns} itemMargin={itemMargin} />;
  };

  return (
    <>
      {headerTemplate()}
      {listTemplate()}
    </>
  );
}
