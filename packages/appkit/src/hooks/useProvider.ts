import { useSnapshot } from 'valtio';
import { ConnectionsController } from '@reown/appkit-core-react-native';

export function useProvider<T>(namespace?: string): T | null {
  const { connections, activeNamespace } = useSnapshot(ConnectionsController.state);
  const connection = connections[namespace ?? activeNamespace];

  if (!connection) return null;

  return connection.adapter.connector?.getProvider() as T;
}
