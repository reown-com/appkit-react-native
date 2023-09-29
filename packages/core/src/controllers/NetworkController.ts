import { proxy, ref } from 'valtio';
import type { CaipNetwork, CaipNetworkId } from '../utils/TypeUtils';

// -- Types --------------------------------------------- //
export interface NetworkControllerClient {
  switchCaipNetwork: (network: NetworkControllerState['caipNetwork']) => Promise<void>;
  getApprovedCaipNetworksData: () => Promise<{
    approvedCaipNetworkIds: NetworkControllerState['approvedCaipNetworkIds'];
    supportsAllNetworks: NetworkControllerState['supportsAllNetworks'];
  }>;
}

export interface NetworkControllerState {
  supportsAllNetworks: boolean;
  isDefaultCaipNetwork: boolean;
  _client?: NetworkControllerClient;
  caipNetwork?: CaipNetwork;
  requestedCaipNetworks?: CaipNetwork[];
  approvedCaipNetworkIds?: CaipNetworkId[];
}

// -- State --------------------------------------------- //
const state = proxy<NetworkControllerState>({
  supportsAllNetworks: true,
  isDefaultCaipNetwork: false
});

// -- Controller ---------------------------------------- //
export const NetworkController = {
  state,

  _getClient() {
    if (!state._client) {
      throw new Error('NetworkController client not set');
    }

    return state._client;
  },

  setClient(client: NetworkControllerClient) {
    state._client = ref(client);
  },

  setCaipNetwork(caipNetwork: NetworkControllerState['caipNetwork']) {
    state.caipNetwork = caipNetwork;
  },

  setDefaultCaipNetwork(caipNetwork: NetworkControllerState['caipNetwork']) {
    state.caipNetwork = caipNetwork;
    state.isDefaultCaipNetwork = true;
  },

  setRequestedCaipNetworks(requestedNetworks: NetworkControllerState['requestedCaipNetworks']) {
    state.requestedCaipNetworks = requestedNetworks;
  },

  async getApprovedCaipNetworksData() {
    const data = await this._getClient().getApprovedCaipNetworksData();
    state.supportsAllNetworks = data.supportsAllNetworks;
    state.approvedCaipNetworkIds = data.approvedCaipNetworkIds;
  },

  async switchActiveNetwork(network: NetworkControllerState['caipNetwork']) {
    await this._getClient().switchCaipNetwork(network);
    state.caipNetwork = network;
  },

  resetNetwork() {
    if (!state.isDefaultCaipNetwork) {
      state.caipNetwork = undefined;
    }
    state.approvedCaipNetworkIds = undefined;
    state.supportsAllNetworks = true;
  }
};
