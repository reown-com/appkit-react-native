/* eslint-disable valtio/state-snapshot-rule */
import { useMemo } from 'react';
import { useSnapshot } from 'valtio';
import { ConnectionsController, ModalController } from '@reown/appkit-core-react-native';
import { useAppKitContext } from './useAppKitContext';

/**
 * Hook to access the overall state of the AppKit modal and connection
 *
 * @remarks
 * This hook provides a high-level view of the AppKit's current state, including
 * whether the modal is open, if it's loading, connection status, and the active chain.
 * It's useful for coordinating UI elements with the AppKit's state.
 *
 * @returns An object containing:
 *   - `isOpen`: Whether the AppKit modal is currently open
 *   - `isLoading`: Whether the AppKit is in a loading state
 *   - `isConnected`: Whether a wallet is currently connected
 *   - `chain`: The currently active blockchain network
 *
 * @throws {Error} If used outside of an AppKitProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isOpen, isLoading, isConnected, chain } = useAppKitState();
 *
 *   return (
 *     <View>
 *       <Text>Modal: {isOpen ? 'Open' : 'Closed'}</Text>
 *       <Text>Loading: {isLoading ? 'Yes' : 'No'}</Text>
 *       <Text>Connected: {isConnected ? 'Yes' : 'No'}</Text>
 *       {chain && <Text>Chain: {chain.name}</Text>}
 *     </View>
 *   );
 * }
 * ```
 */

export function useAppKitState() {
  useAppKitContext();
  const { activeAddress: address, connection, networks } = useSnapshot(ConnectionsController.state);
  const { open, loading } = useSnapshot(ModalController.state);

  const activeChain = useMemo(
    () =>
      connection?.caipNetwork
        ? networks.find(network => network.caipNetworkId === connection?.caipNetwork)
        : undefined,
    [connection?.caipNetwork, networks]
  );

  return {
    isOpen: open,
    isLoading: loading,
    isConnected: !!address,
    chain: activeChain
  };
}
