import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { View } from 'react-native';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { ApiController, AssetUtil, type WcWallet } from '@reown/appkit-core-react-native';
import {
  CardSelect,
  CardSelectLoader,
  CardSelectHeight,
  FlexView,
  Spacing
} from '@reown/appkit-ui-react-native';
import styles from './styles';
import { UiUtil } from '../../utils/UiUtil';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';

interface AllWalletsListProps {
  columns: number;
  onItemPress: (wallet: WcWallet) => void;
  itemWidth?: number;
}

export function AllWalletsList({ columns, itemWidth, onItemPress }: AllWalletsListProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const { maxWidth, padding } = useCustomDimensions();
  const { installed, featured, recommended, wallets } = useSnapshot(ApiController.state);
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

  const walletTemplate = ({ item }: { item: WcWallet; index: number }) => {
    const isInstalled = ApiController.state.installed.find(wallet => wallet?.id === item?.id);
    if (!item?.id) {
      return (
        <View style={[styles.itemContainer, { width: itemWidth }]}>
          <CardSelectLoader />
        </View>
      );
    }

    return (
      <View style={[styles.itemContainer, { width: itemWidth }]}>
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

  const initialFetch = async () => {
    setLoading(true);
    await ApiController.fetchWallets({ page: 1 });
    UiUtil.createViewTransition();
    setLoading(false);
  };

  const fetchNextPage = async () => {
    if (walletList.length < ApiController.state.count && !pageLoading) {
      setPageLoading(true);
      await ApiController.fetchWallets({ page: ApiController.state.page + 1 });
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (!ApiController.state.wallets.length) {
      initialFetch();
    }
  }, []);

  if (loading) {
    return loadingTemplate(20);
  }

  return (
    <BottomSheetFlatList
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
      keyExtractor={(item: WcWallet, index: number) => item?.id ?? index}
      getItemLayout={(_, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index
      })}
    />
  );
}
