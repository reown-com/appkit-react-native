import { useSnapshot } from 'valtio';
import { ConnectionsController } from '@reown/appkit-core-react-native';
import { useAppKit } from './useAppKit';

export function useWalletInfo() {
  useAppKit(); // Use the hook for checks
  const { walletInfo } = useSnapshot(ConnectionsController.state);

  return { walletInfo };
}
