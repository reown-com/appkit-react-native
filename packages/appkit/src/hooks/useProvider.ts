import { useSnapshot } from 'valtio';
import { ConnectionsController } from '@reown/appkit-core-react-native';
import type { Provider, ChainNamespace } from '@reown/appkit-common-react-native';

interface ProviderResult {
  provider?: Provider;
  providerType?: ChainNamespace;
}

export function useProvider(namespace?: string): ProviderResult {
  const { connections, activeNamespace } = useSnapshot(ConnectionsController.state);

  if (!namespace || !activeNamespace) return { provider: undefined, providerType: undefined };

  const connection = connections[namespace ?? activeNamespace];

  if (!connection) return { provider: undefined, providerType: undefined };

  return {
    provider: connection.adapter.connector?.getProvider(),
    providerType: connection.adapter.getSupportedNamespace()
  };
}
