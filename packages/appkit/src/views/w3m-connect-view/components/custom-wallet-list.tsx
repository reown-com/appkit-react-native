import { useSnapshot } from 'valtio';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  OptionsController,
  type CustomWallet,
  type OptionsControllerState,
  ApiController,
  WcController,
  type WcControllerState,
  AssetUtil
} from '@reown/appkit-core-react-native';
import { ListWallet } from '@reown/appkit-ui-react-native';
import { filterOutRecentWallets } from '../utils';

interface Props {
  itemStyle: StyleProp<ViewStyle>;
  onWalletPress: (wallet: CustomWallet) => void;
}

export function CustomWalletList({ itemStyle, onWalletPress }: Props) {
  const { installed } = useSnapshot(ApiController.state);
  const imageHeaders = ApiController._getApiHeaders();
  const { recentWallets } = useSnapshot(WcController.state) as WcControllerState;
  const { customWallets } = useSnapshot(OptionsController.state) as OptionsControllerState;
  const RECENT_COUNT = recentWallets?.length && installed.length ? 1 : recentWallets?.length ?? 0;

  if (!customWallets?.length) {
    return null;
  }

  const list = filterOutRecentWallets(recentWallets, customWallets, RECENT_COUNT);

  return list.map(wallet => (
    <ListWallet
      key={wallet.id}
      imageSrc={AssetUtil.getWalletImage(wallet)}
      imageHeaders={imageHeaders}
      name={wallet.name}
      onPress={() => onWalletPress(wallet)}
      style={itemStyle}
    />
  ));
}
