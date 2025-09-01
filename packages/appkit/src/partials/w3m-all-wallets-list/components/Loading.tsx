import { memo } from 'react';
import { WalletList } from './WalletList';

interface LoadingProps {
  loadingItems?: number;
}

function _Loading({ loadingItems = 20 }: LoadingProps) {
  return (
    <WalletList data={[]} onItemPress={() => {}} isLoading={true} loadingItems={loadingItems} />
  );
}

export const Loading = memo(_Loading, () => {
  return true;
});
