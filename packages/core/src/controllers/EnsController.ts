import { subscribeKey as subKey } from 'valtio/utils';
import { proxy, subscribe as sub } from 'valtio';
import { BlockchainApiController } from './BlockchainApiController';
import type { BlockchainApiEnsError } from '../utils/TypeUtil';

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
  }
};
