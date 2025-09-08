import { FlatList, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { WalletItem } from './WalletItem';
import {
  CardSelectHeight,
  Spacing,
  useCustomDimensions,
  CardSelectLoader,
  CardSelectWidth
} from '@reown/appkit-ui-react-native';
import { ApiController } from '@reown/appkit-core-react-native';
import type { WcWallet } from '@reown/appkit-common-react-native';

const imageHeaders = ApiController._getApiHeaders();

const ITEM_HEIGHT = CardSelectHeight;
const ITEM_WIDTH = CardSelectWidth;
const ITEM_HEIGHT_WITH_GAP = ITEM_HEIGHT + Spacing['3xs'];

interface Props {
  data: WcWallet[];
  onItemPress: (wallet: WcWallet) => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  isLoading?: boolean;
  loadingItems?: number;
  style?: StyleProp<ViewStyle>;
}

export function WalletList({
  data,
  onItemPress,
  onEndReached,
  onEndReachedThreshold,
  isLoading = false,
  loadingItems = 20,
  style
}: Props) {
  const { padding, maxHeight } = useCustomDimensions();

  // Create loading data if isLoading is true
  const displayData = isLoading
    ? Array.from({ length: loadingItems }, (_, index) => ({ id: `loading-${index}` }) as WcWallet)
    : data;

  return (
    <FlatList
      fadingEdgeLength={20}
      bounces={false}
      numColumns={4}
      data={displayData}
      style={[styles.list, { height: maxHeight }, style]}
      columnWrapperStyle={styles.columnWrapperStyle}
      renderItem={({ item }) => {
        if (isLoading) {
          return <CardSelectLoader style={styles.itemContainer} />;
        }

        return (
          <WalletItem
            item={item}
            imageHeaders={imageHeaders}
            onItemPress={onItemPress}
            style={styles.itemContainer}
          />
        );
      }}
      contentContainerStyle={[styles.contentContainer, { paddingHorizontal: padding }]}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      keyExtractor={(item, index) => item?.id ?? `item-${index}`}
      getItemLayout={(_, index) => ({
        length: ITEM_HEIGHT_WITH_GAP,
        offset: ITEM_HEIGHT_WITH_GAP * index,
        index
      })}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: Spacing['3xs']
  },
  contentContainer: {
    paddingBottom: Spacing['4xl'],
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
