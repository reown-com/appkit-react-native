import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { FlatList, View } from 'react-native';
import {
  ApiController,
  AssetUtil,
  RouterController,
  type WcWallet
} from '@web3modal/core-react-native';
import {
  CardSelect,
  CardSelectLoader,
  CardSelectHeight,
  FlexView,
  Spacing
} from '@web3modal/ui-react-native';
import styles from './styles';
import { UiUtil } from '../../utils/UiUtil';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';

interface AllWalletsListProps {
  columns: number;
  itemWidth?: number;
}

export function AllWalletsList({ columns, itemWidth }: AllWalletsListProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const { maxWidth, padding } = useCustomDimensions();
  const { installed, featured, recommended, wallets, page, count } = useSnapshot(
    ApiController.state
  );
  const imageHeaders = ApiController._getApiHeaders();
  const preloadedWallets = installed.length + featured.length + recommended.length;
  const loadingItems = columns - ((100 + preloadedWallets) % columns);

  const walletList = [
    ...installed,
    ...featured,
    ...recommended,
    ...wallets,
    ...(pageLoading ? (Array.from({ length: loadingItems }) as WcWallet[]) : [])
  ];

  const ITEM_HEIGHT = CardSelectHeight + Spacing.xs * 2;

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

  const walletTemplate = ({ item, index }: { item: WcWallet; index: number }) => {
    if (!item?.id) {
      return (
        <View key={index} style={[styles.itemContainer, { width: itemWidth }]}>
          <CardSelectLoader />
        </View>
      );
    }

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

  const initialFetch = async () => {
    setLoading(true);
    await ApiController.fetchWallets({ page: 1 });
    UiUtil.createViewTransition();
    setLoading(false);
  };

  const fetchNextPage = async () => {
    if (walletList.length < count && !pageLoading) {
      setPageLoading(true);
      await ApiController.fetchWallets({ page: page + 1 });
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (!wallets.length) {
      initialFetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return loadingTemplate(20);
  }

  return (
    <FlatList
      key={columns}
      fadingEdgeLength={20}
      bounces={false}
      numColumns={columns}
      data={walletList}
      renderItem={walletTemplate}
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingHorizontal: padding + Spacing.xs }]}
      onEndReached={fetchNextPage}
      onEndReachedThreshold={2}
      keyExtractor={(item, index) => item?.id ?? index}
      getItemLayout={(_, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index
      })}
    />
  );
}
