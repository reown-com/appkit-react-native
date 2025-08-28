import { FlatList, StyleSheet } from 'react-native';
import { WalletItem } from './WalletItem';
import { CardSelectHeight, Spacing, useCustomDimensions } from '@reown/appkit-ui-react-native';
import { ApiController } from '@reown/appkit-core-react-native';
import type { WcWallet } from '@reown/appkit-common-react-native';

const imageHeaders = ApiController._getApiHeaders();

const ITEM_HEIGHT = CardSelectHeight;
const ITEM_HEIGHT_WITH_GAP = ITEM_HEIGHT + Spacing['3xs'];

interface Props {
  data: WcWallet[];
  onItemPress: (wallet: WcWallet) => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
}

export function WalletList({ data, onItemPress, onEndReached, onEndReachedThreshold }: Props) {
  const { padding } = useCustomDimensions();

  return (
    <FlatList
      fadingEdgeLength={20}
      bounces={false}
      numColumns={4}
      data={data}
      style={styles.list}
      columnWrapperStyle={styles.columnWrapperStyle}
      renderItem={({ item }) => (
        <WalletItem
          item={item}
          imageHeaders={imageHeaders}
          onItemPress={onItemPress}
          style={styles.itemContainer}
        />
      )}
      contentContainerStyle={[styles.contentContainer, { paddingHorizontal: padding }]}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      keyExtractor={item => item?.id}
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
    height: '100%'
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
    width: '23%'
  }
});
