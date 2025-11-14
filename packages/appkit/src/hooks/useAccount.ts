/* eslint-disable valtio/state-snapshot-rule */
import {
  ConnectionsController,
  CoreHelperUtil,
  LogController
} from '@reown/appkit-core-react-native';
import { useMemo } from 'react';
import { useSnapshot } from 'valtio';
import type { AccountType, AppKitNetwork } from '@reown/appkit-common-react-native';
import { useAppKitContext } from './useAppKitContext';

/**
 * Represents a blockchain account with its associated metadata
 */
export interface Account {
  /** The blockchain address of the account */
  address: string;
  /** The blockchain namespace (e.g., 'eip155' for Ethereum, 'solana' for Solana) */
  namespace: string;
  /** The chain ID where this account is active */
  chainId: string;
  /** Optional account type (e.g. 'eoa' or 'smartAccount') */
  type?: AccountType;
}

/**
 * Hook to access the current account state and connection information
 *
 * @remarks
 * This hook provides access to all connected accounts, the currently active account,
 * connection status, and active chain information. It automatically subscribes to
 * connection state changes via valtio.
 *
 * The hook parses account data from CAIP-10 format (namespace:chainId:address)
 * and provides a normalized structure.
 *
 * @returns An object containing:
 * - `allAccounts` - Array of all connected accounts across all connections
 * - `address` - The plain address of the currently active account (without namespace or chain prefix)
 * - `isConnected` - Boolean indicating if a wallet is currently connected
 * - `chainId` - The ID of the currently active chain
 * - `chain` - The full chain/network object of the currently active chain
 * - `namespace` - The namespace of the currently active account (e.g. 'eip155', 'solana' or 'bip122')
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { address, isConnected, chainId, allAccounts } = useAccount();
 *
 *   if (!isConnected) {
 *     return <Text>Not connected</Text>;
 *   }
 *
 *   return (
 *     <View>
 *       <Text>Connected: {address}</Text>
 *       <Text>Chain: {chainId}</Text>
 *       <Text>Total accounts: {allAccounts.length}</Text>
 *     </View>
 *   );
 * }
 * ```
 *
 * @throws Will log errors via LogController if account parsing fails
 */
export function useAccount() {
  useAppKitContext();

  const {
    activeAddress: address,
    activeNamespace,
    connection,
    connections,
    networks
  } = useSnapshot(ConnectionsController.state);

  const allAccounts: Account[] = useMemo(() => {
    if (!address) return [];

    return Array.from(connections.values()).flatMap(
      _connection =>
        _connection.accounts
          .map(account => {
            const [namespace, chainId, plainAddress] = account.split(':');
            if (!plainAddress || !namespace || !chainId) {
              LogController.sendError('Invalid account', 'useAccount.ts', 'useAccount', {
                account
              });

              return undefined;
            }

            return {
              address: plainAddress,
              namespace,
              chainId,
              type: _connection.type
            };
          })
          .filter(account => account !== undefined) as Account[]
    );
  }, [connections, address]);

  const activeChain = useMemo(
    () =>
      connection?.caipNetwork
        ? networks.find(network => network.caipNetworkId === connection?.caipNetwork)
        : undefined,
    [connection?.caipNetwork, networks]
  );

  return {
    allAccounts,
    address: CoreHelperUtil.getPlainAddress(address),
    isConnected: !!address,
    chainId: activeChain?.id !== undefined ? String(activeChain.id) : undefined,
    chain: activeChain as AppKitNetwork | undefined,
    namespace: activeNamespace
  };
}
