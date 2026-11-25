import { useSnapshot } from 'valtio';
import { ApiController } from '@reown/appkit-core-react-native';
import { ListWallet } from '@reown/appkit-ui-react-native';
import type { StyleProp, ViewStyle } from 'react-native';

interface Props {
  itemStyle: StyleProp<ViewStyle>;
  onPress: () => void;
}

export function AllWalletsButton({ itemStyle, onPress }: Props) {
  const { installed, count } = useSnapshot(ApiController.state);

  const total = installed.length + count;
  const label = total > 10 ? `${Math.floor(total / 10) * 10}+` : total;

  return (
    <ListWallet
      name="All wallets"
      showAllWallets
      // No count until the wallets load (the modal opens before the prefetch ends)
      tagLabel={total > 0 ? String(label) : undefined}
      tagVariant={total > 0 ? 'shade' : undefined}
      onPress={onPress}
      style={itemStyle}
      testID="all-wallets"
    />
  );
}
