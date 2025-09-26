import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useState } from 'react';
import { ApiController, OptionsController, SnackController } from '@reown/appkit-core-react-native';
import { type WcWallet } from '@reown/appkit-common-react-native';
import { useCustomDimensions } from '@reown/appkit-ui-react-native';
import { Placeholder } from '../w3m-placeholder';
import styles from './styles';

import { Loading } from '../w3m-all-wallets-list/components/Loading';
import { WalletList } from '../w3m-all-wallets-list/components/WalletList';

export interface AllWalletsSearchProps {
  onItemPress: (wallet: WcWallet) => void;
  searchQuery?: string;
}

export function AllWalletsSearch({ searchQuery, onItemPress }: AllWalletsSearchProps) {
  const { search } = useSnapshot(ApiController.state);
  const { customWallets } = useSnapshot(OptionsController.state);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingError, setLoadingError] = useState<boolean>(false);
  const [prevSearchQuery, setPrevSearchQuery] = useState<string>('');
  const { isLandscape } = useCustomDimensions();

  const customWalletResults = (customWallets ?? []).filter(wallet =>
    wallet.name.toLowerCase().includes(searchQuery?.toLowerCase() ?? '')
  );

  const results = [...search, ...customWalletResults];

  const searchFetch = useCallback(async () => {
    try {
      setLoading(true);
      setLoadingError(false);
      // eslint-disable-next-line valtio/state-snapshot-rule
      await ApiController.searchWallet({ search: searchQuery });
      setLoading(false);
    } catch (error) {
      SnackController.showError('Failed to load wallets');
      setLoading(false);
      setLoadingError(true);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (prevSearchQuery !== searchQuery) {
      setPrevSearchQuery(searchQuery || '');
      searchFetch();
    }
  }, [searchQuery, prevSearchQuery, searchFetch]);

  if (loading) {
    return <Loading loadingItems={12} />;
  }

  if (loadingError) {
    return (
      <Placeholder
        icon="warningCircle"
        iconColor="error-100"
        title="Oops, we couldn’t load the wallets at the moment"
        description={`This might be due to a temporary network issue.\nPlease try reloading to see if that helps.`}
        actionIcon="refresh"
        actionPress={searchFetch}
        style={[styles.placeholderContainer]}
        actionTitle="Retry"
      />
    );
  }

  if (results.length === 0) {
    return (
      <Placeholder
        icon="walletPlaceholder"
        description="No results found"
        style={[styles.emptyContainer, isLandscape && styles.emptyLandscape]}
      />
    );
  }

  return <WalletList onItemPress={onItemPress} data={results} testIDKey="wallet-search-item" />;
}
