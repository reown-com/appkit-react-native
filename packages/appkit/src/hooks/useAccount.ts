import { useSnapshot } from 'valtio';
import { ConnectionsController } from '@reown/appkit-core-react-native';

export function useAccount() {
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
