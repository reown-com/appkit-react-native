import { proxy, ref } from 'valtio';
import type { CaipNetwork, CaipNetworkId } from '../utils/TypeUtil';
import { PublicStateController } from './PublicStateController';
import { NetworkUtil } from '@reown/appkit-common-react-native';
import { ConstantsUtil } from '../utils/ConstantsUtil';

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
  smartAccountEnabledNetworks: number[];
}

// -- State --------------------------------------------- //
const state = proxy<NetworkControllerState>({
  supportsAllNetworks: true,
  isDefaultCaipNetwork: false,
  smartAccountEnabledNetworks: []
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
    PublicStateController.set({ selectedNetworkId: caipNetwork?.id });
  },

  setDefaultCaipNetwork(caipNetwork: NetworkControllerState['caipNetwork']) {
    state.caipNetwork = caipNetwork;
    state.isDefaultCaipNetwork = true;
    PublicStateController.set({ selectedNetworkId: caipNetwork?.id });
  },

  setRequestedCaipNetworks(requestedNetworks: NetworkControllerState['requestedCaipNetworks']) {
    state.requestedCaipNetworks = requestedNetworks;
  },

  setSmartAccountEnabledNetworks(
    smartAccountEnabledNetworks: NetworkControllerState['smartAccountEnabledNetworks']
  ) {
    state.smartAccountEnabledNetworks = smartAccountEnabledNetworks;
  },

  checkIfSmartAccountEnabled() {
    const networkId = NetworkUtil.caipNetworkIdToNumber(state.caipNetwork?.id);

    if (!networkId) {
      return false;
    }

    return Boolean(state.smartAccountEnabledNetworks?.includes(Number(networkId)));
  },

  async getApprovedCaipNetworksData() {
    const data = await this._getClient().getApprovedCaipNetworksData();
    state.supportsAllNetworks = data.supportsAllNetworks;
    state.approvedCaipNetworkIds = data.approvedCaipNetworkIds;
  },

  getApprovedCaipNetworks() {
    return state.approvedCaipNetworkIds
      ?.map(id => state.requestedCaipNetworks?.find(network => network.id === id))
      .filter(Boolean) as CaipNetwork[];
  },

  getSmartAccountEnabledNetworks() {
    return this.getApprovedCaipNetworks().filter(
      network =>
        state.smartAccountEnabledNetworks?.find(networkId => network.id === `eip155:${networkId}`)
    );
  },

  getActiveNetworkTokenAddress() {
    const chainId = this.state.caipNetwork?.id || 'eip155:1';
    const address = ConstantsUtil.NATIVE_TOKEN_ADDRESS;

    return `${chainId}:${address}`;
  },

  async switchActiveNetwork(network: NetworkControllerState['caipNetwork']) {
    await this._getClient().switchCaipNetwork(network);
    state.caipNetwork = network;
    PublicStateController.set({ selectedNetworkId: network?.id });
  },

  resetNetwork() {
    if (!state.isDefaultCaipNetwork) {
      state.caipNetwork = undefined;
    }
    state.approvedCaipNetworkIds = undefined;
    state.supportsAllNetworks = true;
    state.smartAccountEnabledNetworks = [];
  },

  isActiveNetworkInRequestedNetworks() {
    if (!state.caipNetwork || !state.requestedCaipNetworks?.length) {
      return true; // No active network or no requested networks, so no validation needed
    }
    return state.requestedCaipNetworks.some(network => network.id === state.caipNetwork?.id);
  }
};
