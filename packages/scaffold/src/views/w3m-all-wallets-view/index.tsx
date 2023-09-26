import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { FlatList, useWindowDimensions } from 'react-native';
import {
  ApiController,
  AssetUtil,
  RouterController,
  type WcWallet
} from '@web3modal/core-react-native';
import { CardSelect, FlexView, IconLink, SearchBar, useTheme } from '@web3modal/ui-react-native';

import styles from './styles';

export function AllWalletsView() {
  const Theme = useTheme();
  const { featured, recommended, wallets } = useSnapshot(ApiController.state);
  const { width } = useWindowDimensions();
  const numColumns = Math.floor(width / 80);
  const gap = Math.trunc((width / numColumns - 70) / (numColumns - 1));
  const walletList = [...featured, ...recommended, ...wallets];

  useEffect(() => {
    if (!wallets.length) {
      ApiController.fetchWallets({ page: 1 });
    }
  }, [wallets]);

  const headerTemplate = () => {
    return (
      <FlexView
        padding={['s', 'm', 's', 's']}
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        style={[styles.header, { backgroundColor: Theme['bg-125'], shadowColor: Theme['bg-125'] }]}
      >
        <SearchBar />
        <IconLink
          icon="qrCode"
          iconColor="blue-100"
          background
          size="lg"
          onPress={() => RouterController.push('ConnectingWalletConnect')}
          style={{ marginLeft: 8 }}
        />
      </FlexView>
    );
  };

  const walletTemplate = ({ item }: { item: WcWallet }) => {
    return (
      <CardSelect
        key={item?.id}
        imageSrc={AssetUtil.getWalletImage(item)}
        imageHeaders={ApiController._getApiHeaders()}
        name={item?.name ?? 'Unknown'}
        onPress={() => RouterController.push('ConnectingWalletConnect', { wallet: item })}
        style={{ margin: gap }}
      />
    );
  };

  return (
    <>
      {headerTemplate()}
      <FlatList
        key={numColumns}
        fadingEdgeLength={20}
        bounces={false}
        numColumns={numColumns}
        data={walletList}
        renderItem={walletTemplate}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      />
    </>
  );
}
