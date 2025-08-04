import { useSnapshot } from 'valtio';
import { ConnectionsController } from '@reown/appkit-core-react-native';
import type { Provider, ChainNamespace } from '@reown/appkit-common-react-native';

/**
 * Interface representing the result of the useProvider hook
 */
interface ProviderResult {
  /** The active connection provider instance */
  provider?: Provider;
  /** The chain namespace supported by the provider */
  providerType?: ChainNamespace;
}

/**
 * Hook that returns the active connection provider and its supported chain namespace.
 *
 * This hook accesses the current connection and returns the provider instance along with its supported namespace.
 *
 * @returns {ProviderResult} An object containing:
 *   - `provider`: The active connection provider instance, or undefined if no connection exists
 *   - `providerType`: The chain namespace supported by the provider, or undefined if no connection exists
 *
 * @example
 * ```typescript
 * const { provider, providerType } = useProvider();
 *
 * if (provider) {
 *   // Use the provider for blockchain operations
 *   const balance = await provider.request({
 *     method: 'eth_getBalance',
 *     params: [address, 'latest']
 *   });
 * }
 * ```
 */
export function useProvider(): ProviderResult {
  const { connection } = useSnapshot(ConnectionsController.state);

  if (!connection) return { provider: undefined, providerType: undefined };

  return {
    provider: connection.adapter.getProvider(),
    providerType: connection.adapter.getSupportedNamespace()
  };
}
