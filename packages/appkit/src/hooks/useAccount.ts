/* eslint-disable valtio/state-snapshot-rule */
import { ConnectionsController, CoreHelperUtil } from '@reown/appkit-core-react-native';
import { useMemo } from 'react';
import { useSnapshot } from 'valtio';
import { useAppKit } from './useAppKit';

export function useAccount() {
  useAppKit(); // Use the hook for checks

  const {
    activeAddress: address,
    activeNamespace,
    connection,
    connections,
    networks
  } = useSnapshot(ConnectionsController.state);

  const allAccounts = useMemo(() => {
    return Array.from(connections.values()).flatMap(_connection =>
      _connection.accounts.map(account => {
        const [namespace, chainId, plainAddress] = account.split(':');

        return {
          address: plainAddress,
          namespace,
          chainId,
          type: _connection.type
        };
      })
    );
  }, [connections]);

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
    chainId: activeChain?.id,
    chain: activeChain,
    namespace: activeNamespace
  };
}
