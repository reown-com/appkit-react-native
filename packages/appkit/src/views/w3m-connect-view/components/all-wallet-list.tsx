import { type StyleProp, type ViewStyle } from 'react-native';
import { useSnapshot } from 'valtio';
import {
  ApiController,
  AssetUtil,
  ConnectionController,
  type ConnectionControllerState,
  type WcWallet
} from '@reown/appkit-core-react-native';
import { ListItemLoader, ListWallet } from '@reown/appkit-ui-react-native';
import { UiUtil } from '../../../utils/UiUtil';
import { filterOutRecentWallets } from '../utils';

interface Props {
  itemStyle: StyleProp<ViewStyle>;
  onWalletPress: (wallet: WcWallet) => void;
}

export function AllWalletList({ itemStyle, onWalletPress }: Props) {
  const { installed, featured, recommended, prefetchLoading } = useSnapshot(ApiController.state);
  const { recentWallets } = useSnapshot(ConnectionController.state) as ConnectionControllerState;
  const imageHeaders = ApiController._getApiHeaders();
  const RECENT_COUNT = recentWallets?.length && installed.length ? 1 : recentWallets?.length ?? 0;

  const combinedWallets = [...installed, ...featured, ...recommended];

  // Deduplicate by wallet ID
  const uniqueWallets = Array.from(
    new Map(combinedWallets.map(wallet => [wallet.id, wallet])).values()
  );

  const list = filterOutRecentWallets(recentWallets, uniqueWallets, RECENT_COUNT).slice(
    0,
    UiUtil.TOTAL_VISIBLE_WALLETS - RECENT_COUNT
  );

  if (!list?.length) {
    return null;
  }

  return prefetchLoading ? (
    <>
      <ListItemLoader style={itemStyle} />
      <ListItemLoader style={itemStyle} />
    </>
  ) : (
    list.map(wallet => (
      <ListWallet
        key={wallet?.id}
        imageSrc={AssetUtil.getWalletImage(wallet)}
        imageHeaders={imageHeaders}
        name={wallet?.name ?? 'Unknown'}
        onPress={() => onWalletPress(wallet)}
        style={itemStyle}
        installed={!!installed.find(installedWallet => installedWallet.id === wallet.id)}
      />
    ))
  );
}
