import type { ConnectorType } from '@reown/appkit-common-react-native';
import { subscribeKey as subKey } from 'valtio/utils';
import { proxy, ref } from 'valtio';
import type { Connector } from '../utils/TypeUtil';
import { StorageUtil } from '../utils/StorageUtil';

// -- Types --------------------------------------------- //
export interface ConnectorControllerState {
  connectors: Connector[];
  connectedConnector?: ConnectorType;
  authLoading?: boolean;
}

type StateKey = keyof ConnectorControllerState;

// -- State --------------------------------------------- //
const state = proxy<ConnectorControllerState>({
  connectors: []
});

// -- Controller ---------------------------------------- //
export const ConnectorController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: ConnectorControllerState[K]) => void) {
    return subKey(state, key, callback);
  },

  setConnectors(connectors: ConnectorControllerState['connectors']) {
    state.connectors = connectors.map(c => ref(c));
  },

  addConnector(connector: Connector) {
    state.connectors = [...state.connectors, ref(connector)];
  },

  getConnectors() {
    return state.connectors;
  },

  getAuthConnector() {
    return state.connectors.find(c => c.type === 'AUTH');
  },

  async setConnectedConnector(
    connectorType: ConnectorControllerState['connectedConnector'],
    saveStorage = true
  ) {
    state.connectedConnector = connectorType;

    if (saveStorage) {
      if (connectorType) {
        await StorageUtil.setConnectedConnector(connectorType);
      } else {
        await StorageUtil.removeConnectedConnector();
      }
    }
  },

  setAuthLoading(loading: ConnectorControllerState['authLoading']) {
    state.authLoading = loading;
  }
};
