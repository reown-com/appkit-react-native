import { useSnapshot } from 'valtio';
import { AccountController } from './controllers/AccountController';
import { CoreHelperUtil } from './utils/CoreHelperUtil';
import { ChainController } from './controllers/ChainController';
import { ConnectionController } from './controllers/ConnectionController';
import type { UseAppKitAccountReturn, UseAppKitNetworkReturn } from './utils/TypeUtil';

// -- Hooks ------------------------------------------------------------
export function useAppKitNetworkCore(): Pick<
  UseAppKitNetworkReturn,
  'caipNetwork' | 'chainId' | 'caipNetworkId'
> {
  const { activeCaipNetwork } = useSnapshot(ChainController.state);

  return {
    caipNetwork: activeCaipNetwork,
    chainId: activeCaipNetwork?.id,
    caipNetworkId: activeCaipNetwork?.caipNetworkId
  };
}

export function useAppKitAccount(): UseAppKitAccountReturn {
  const { status } = useSnapshot(AccountController.state);
  const { activeCaipAddress } = useSnapshot(ChainController.state);

  return {
    caipAddress: activeCaipAddress,
    address: CoreHelperUtil.getPlainAddress(activeCaipAddress),
    isConnected: Boolean(activeCaipAddress),
    status
  };
}

export function useDisconnect() {
  async function disconnect() {
    await ConnectionController.disconnect();
  }

  return { disconnect };
}
