import { useSnapshot } from 'valtio';
import { ConnectionsController } from '@reown/appkit-core-react-native';

export function useProvider<T>(namespace: string): T | null {
  const { connections } = useSnapshot(ConnectionsController.state);
  const connection = connections[namespace];

  if (!connection) return null;

  return connection.adapter.connector?.getProvider() as T;
}
