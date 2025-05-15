import { useSnapshot } from 'valtio';
import { ConnectionsController } from '@reown/appkit-core-react-native';
import { useAppKit } from './useAppKit';

export function useAccount() {
  useAppKit(); // Use the hook for checks

  const {
    activeAddress: address,
    activeNamespace,
    connections
  } = useSnapshot(ConnectionsController.state);

  const connection = connections[activeNamespace ?? ''];

  return {
    address: address?.split(':')[2],
    isConnected: !!address,
    chainId: connection?.activeChain
  };
}
