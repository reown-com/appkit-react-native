import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import {
  ApiController,
  AssetUtil,
  RouterController,
  type WcWallet
} from '@web3modal/core-react-native';
import { CardSelect, CardSelectHeight, FlexView, LoadingSpinner } from '@web3modal/ui-react-native';
import styles from './styles';

export interface AllWalletsSearchProps {
  searchQuery?: string;
  columns: number;
  itemMargin?: number;
}

export function AllWalletsSearch({ searchQuery, columns, itemMargin = 0 }: AllWalletsSearchProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const { search } = useSnapshot(ApiController.state);
  const [prevSearchQuery, setPrevSearchQuery] = useState<string>('');
  const imageHeaders = ApiController._getApiHeaders();

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
      data={search}
      renderItem={walletTemplate}
      contentContainerStyle={styles.contentContainer}
      getItemLayout={(_, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index
      })}
    />
  );
}
