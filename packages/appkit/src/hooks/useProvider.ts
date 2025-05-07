import { useSnapshot } from 'valtio';
import { ConnectionsController } from '@reown/appkit-core-react-native';
import type { Provider } from '@reown/appkit-common-react-native';

export function useProvider(namespace?: string): Provider | undefined {
  const { connections, activeNamespace } = useSnapshot(ConnectionsController.state);

  if (!namespace || !activeNamespace) return undefined;

  const connection = connections[namespace ?? activeNamespace];

  if (!connection) return undefined;

  return connection.adapter.connector?.getProvider();
}
