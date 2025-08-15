import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { FlatList } from 'react-native';
import {
  ApiController,
  OptionsController,
  SnackController,
  type OptionsControllerState
} from '@reown/appkit-core-react-native';
import { type WcWallet } from '@reown/appkit-common-react-native';
import { CardSelectHeight, Spacing, useCustomDimensions } from '@reown/appkit-ui-react-native';
import styles from './styles';
import { Placeholder } from '../w3m-placeholder';
import { Loading } from './components/Loading';
import { WalletItem } from './components/WalletItem';

interface AllWalletsListProps {
  columns: number;
  onItemPress: (wallet: WcWallet) => void;
  itemWidth?: number;
  headerHeight?: number;
}

const ITEM_HEIGHT = CardSelectHeight + Spacing.xs * 2;

export function AllWalletsList({
  columns,
  itemWidth,
  onItemPress,
  headerHeight = 0
}: AllWalletsListProps) {
  const [loading, setLoading] = useState<boolean>(ApiController.state.wallets.length === 0);
  const [loadingError, setLoadingError] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const { maxHeight, padding } = useCustomDimensions();
  const { installed, featured, recommended, wallets } = useSnapshot(ApiController.state);
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

  const initialFetch = async () => {
    try {
      setLoading(true);
      setLoadingError(false);
      await ApiController.fetchWallets({ page: 1 });
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
    return <Loading itemWidth={itemWidth} containerStyle={styles.itemContainer} />;
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
      renderItem={({ item }) => (
        <WalletItem
          item={item}
          itemWidth={itemWidth}
          imageHeaders={imageHeaders}
          onItemPress={onItemPress}
        />
      )}
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
