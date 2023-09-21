import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { FlatList, View } from 'react-native';
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
  const { wallets } = useSnapshot(ApiController.state);

  useEffect(() => {
    if (!wallets.length) {
      ApiController.fetchWallets({ page: 1 });
    }
  }, [wallets]);

  const headerTemplate = () => {
    return (
      <FlexView
        padding={['2xs', 'm', '2xs', 'm']}
        columnGap="xs"
        flexDirection="row"
        alignItems="center"
        style={[styles.header, { backgroundColor: Theme['bg-125'], shadowColor: Theme['bg-125'] }]}
      >
        <SearchBar inputStyle={{ width: '70%' }} />
        <IconLink
          icon="qrCode"
          iconColor="blue-100"
          size="lg"
          onPress={() => RouterController.push('ConnectingWalletConnect')}
        />
      </FlexView>
    );
  };

  const walletTemplate = ({ item }: { item: WcWallet }) => {
    return (
      <View style={styles.wallet}>
        <CardSelect
          key={item?.id}
          imageSrc={AssetUtil.getWalletImage(item)}
          imageHeaders={ApiController._getApiHeaders()}
          name={item?.name ?? 'Unknown'}
          onPress={() => RouterController.push('ConnectingWalletConnect', { wallet: item })}
        />
      </View>
    );
  };

  return (
    <>
      {headerTemplate()}
      <FlatList
        fadingEdgeLength={20}
        numColumns={4}
        data={wallets}
        renderItem={walletTemplate}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      />
    </>
  );
}
