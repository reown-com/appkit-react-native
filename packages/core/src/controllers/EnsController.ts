import { subscribeKey as subKey } from 'valtio/vanilla/utils';
import { proxy, subscribe as sub } from 'valtio/vanilla';
import { BlockchainApiController } from './BlockchainApiController';
import type { BlockchainApiEnsError } from '../utils/TypeUtil';
import { ChainController } from './ChainController';

// -- Types --------------------------------------------- //

export interface EnsControllerState {
  loading: boolean;
}

type StateKey = keyof EnsControllerState;

// -- State --------------------------------------------- //
const state = proxy<EnsControllerState>({
  loading: false
});

// -- Controller ---------------------------------------- //
export const EnsController = {
  state,

  subscribe(callback: (newState: EnsControllerState) => void) {
    return sub(state, () => callback(state));
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: EnsControllerState[K]) => void) {
    return subKey(state, key, callback);
  },

  async resolveName(name: string) {
    try {
      return await BlockchainApiController.lookupEnsName(name);
    } catch (e) {
      const error = e as BlockchainApiEnsError;
      throw new Error(error?.reasons?.[0]?.description || 'Error resolving name');
    }
  },

  async getNamesForAddress(address: string) {
    try {
      const network = ChainController.state.activeCaipNetwork;
      if (!network) {
        return [];
      }

      const response = await BlockchainApiController.reverseLookupEnsName({ address });

      return response;
    } catch (e) {
      const errorMessage = this.parseEnsApiError(e, 'Error fetching names for address');
      throw new Error(errorMessage);
    }
  },

  parseEnsApiError(error: unknown, defaultError: string) {
    const ensError = error as BlockchainApiEnsError;

    return ensError?.reasons?.[0]?.description || defaultError;
  }
};
