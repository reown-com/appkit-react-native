import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { FlatList } from 'react-native';
import {
  ApiController,
  AssetUtil,
  RouterController,
  type WcWallet
} from '@web3modal/core-react-native';
import { CardSelect, CardSelectHeight, FlexView, LoadingSpinner } from '@web3modal/ui-react-native';
import styles from './styles';

interface AllWalletsListProps {
  columns: number;
  itemMargin?: number;
}

export function AllWalletsList({ columns, itemMargin = 0 }: AllWalletsListProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const { featured, recommended, wallets, page, count } = useSnapshot(ApiController.state);
  const imageHeaders = ApiController._getApiHeaders();
  const walletList = [...featured, ...recommended, ...wallets];

  const ITEM_HEIGHT = CardSelectHeight + itemMargin * 2;

  const walletTemplate = ({ item }: { item: WcWallet }) => {
    return (
      <CardSelect
        key={item?.id}
        imageSrc={AssetUtil.getWalletImage(item)}
        imageHeaders={imageHeaders}
        name={item?.name ?? 'Unknown'}
        onPress={() => RouterController.push('ConnectingWalletConnect', { wallet: item })}
        style={{ margin: itemMargin }}
      />
    );
  };

  const initialFetch = async () => {
    setLoading(true);
    await ApiController.fetchWallets({ page: 1 });
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
  }, [wallets]);

  return loading ? (
    <FlexView alignItems="center" justifyContent="flex-start" style={styles.loader} padding="4xl">
      <LoadingSpinner />
    </FlexView>
  ) : (
    <FlatList
      key={columns}
      fadingEdgeLength={20}
      bounces={false}
      numColumns={columns}
      data={walletList}
      renderItem={walletTemplate}
      contentContainerStyle={styles.contentContainer}
      onEndReached={fetchNextPage}
      onEndReachedThreshold={0.5}
      ListFooterComponent={pageLoading ? <LoadingSpinner style={styles.pageLoader} /> : null}
      getItemLayout={(_, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index
      })}
    />
  );
}
