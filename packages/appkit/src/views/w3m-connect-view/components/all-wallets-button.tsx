import { useSnapshot } from 'valtio';
import { ApiController } from '@reown/appkit-core-react-native';
import { ListWallet } from '@reown/appkit-ui-react-native';
import type { StyleProp, ViewStyle } from 'react-native';

interface Props {
  itemStyle: StyleProp<ViewStyle>;
  onPress: () => void;
  isWalletConnectEnabled: boolean;
}

export function AllWalletsButton({ itemStyle, onPress, isWalletConnectEnabled }: Props) {
  const { installed, count } = useSnapshot(ApiController.state);

  if (!isWalletConnectEnabled) {
    return null;
  }

  const total = installed.length + count;
  const label = total > 10 ? `${Math.floor(total / 10) * 10}+` : total;

  return (
    <ListWallet
      name="All wallets"
      showAllWallets
      tagLabel={String(label)}
      tagVariant="shade"
      onPress={onPress}
      style={itemStyle}
      testID="all-wallets"
    />
  );
}
