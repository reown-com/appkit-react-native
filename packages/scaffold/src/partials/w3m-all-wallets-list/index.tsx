import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { FlatList } from 'react-native';
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
  FlexView
} from '@web3modal/ui-react-native';
import styles from './styles';
import { UiUtil } from '../../utils/UiUtil';

interface AllWalletsListProps {
  columns: number;
  gap?: number;
}

export function AllWalletsList({ columns, gap = 0 }: AllWalletsListProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const { installed, featured, recommended, wallets, page, count } = useSnapshot(
    ApiController.state
  );
  const imageHeaders = ApiController._getApiHeaders();
  const walletList = [...installed, ...featured, ...recommended, ...wallets];

  const ITEM_HEIGHT = CardSelectHeight + gap * 2;

  const loadingTemplate = (items: number) => {
    return (
      <FlexView
        flexDirection="row"
        flexWrap="wrap"
        padding={['2xs', '0', 's', 's']}
        style={{ gap }}
      >
        {Array.from({ length: items }).map((_, index) => (
          <CardSelectLoader key={index} />
        ))}
      </FlexView>
    );
  };

  const walletTemplate = ({ item }: { item: WcWallet }) => {
    return (
      <CardSelect
        key={item?.id}
        imageSrc={AssetUtil.getWalletImage(item)}
        imageHeaders={imageHeaders}
        name={item?.name ?? 'Unknown'}
        onPress={() => RouterController.push('ConnectingWalletConnect', { wallet: item })}
      />
    );
  };

  const pageLoadingTemplate = (items: number) => {
    if (pageLoading) return null;

    return (
      <FlexView flexDirection="row" style={{ gap }}>
        {Array.from({ length: items }).map((_, index) => (
          <CardSelectLoader key={index} />
        ))}
      </FlexView>
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
  }, [wallets]);

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
      extraData={pageLoading}
      renderItem={walletTemplate}
      contentContainerStyle={[styles.contentContainer, { gap }]}
      columnWrapperStyle={{ gap }}
      onEndReached={fetchNextPage}
      onEndReachedThreshold={0.7}
      ListFooterComponent={pageLoadingTemplate(columns)}
      getItemLayout={(_, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index
      })}
    />
  );
}
