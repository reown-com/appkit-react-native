import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { FlatList, View } from 'react-native';
import {
  ApiController,
  AssetController,
  AssetUtil,
  OptionsController,
  SnackController,
  type OptionsControllerState
} from '@reown/appkit-core-react-native';
import { type WcWallet } from '@reown/appkit-common-react-native';
import {
  CardSelect,
  CardSelectLoader,
  CardSelectHeight,
  FlexView,
  Spacing,
  useCustomDimensions
} from '@reown/appkit-ui-react-native';
import styles from './styles';
import { UiUtil } from '../../utils/UiUtil';
import { Placeholder } from '../w3m-placeholder';

interface AllWalletsListProps {
  columns: number;
  onItemPress: (wallet: WcWallet) => void;
  itemWidth?: number;
  headerHeight?: number;
}

export function AllWalletsList({
  columns,
  itemWidth,
  onItemPress,
  headerHeight = 0
}: AllWalletsListProps) {
  const [loading, setLoading] = useState<boolean>(ApiController.state.wallets.length === 0);
  const [loadingError, setLoadingError] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const { maxWidth, maxHeight, padding } = useCustomDimensions();
  const { installed, featured, recommended, wallets } = useSnapshot(ApiController.state);
  const { walletImages } = useSnapshot(AssetController.state);
  const { customWallets } = useSnapshot(OptionsController.state) as OptionsControllerState;
  const imageHeaders = ApiController._getApiHeaders();
  const preloadedWallets = installed.length + featured.length + recommended.length;
  const loadingItems = columns - ((100 + preloadedWallets) % columns);

  const combinedWallets = [
    ...(customWallets ?? []),
    ...installed,
    ...featured,
    ...recommended,
    ...wallets
  ];

  // Deduplicate by wallet ID
  const uniqueWallets = Array.from(
    new Map(combinedWallets.map(wallet => [wallet?.id, wallet])).values()
  ).filter(wallet => wallet?.id); // Filter out any undefined wallets

  const walletList = [
    ...uniqueWallets,
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
        style={{ maxWidth, maxHeight }}
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
          imageSrc={AssetUtil.getWalletImage(item, walletImages)}
          imageHeaders={imageHeaders}
          name={item?.name ?? 'Unknown'}
          onPress={() => onItemPress(item)}
          installed={!!isInstalled}
        />
      </View>
    );
  };

  const initialFetch = async () => {
    try {
      setLoading(true);
      setLoadingError(false);
      await ApiController.fetchWallets({ page: 1 });
      UiUtil.createViewTransition();
      setLoading(false);
    } catch (error) {
      SnackController.showError('Failed to load wallets');
      setLoading(false);
      setLoadingError(true);
    }
  };

  const fetchNextPage = async () => {
    try {
      if (
        walletList.length < ApiController.state.count &&
        !pageLoading &&
        !loading &&
        ApiController.state.page > 0
      ) {
        setPageLoading(true);
        await ApiController.fetchWallets({ page: ApiController.state.page + 1 });
        setPageLoading(false);
      }
    } catch (error) {
      SnackController.showError('Failed to load more wallets');
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

  if (loadingError) {
    return (
      <Placeholder
        icon="warningCircle"
        iconColor="error-100"
        title="Oops, we couldn't load the wallets at the moment"
        description={`This might be due to a temporary network issue.\nPlease try reloading to see if that helps.`}
        actionIcon="refresh"
        actionPress={initialFetch}
        actionTitle="Retry"
        style={styles.placeholderContainer}
      />
    );
  }

  return (
    <FlatList
      key={columns}
      fadingEdgeLength={20}
      bounces={false}
      numColumns={columns}
      data={walletList}
      renderItem={walletTemplate}
      style={{ maxHeight: maxHeight - headerHeight - Spacing['4xl'] }}
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
