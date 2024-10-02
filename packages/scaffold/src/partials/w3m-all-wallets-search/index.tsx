import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { ApiController, AssetUtil, type WcWallet } from '@reown/appkit-core-react-native';
import {
  CardSelect,
  CardSelectHeight,
  CardSelectLoader,
  FlexView,
  IconBox,
  Spacing,
  Text
} from '@reown/appkit-ui-react-native';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
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

  if (ApiController.state.search.length === 0) {
    return emptyTemplate();
  }

  return (
    <BottomSheetFlatList
      key={columns}
      fadingEdgeLength={20}
      bounces={false}
      numColumns={columns}
      data={ApiController.state.search}
      renderItem={walletTemplate}
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingHorizontal: padding + Spacing.xs }]}
      ListEmptyComponent={emptyTemplate()}
      keyExtractor={(item: WcWallet) => item.id}
      getItemLayout={(_: WcWallet, index: number) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index
      })}
    />
  );
}
