import { useCallback, useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { ApiController, SnackController } from '@reown/appkit-core-react-native';
import { type WcWallet } from '@reown/appkit-common-react-native';
import { CardSelectHeight, Spacing, useCustomDimensions } from '@reown/appkit-ui-react-native';
import { Placeholder } from '../w3m-placeholder';
import styles from './styles';

import { Loading } from '../w3m-all-wallets-list/components/Loading';
import { WalletItem } from '../w3m-all-wallets-list/components/WalletItem';

export interface AllWalletsSearchProps {
  columns: number;
  onItemPress: (wallet: WcWallet) => void;
  itemWidth?: number;
  searchQuery?: string;
  headerHeight?: number;
}

const ITEM_HEIGHT = CardSelectHeight + Spacing.xs * 2;

export function AllWalletsSearch({
  searchQuery,
  columns,
  itemWidth,
  onItemPress,
  headerHeight = 0
}: AllWalletsSearchProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingError, setLoadingError] = useState<boolean>(false);
  const [prevSearchQuery, setPrevSearchQuery] = useState<string>('');
  const imageHeaders = ApiController._getApiHeaders();
  const { maxHeight, padding, isLandscape } = useCustomDimensions();

  const emptyTemplate = () => {
    return (
      <Placeholder
        icon="walletPlaceholder"
        description="No results found"
        style={[styles.emptyContainer, isLandscape && styles.emptyLandscape]}
      />
    );
  };

  const searchFetch = useCallback(async () => {
    try {
      setLoading(true);
      setLoadingError(false);
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
    return <Loading itemWidth={itemWidth} containerStyle={styles.itemContainer} />;
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
        style={styles.placeholderContainer}
        actionTitle="Retry"
      />
    );
  }

  if (ApiController.state.search.length === 0) {
    return emptyTemplate();
  }

  return (
    <FlatList
      key={columns}
      fadingEdgeLength={20}
      bounces={false}
      numColumns={columns}
      data={ApiController.state.search}
      renderItem={({ item }) => (
        <WalletItem
          item={item}
          itemWidth={itemWidth}
          imageHeaders={imageHeaders}
          onItemPress={onItemPress}
        />
      )}
      style={{ maxHeight: maxHeight - headerHeight - Spacing['2xl'] }}
      contentContainerStyle={[styles.contentContainer, { paddingHorizontal: padding + Spacing.xs }]}
      keyExtractor={item => item.id}
      getItemLayout={(_, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index
      })}
    />
  );
}
