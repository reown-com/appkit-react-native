import { FlatList, StyleSheet, type StyleProp, type ViewStyle, type ViewToken } from 'react-native';
import { WalletItem } from './WalletItem';
import {
  CardSelectHeight,
  Spacing,
  useCustomDimensions,
  CardSelectLoader,
  CardSelectWidth
} from '@reown/appkit-ui-react-native';
import { ApiController, EventsController } from '@reown/appkit-core-react-native';
import type { WcWallet } from '@reown/appkit-common-react-native';
import { useCallback, useRef } from 'react';

const imageHeaders = ApiController._getApiHeaders();

const ITEM_HEIGHT = CardSelectHeight;
const ITEM_WIDTH = CardSelectWidth;
const ITEM_HEIGHT_WITH_GAP = ITEM_HEIGHT + Spacing['3xs'];

interface Props {
  data: WcWallet[];
  onItemPress: (wallet: WcWallet, displayIndex: number) => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  isLoading?: boolean;
  loadingItems?: number;
  style?: StyleProp<ViewStyle>;
  testIDKey?: string;
  searchQuery?: string;
}

export function WalletList({
  data,
  onItemPress,
  onEndReached,
  onEndReachedThreshold,
  isLoading = false,
  loadingItems = 20,
  testIDKey,
  style,
  searchQuery
}: Props) {
  const { padding, maxHeight } = useCustomDimensions();
  const viewedWalletsRef = useRef<Set<string>>(new Set());

  // Create loading data if isLoading is true
  const displayData = isLoading
    ? Array.from({ length: loadingItems }, (_, index) => ({ id: `loading-${index}` }) as WcWallet)
    : data;

  const keyExtractor = useCallback(
    (item: WcWallet, index: number) => item?.id ?? `item-${index}`,
    []
  );

  const getItemLayout = useCallback((_: any, index: number) => {
    return {
      length: ITEM_HEIGHT_WITH_GAP,
      offset: ITEM_HEIGHT_WITH_GAP * index,
      index
    };
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: WcWallet; index: number }) => {
      if (isLoading) {
        return <CardSelectLoader style={styles.itemContainer} />;
      }

      return (
        <WalletItem
          item={item}
          imageHeaders={imageHeaders}
          displayIndex={index}
          onItemPress={onItemPress}
          style={styles.itemContainer}
          testID={testIDKey ? `${testIDKey}-${item?.id}` : undefined}
        />
      );
    },
    [isLoading, onItemPress, testIDKey]
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (isLoading) return;

      viewableItems.forEach(({ item }, index) => {
        const wallet = item as WcWallet;
        if (wallet?.id && !viewedWalletsRef.current.has(wallet.id)) {
          viewedWalletsRef.current.add(wallet.id);
          const isInstalled = !!ApiController.state.installed.find(w => w?.id === item?.id);
          EventsController.trackWalletImpression({
            wallet,
            view: 'AllWallets',
            displayIndex: index,
            query: searchQuery,
            installed: isInstalled
          });
        }
      });
    },
    [isLoading, searchQuery]
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50, // Item is considered visible when 50% is visible
    minimumViewTime: 100 // Must be visible for at least 100ms
  }).current;

  return (
    <FlatList
      fadingEdgeLength={20}
      bounces={false}
      numColumns={4}
      data={displayData}
      style={[styles.list, { height: maxHeight }, style]}
      columnWrapperStyle={styles.columnWrapperStyle}
      renderItem={renderItem}
      contentContainerStyle={[styles.contentContainer, { paddingHorizontal: padding }]}
      initialNumToRender={32}
      maxToRenderPerBatch={12}
      windowSize={10}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      keyExtractor={keyExtractor}
      removeClippedSubviews={true}
      getItemLayout={getItemLayout}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: Spacing['3xs']
  },
  contentContainer: {
    paddingBottom: Spacing['xs'],
    paddingTop: Spacing['3xs'],
    gap: Spacing['3xs'],
    alignItems: 'center'
  },
  columnWrapperStyle: {
    justifyContent: 'space-around'
  },
  itemContainer: {
    width: '23%',
    minWidth: ITEM_WIDTH
  }
});
