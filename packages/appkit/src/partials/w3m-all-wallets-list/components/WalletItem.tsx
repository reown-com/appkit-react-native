import { useSnapshot } from 'valtio';
import { ApiController, AssetController, AssetUtil } from '@reown/appkit-core-react-native';
import { CardSelect, CardSelectLoader } from '@reown/appkit-ui-react-native';
import type { WcWallet } from '@reown/appkit-common-react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { memo } from 'react';

interface WalletItemProps {
  containerStyle?: StyleProp<ViewStyle>;
  item: WcWallet;
  itemWidth?: number;
  imageHeaders?: Record<string, string>;
  onItemPress: (wallet: WcWallet) => void;
  style?: StyleProp<ViewStyle>;
}

export function WalletItem({
  containerStyle,
  item,
  itemWidth,
  imageHeaders,
  onItemPress,
  style
}: WalletItemProps) {
  const { walletImages } = useSnapshot(AssetController.state);
  const isInstalled = ApiController.state.installed.find(wallet => wallet?.id === item?.id);
  const imageSrc = AssetUtil.getWalletImage(item, walletImages);

  if (!item?.id) {
    return <CardSelectLoader style={[containerStyle, { width: itemWidth }, style]} />;
  }

  return (
    <CardSelect
      imageSrc={imageSrc}
      style={[containerStyle, { width: itemWidth }, style]}
      imageHeaders={imageHeaders}
      name={item?.name ?? 'Unknown'}
      onPress={() => onItemPress(item)}
      installed={!!isInstalled}
    />
  );
}

export const MemoizedWalletItem = memo(WalletItem, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id;
});
