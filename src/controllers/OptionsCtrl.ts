import { proxy } from 'valtio';

import type { OptionsCtrlState } from '../types/controllerTypes';
import { ClientCtrl } from './ClientCtrl';

// -- initial state ------------------------------------------------ //
const state = proxy<OptionsCtrlState>({
  address: undefined,
  isConnected: false,
  sessionUri: undefined,
  isDataLoaded: false,
});

// -- controller --------------------------------------------------- //
export const OptionsCtrl = {
  state,

  async getAccount() {
    const web3Provider = ClientCtrl.state.web3Provider;
    if (web3Provider) {
      const signer = web3Provider.getSigner();
      const currentAddress = await signer.getAddress();
      state.address = currentAddress;
      state.isConnected = true;
    }
  },

  setAddress(address: OptionsCtrlState['address']) {
    state.address = address;
  },

  setIsConnected(isConnected: OptionsCtrlState['isConnected']) {
    state.isConnected = isConnected;
  },

  setIsDataLoaded(isDataLoaded: OptionsCtrlState['isDataLoaded']) {
    state.isDataLoaded = isDataLoaded;
  },

  setSessionUri(sessionUri: OptionsCtrlState['sessionUri']) {
    state.sessionUri = sessionUri;
  },

  resetAccount() {
    state.address = undefined;
    state.isConnected = false;
    state.sessionUri = undefined;
  },
};
