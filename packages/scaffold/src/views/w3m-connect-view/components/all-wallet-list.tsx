import { useSnapshot } from 'valtio';
import {
  ApiController,
  AssetUtil,
  ConnectionController,
  type ConnectionControllerState,
  type WcWallet
} from '@reown/appkit-core-react-native';
import { ListWallet } from '@reown/appkit-ui-react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { UiUtil } from '../../../utils/UiUtil';
import { filterOutRecentWallets } from '../utils';

interface Props {
  itemStyle: StyleProp<ViewStyle>;
  onWalletPress: (wallet: WcWallet) => void;
  isWalletConnectEnabled: boolean;
}

export function AllWalletList({ itemStyle, onWalletPress, isWalletConnectEnabled }: Props) {
  const { installed, featured, recommended } = useSnapshot(ApiController.state);
  const { recentWallets } = useSnapshot(ConnectionController.state) as ConnectionControllerState;
  const imageHeaders = ApiController._getApiHeaders();
  const RECENT_COUNT = recentWallets?.length && installed.length ? 1 : recentWallets?.length ?? 0;

  const list = filterOutRecentWallets(
    recentWallets,
    [...installed, ...featured, ...recommended],
    RECENT_COUNT
  ).slice(0, UiUtil.TOTAL_VISIBLE_WALLETS - RECENT_COUNT);

  if (!isWalletConnectEnabled || !list?.length) {
    return null;
  }

  return list.map(wallet => (
    <ListWallet
      key={wallet?.id}
      imageSrc={AssetUtil.getWalletImage(wallet)}
      imageHeaders={imageHeaders}
      name={wallet?.name ?? 'Unknown'}
      onPress={() => onWalletPress(wallet)}
      style={itemStyle}
      installed={!!installed.find(installedWallet => installedWallet.id === wallet.id)}
    />
  ));
}
