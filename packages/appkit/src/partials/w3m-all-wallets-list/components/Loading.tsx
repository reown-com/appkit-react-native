import { memo } from 'react';
import { WalletList } from './WalletList';
import type { StyleProp, ViewStyle } from 'react-native';

interface LoadingProps {
  loadingItems?: number;
  style?: StyleProp<ViewStyle>;
}

function _Loading({ loadingItems = 20, style }: LoadingProps) {
  return (
    <WalletList
      data={[]}
      onItemPress={() => {}}
      isLoading={true}
      loadingItems={loadingItems}
      style={style}
    />
  );
}

export const Loading = memo(_Loading, () => {
  return true;
});
