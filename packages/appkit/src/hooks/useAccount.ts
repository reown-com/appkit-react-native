/* eslint-disable valtio/state-snapshot-rule */
import { useMemo } from 'react';
import { useSnapshot } from 'valtio';
import { ConnectionsController, CoreHelperUtil } from '@reown/appkit-core-react-native';
import { useAppKit } from './useAppKit';

export function useAccount() {
  useAppKit(); // Use the hook for checks

  const {
    activeAddress: address,
    activeNamespace,
    connection,
    networks
  } = useSnapshot(ConnectionsController.state);

  const activeChain = useMemo(
    () =>
      connection?.caipNetwork
        ? networks.find(network => network.caipNetworkId === connection?.caipNetwork)
        : undefined,
    [connection?.caipNetwork, networks]
  );

  return {
    address: CoreHelperUtil.getPlainAddress(address),
    isConnected: !!address,
    chainId: activeChain?.id,
    chain: activeChain,
    namespace: activeNamespace
  };
}
