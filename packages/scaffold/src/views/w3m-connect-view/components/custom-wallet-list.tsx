import { useSnapshot } from 'valtio';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  OptionsController,
  type CustomWallet,
  type OptionsControllerState,
  ApiController,
  ConnectionController,
  type ConnectionControllerState
} from '@web3modal/core-react-native';
import { ListWallet } from '@web3modal/ui-react-native';
import { filterOutRecentWallets } from '../utils';

interface Props {
  itemStyle: StyleProp<ViewStyle>;
  onWalletPress: (wallet: CustomWallet) => void;
  isWalletConnectEnabled: boolean;
}

export function CustomWalletList({ itemStyle, onWalletPress, isWalletConnectEnabled }: Props) {
  const { installed } = useSnapshot(ApiController.state);
  const { recentWallets } = useSnapshot(ConnectionController.state) as ConnectionControllerState;
  const { customWallets } = useSnapshot(OptionsController.state) as OptionsControllerState;
  const RECENT_COUNT = recentWallets?.length && installed.length ? 1 : recentWallets?.length ?? 0;

  if (!isWalletConnectEnabled || !customWallets?.length) {
    return null;
  }

  const list = filterOutRecentWallets(recentWallets, customWallets, RECENT_COUNT);

  return list.map(wallet => (
    <ListWallet
      key={wallet.id}
      imageSrc={wallet.image_url}
      name={wallet.name}
      onPress={() => onWalletPress(wallet)}
      style={itemStyle}
    />
  ));
}
