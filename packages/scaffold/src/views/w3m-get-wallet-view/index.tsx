import { useSnapshot } from 'valtio';
import { Linking, Platform, ScrollView } from 'react-native';
import { FlexView, ListWallet } from '@web3modal/ui-react-native';
import { ApiController, AssetUtil, type WcWallet } from '@web3modal/core-react-native';
import { useDimensions } from '../../hooks/useDimensions';
import styles from './styles';

export function GetWalletView() {
  const { width } = useDimensions();
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
      />
    ));
  };

  return (
    <ScrollView
      bounces={false}
      showsVerticalScrollIndicator={false}
      style={[styles.container, { width }]}
      fadingEdgeLength={20}
    >
      <FlexView padding={['s', 's', '2xl', 's']} rowGap="xs">
        {listTemplate()}
        <ListWallet
          name="Explore All"
          walletIcon="allWallets"
          icon="externalLink"
          onPress={() => Linking.openURL('https://walletconnect.com/explorer?type=wallet')}
        />
      </FlexView>
    </ScrollView>
  );
}
