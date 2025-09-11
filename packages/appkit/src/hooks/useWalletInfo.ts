import { useMemo } from 'react';
import { useSnapshot } from 'valtio';
import { ConnectionsController } from '@reown/appkit-core-react-native';
import { useAppKit } from './useAppKit';

export function useWalletInfo() {
  useAppKit(); // Use the hook for checks
  const { walletInfo: walletInfoSnapshot } = useSnapshot(ConnectionsController.state);

  const walletInfo = useMemo(() => ({ walletInfo: walletInfoSnapshot }), [walletInfoSnapshot]);

  return walletInfo;
}
