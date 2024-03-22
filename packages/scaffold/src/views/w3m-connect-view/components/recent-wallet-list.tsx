import { useSnapshot } from 'valtio';
import {
  ApiController,
  AssetUtil,
  type WcWallet,
  ConnectionController
} from '@web3modal/core-react-native';
import { ListWallet } from '@web3modal/ui-react-native';
import type { StyleProp, ViewStyle } from 'react-native';

interface Props {
  itemStyle: StyleProp<ViewStyle>;
  onWalletPress: (wallet: WcWallet, installed: boolean) => void;
  isWalletConnectEnabled: boolean;
}

export function RecentWalletList({ itemStyle, onWalletPress, isWalletConnectEnabled }: Props) {
  const { installed } = useSnapshot(ApiController.state);
  const { recentWallets } = useSnapshot(ConnectionController.state);
  const imageHeaders = ApiController._getApiHeaders();
  const RECENT_COUNT = recentWallets?.length ? (installed.length ? 1 : recentWallets?.length) : 0;

  if (!isWalletConnectEnabled || !recentWallets?.length) {
    return null;
  }

  return recentWallets.slice(0, RECENT_COUNT).map(wallet => {
    const isInstalled = !!installed.find(installedWallet => installedWallet.id === wallet.id);

    return (
      <ListWallet
        key={wallet?.id}
        imageSrc={AssetUtil.getWalletImage(wallet)}
        imageHeaders={imageHeaders}
        name={wallet?.name ?? 'Unknown'}
        onPress={() => onWalletPress(wallet!, isInstalled)}
        tagLabel="Recent"
        tagVariant="shade"
        style={itemStyle}
        installed={isInstalled}
      />
    );
  });
}
