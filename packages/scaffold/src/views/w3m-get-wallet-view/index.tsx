import { useSnapshot } from 'valtio';
import { Linking, Platform, ScrollView } from 'react-native';
import { FlexView, ListWallet } from '@web3modal/ui-react-native';
import { ApiController, AssetUtil, type WcWallet } from '@web3modal/core-react-native';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';

export function GetWalletView() {
  const { padding } = useCustomDimensions();
  const { recommended } = useSnapshot(ApiController.state);
  const imageHeaders = ApiController._getApiHeaders();

  const onWalletPress = (wallet: WcWallet) => {
    const storeUrl =
      Platform.select({ ios: wallet.app_store, android: wallet.play_store }) || wallet.homepage;
    if (storeUrl) {
      Linking.openURL(storeUrl);
    }
  };

  const listTemplate = () => {
    return recommended.map(wallet => (
      <ListWallet
        key={wallet.id}
        name={wallet.name}
        imageSrc={AssetUtil.getWalletImage(wallet)}
        imageHeaders={imageHeaders}
        onPress={() => onWalletPress(wallet)}
        style={styles.item}
      />
    ));
  };

  return (
    <ScrollView bounces={false} style={{ paddingHorizontal: padding }} fadingEdgeLength={20}>
      <FlexView padding={['s', 's', '3xl', 's']}>
        {listTemplate()}
        <ListWallet
          name="Explore all"
          showAllWallets
          icon="externalLink"
          onPress={() => Linking.openURL('https://walletconnect.com/explorer?type=wallet')}
        />
      </FlexView>
    </ScrollView>
  );
}
