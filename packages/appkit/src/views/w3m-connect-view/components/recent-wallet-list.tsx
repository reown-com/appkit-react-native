import { useSnapshot } from 'valtio';
import {
  ApiController,
  AssetController,
  AssetUtil,
  WcController
} from '@reown/appkit-core-react-native';
import { type WcWallet } from '@reown/appkit-common-react-native';
import { ListWallet } from '@reown/appkit-ui-react-native';
import type { StyleProp, ViewStyle } from 'react-native';

interface Props {
  itemStyle: StyleProp<ViewStyle>;
  onWalletPress: (wallet: WcWallet, installed: boolean) => void;
}

export function RecentWalletList({ itemStyle, onWalletPress }: Props) {
  const installed = ApiController.state.installed;
  const { recentWallets } = useSnapshot(WcController.state);
  const { walletImages } = useSnapshot(AssetController.state);
  const imageHeaders = ApiController._getApiHeaders();
  const RECENT_COUNT = recentWallets?.length && installed.length ? 1 : recentWallets?.length ?? 0;

  if (!recentWallets?.length) {
    return null;
  }

  return recentWallets.slice(0, RECENT_COUNT).map(wallet => {
    const isInstalled = !!installed.find(installedWallet => installedWallet.id === wallet.id);

    return (
      <ListWallet
        key={wallet?.id}
        imageSrc={AssetUtil.getWalletImage(wallet, walletImages)}
        imageHeaders={imageHeaders}
        name={wallet?.name ?? 'Unknown'}
        onPress={() => onWalletPress(wallet, isInstalled)}
        tagLabel="Recent"
        tagVariant="shade"
        style={itemStyle}
        installed={isInstalled}
      />
    );
  });
}
