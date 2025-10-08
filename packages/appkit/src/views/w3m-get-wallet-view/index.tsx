import { Linking, Platform, ScrollView } from 'react-native';
import { FlexView, ListWallet, useCustomDimensions } from '@reown/appkit-ui-react-native';
import { ApiController, AssetController, AssetUtil } from '@reown/appkit-core-react-native';
import { type WcWallet } from '@reown/appkit-common-react-native';
import styles from './styles';
import { useSnapshot } from 'valtio';

export function GetWalletView() {
  const { walletImages } = useSnapshot(AssetController.state);
  const { padding } = useCustomDimensions();
  const imageHeaders = ApiController._getApiHeaders();

  const onWalletPress = (wallet: WcWallet) => {
    const storeUrl =
      Platform.select({ ios: wallet.app_store, android: wallet.play_store }) || wallet.homepage;
    if (storeUrl) {
      Linking.openURL(storeUrl);
    }
  };

  const listTemplate = () => {
    return ApiController.state.recommended.map(wallet => (
      <ListWallet
        key={wallet.id}
        name={wallet.name}
        imageSrc={AssetUtil.getWalletImage(wallet, walletImages)}
        imageHeaders={imageHeaders}
        onPress={() => onWalletPress(wallet)}
        style={styles.item}
      />
    ));
  };

  return (
    <ScrollView
      bounces={false}
      style={{ paddingHorizontal: padding }}
      fadingEdgeLength={20}
      testID="get-a-wallet-view"
    >
      <FlexView padding="s">
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
