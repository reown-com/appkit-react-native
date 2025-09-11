import { useSnapshot } from 'valtio';
import { ConnectionsController, ModalController } from '@reown/appkit-core-react-native';
import { useAppKit } from './useAppKit';

export function useAppKitState() {
  useAppKit(); // Use the hook for checks
  const { activeAddress: address, connection, networks } = useSnapshot(ConnectionsController.state);
  const { open, loading } = useSnapshot(ModalController.state);

  const activeChain = connection?.caipNetwork
    ? // eslint-disable-next-line valtio/state-snapshot-rule
      networks.find(network => network.caipNetworkId === connection?.caipNetwork)
    : undefined;

  return {
    isOpen: open,
    isLoading: loading,
    isConnected: !!address,
    chain: activeChain
  };
}
