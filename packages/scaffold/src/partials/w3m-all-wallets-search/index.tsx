import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import {
  ApiController,
  AssetUtil,
  RouterController,
  type WcWallet
} from '@web3modal/core-react-native';
import {
  CardSelect,
  CardSelectHeight,
  CardSelectLoader,
  FlexView,
  IconBox,
  Spacing,
  Text
} from '@web3modal/ui-react-native';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';

export interface AllWalletsSearchProps {
  searchQuery?: string;
  columns: number;
  itemWidth?: number;
}

export function AllWalletsSearch({ searchQuery, columns, itemWidth }: AllWalletsSearchProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const { search } = useSnapshot(ApiController.state);
  const [prevSearchQuery, setPrevSearchQuery] = useState<string>('');
  const imageHeaders = ApiController._getApiHeaders();
  const { maxWidth, padding, isLandscape } = useCustomDimensions();

  const ITEM_HEIGHT = CardSelectHeight + Spacing.xs * 2;

  const walletTemplate = ({ item }: { item: WcWallet }) => {
    return (
      <View key={item?.id} style={[styles.itemContainer, { width: itemWidth }]}>
        <CardSelect
          imageSrc={AssetUtil.getWalletImage(item)}
          imageHeaders={imageHeaders}
          name={item?.name ?? 'Unknown'}
          onPress={() => RouterController.push('ConnectingWalletConnect', { wallet: item })}
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
      <FlexView
        alignItems="center"
        style={[styles.emptyContainer, isLandscape && styles.emptyLandscape]}
      >
        <IconBox
          icon="walletPlaceholder"
          background
          size="lg"
          iconColor="fg-200"
          backgroundColor="gray-glass-005"
        />
        <Text variant="paragraph-500" color="fg-200" style={styles.text}>
          No wallet found
        </Text>
      </FlexView>
    );
  };

  const searchFetch = useCallback(async () => {
    setLoading(true);
    await ApiController.searchWallet({ search: searchQuery });
    setLoading(false);
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

  if (search.length === 0) {
    return emptyTemplate();
  }

  return (
    <FlatList
      key={columns}
      fadingEdgeLength={20}
      bounces={false}
      numColumns={columns}
      data={search}
      renderItem={walletTemplate}
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingHorizontal: padding + Spacing.xs }]}
      ListEmptyComponent={emptyTemplate()}
      keyExtractor={item => item.id}
      getItemLayout={(_, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index
      })}
    />
  );
}
