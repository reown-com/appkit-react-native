import type { WcWallet } from '@web3modal/core-react-native';

export const filterOutRecentWallets = (
  recentWallets?: WcWallet[],
  wallets?: WcWallet[],
  resentCount?: number
) => {
  const recentIds = recentWallets?.slice(0, resentCount ?? 1).map(wallet => wallet.id);
  if (!recentIds?.length) return wallets ?? [];

  const filtered = wallets?.filter(wallet => !recentIds.includes(wallet.id)) || [];

  return filtered;
};
