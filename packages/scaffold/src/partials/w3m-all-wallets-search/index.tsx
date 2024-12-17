import { useCallback, useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import {
  ApiController,
  AssetUtil,
  SnackController,
  type WcWallet
} from '@reown/appkit-core-react-native';
import {
  CardSelect,
  CardSelectHeight,
  CardSelectLoader,
  FlexView,
  Spacing
} from '@reown/appkit-ui-react-native';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { Placeholder } from '../w3m-placeholder';
import styles from './styles';

export interface AllWalletsSearchProps {
  columns: number;
  onItemPress: (wallet: WcWallet) => void;
  itemWidth?: number;
  searchQuery?: string;
}

export function AllWalletsSearch({
  searchQuery,
  columns,
  itemWidth,
  onItemPress
}: AllWalletsSearchProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingError, setLoadingError] = useState<boolean>(false);
  const [prevSearchQuery, setPrevSearchQuery] = useState<string>('');
  const imageHeaders = ApiController._getApiHeaders();
  const { maxWidth, padding, isLandscape } = useCustomDimensions();

  const ITEM_HEIGHT = CardSelectHeight + Spacing.xs * 2;

  const walletTemplate = ({ item }: { item: WcWallet }) => {
    const isInstalled = ApiController.state.installed.find(wallet => wallet?.id === item?.id);

    return (
      <View key={item?.id} style={[styles.itemContainer, { width: itemWidth }]}>
        <CardSelect
          imageSrc={AssetUtil.getWalletImage(item)}
          imageHeaders={imageHeaders}
          name={item?.name ?? 'Unknown'}
          onPress={() => onItemPress(item)}
          installed={!!isInstalled}
          testID={`wallet-search-item-${item?.id}`}
        />
      </View>
    );
  };

  const loadingTemplate = (items: number) => {
    return (
      <FlexView
        flexDirection="row"
        flexWrap="wrap"
        alignSelf="center"
        padding={['0', '0', 's', 'xs']}
        style={[styles.container, { maxWidth }]}
      >
        {Array.from({ length: items }).map((_, index) => (
          <View key={index} style={[styles.itemContainer, { width: itemWidth }]}>
            <CardSelectLoader />
          </View>
        ))}
      </FlexView>
    );
  };

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
    return loadingTemplate(20);
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
      renderItem={walletTemplate}
      style={styles.container}
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
