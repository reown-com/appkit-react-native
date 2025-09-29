import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import {
  ApiController,
  LogController,
  OptionsController,
  SnackController,
  type OptionsControllerState
} from '@reown/appkit-core-react-native';
import { type WcWallet } from '@reown/appkit-common-react-native';
import styles from './styles';
import { Placeholder } from '../w3m-placeholder';
import { Loading } from './components/Loading';

import { WalletList } from './components/WalletList';

interface AllWalletsListProps {
  onItemPress: (wallet: WcWallet) => void;
  headerHeight?: number;
}

export function AllWalletsList({ onItemPress }: AllWalletsListProps) {
  const [loading, setLoading] = useState<boolean>(ApiController.state.wallets.length === 0);
  const [loadingError, setLoadingError] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const { installed, featured, recommended, wallets } = useSnapshot(ApiController.state);
  const { customWallets } = useSnapshot(OptionsController.state) as OptionsControllerState;

  let combinedWallets = [...installed, ...featured, ...recommended, ...wallets];

  // Show custom wallets after certified wallets.
  const certifiedIndex = combinedWallets.findLastIndex(wallet => wallet.badge_type === 'certified');
  if (certifiedIndex > -1) {
    const nonCertifiedWallets = combinedWallets.splice(certifiedIndex + 1);
    combinedWallets = combinedWallets.concat(customWallets ?? [], nonCertifiedWallets);
  } else {
    combinedWallets = [
      ...installed,
      ...featured,
      ...recommended,
      ...(customWallets ?? []),
      ...wallets
    ];
  }

  // Deduplicate by wallet ID
  const uniqueWallets = Array.from(
    new Map(combinedWallets.map(wallet => [wallet?.id, wallet])).values()
  ).filter(wallet => wallet?.id); // Filter out any undefined wallets

  const loadingItems = 4 - ((100 + uniqueWallets.length) % 4);

  const walletList = [
    ...uniqueWallets,
    ...(pageLoading ? (Array.from({ length: loadingItems }) as WcWallet[]) : [])
  ];

  const initialFetch = async () => {
    try {
      setLoading(true);
      setLoadingError(false);
      await ApiController.fetchWallets({ page: 1 });
      setLoading(false);
    } catch (error) {
      LogController.sendError(error, 'AllWalletsList.tsx', 'initialFetch');
      SnackController.showError('Failed to load wallets');
      setLoading(false);
      setLoadingError(true);
    }
  };

  const fetchNextPage = async () => {
    try {
      if (
        walletList.length - (customWallets ?? []).length < ApiController.state.count &&
        !pageLoading &&
        !loading &&
        ApiController.state.page > 0
      ) {
        setPageLoading(true);
        await ApiController.fetchWallets({ page: ApiController.state.page + 1 });
        setPageLoading(false);
      }
    } catch (error) {
      SnackController.showError('Failed to load more wallets');
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (!ApiController.state.wallets.length) {
      initialFetch();
    }
  }, []);

  if (loading) {
    return <Loading loadingItems={12} style={styles.loadingContainer} />;
  }

  if (loadingError) {
    return (
      <Placeholder
        icon="warningCircle"
        iconColor="error-100"
        title="Oops, we couldn't load the wallets at the moment"
        description={`This might be due to a temporary network issue.\nPlease try reloading to see if that helps.`}
        actionIcon="refresh"
        actionPress={initialFetch}
        actionTitle="Retry"
        style={styles.placeholderContainer}
      />
    );
  }

  return (
    <WalletList
      data={walletList}
      onEndReached={fetchNextPage}
      onEndReachedThreshold={2}
      onItemPress={onItemPress}
    />
  );
}
