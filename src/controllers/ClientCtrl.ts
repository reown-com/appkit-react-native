import { ethers } from 'ethers';
import { proxy, ref, subscribe as valtioSub } from 'valtio/vanilla';
import type { ClientCtrlState } from '../types/controllerTypes';

// -- initial state ------------------------------------------------ //
const state = proxy<ClientCtrlState>({
  initialized: false,
  provider: undefined,
  web3Provider: undefined,
  session: undefined,
});

// -- controller -------------------------------------------------- //
export const ClientCtrl = {
  state,

  subscribe(callback: (newState: ClientCtrlState) => void) {
    return valtioSub(state, () => callback(state));
  },

  setProvider(provider: ClientCtrlState['provider']) {
    if (!state.initialized && provider) {
      state.provider = ref(provider);
      state.initialized = true;
    }
  },

  setSession(session: ClientCtrlState['session']) {
    if (session && state.provider) {
      state.session = ref(session);
      state.web3Provider = ref(
        new ethers.providers.Web3Provider(state.provider)
      );
    }
  },

  provider() {
    if (state.provider) {
      return state.provider;
    }

    throw new Error('ClientCtrl has no provider set');
  },

  session() {
    if (state.session) {
      return state.session;
    }

    throw new Error('ClientCtrl has no session set');
  },

  clearSession() {
    state.web3Provider = undefined;
    state.session = undefined;
  },
};
