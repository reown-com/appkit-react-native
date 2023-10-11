import { proxy, subscribe as sub } from 'valtio';
import { subscribeKey as subKey } from 'valtio/utils';
import type { CaipNetworkId } from '../utils/TypeUtils.js';

// -- Types --------------------------------------------- //
export interface PublicStateControllerState {
  open: boolean;
  selectedNetworkId?: CaipNetworkId;
}

type StateKey = keyof PublicStateControllerState;

// -- State --------------------------------------------- //
const state = proxy<PublicStateControllerState>({
  open: false,
  selectedNetworkId: undefined
});

// -- Controller ---------------------------------------- //
export const PublicStateController = {
  state,

  subscribe(callback: (newState: PublicStateControllerState) => void) {
    return sub(state, () => callback(state));
  },

  subscribeKey<K extends StateKey>(
    key: K,
    callback: (value: PublicStateControllerState[K]) => void
  ) {
    return subKey(state, key, callback);
  },

  set(newState: Partial<PublicStateControllerState>) {
    Object.assign(state, { ...state, ...newState });
  }
};
