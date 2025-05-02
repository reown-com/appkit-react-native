import { ConnectionsController } from '@reown/appkit-core-react-native';
import { useSnapshot } from 'valtio';

export function useAppKitAccount() {
  const {
    activeAddress: address,
    activeNamespace,
    connections
  } = useSnapshot(ConnectionsController.state);
  const connection = connections[activeNamespace];

  return {
    address: address?.split(':')[2],
    isConnected: !!address,
    chainId: connection?.activeChain
  };
}
