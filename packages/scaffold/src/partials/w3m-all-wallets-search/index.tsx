import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import {
  ApiController,
  AssetUtil,
  RouterController,
  type WcWallet
} from '@web3modal/core-react-native';
import {
  CardSelect,
  CardSelectHeight,
  CardSelectLoader,
  FlexView,
  IconBox,
  Text
} from '@web3modal/ui-react-native';
import styles from './styles';

export interface AllWalletsSearchProps {
  searchQuery?: string;
  columns: number;
  gap?: number;
}

export function AllWalletsSearch({ searchQuery, columns, gap = 0 }: AllWalletsSearchProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const { search } = useSnapshot(ApiController.state);
  const [prevSearchQuery, setPrevSearchQuery] = useState<string>('');
  const imageHeaders = ApiController._getApiHeaders();

  const ITEM_HEIGHT = CardSelectHeight + gap * 2;

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

  const loadingTemplate = (items: number) => {
    return (
      <FlexView
        flexDirection="row"
        flexWrap="wrap"
        padding={['2xs', 's', 's', 's']}
        style={{ gap }}
      >
        {Array.from({ length: items }).map((_, index) => (
          <CardSelectLoader key={index} />
        ))}
      </FlexView>
    );
  };

  const emptyTemplate = () => {
    return (
      <FlexView justifyContent="center" alignItems="center" gap="m" style={styles.emptyContainer}>
        <IconBox
          icon="walletPlaceholder"
          background
          size="lg"
          iconColor="fg-200"
          backgroundColor="gray-glass-005"
        />
        <Text variant="paragraph-500" color="fg-200">
          No wallet found
        </Text>
      </FlexView>
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

  if (loading) {
    return loadingTemplate(40);
  }

  return (
    <FlatList
      key={columns}
      fadingEdgeLength={20}
      bounces={false}
      numColumns={columns}
      data={search}
      renderItem={walletTemplate}
      contentContainerStyle={[styles.contentContainer, { gap }]}
      columnWrapperStyle={{ gap }}
      ListEmptyComponent={emptyTemplate()}
      getItemLayout={(_, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index
      })}
    />
  );
}
