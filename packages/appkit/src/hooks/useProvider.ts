import { useSnapshot } from 'valtio';
import { ConnectionsController } from '@reown/appkit-core-react-native';
import type { Provider, ChainNamespace } from '@reown/appkit-common-react-native';

interface ProviderResult {
  provider?: Provider;
  providerType?: ChainNamespace;
}

export function useProvider(namespace?: ChainNamespace): ProviderResult {
  const { connections, activeNamespace } = useSnapshot(ConnectionsController.state);

  const targetNamespace = namespace ?? activeNamespace;

  if (!targetNamespace) return { provider: undefined, providerType: undefined };

  const connection = connections.get(targetNamespace);

  if (!connection) return { provider: undefined, providerType: undefined };

  return {
    provider: connection.adapter.connector?.getProvider(),
    providerType: connection.adapter.getSupportedNamespace()
  };
}
