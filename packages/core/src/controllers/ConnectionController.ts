import { subscribeKey as subKey } from 'valtio/utils';
import { proxy, ref } from 'valtio';
import { CoreHelperUtil } from '../utils/CoreHelperUtil';
import { StorageUtil } from '../utils/StorageUtil';
import type { Connector, WcWallet } from '../utils/TypeUtil';
import { RouterController } from './RouterController';

// -- Types --------------------------------------------- //
export interface ConnectExternalOptions {
  id: Connector['id'];
  type: Connector['type'];
  provider?: Connector['provider'];
  info?: Connector['info'];
}

export interface ConnectionControllerClient {
  connectWalletConnect: (onUri: (uri: string) => void) => Promise<void>;
  connectExternal?: (options: ConnectExternalOptions) => Promise<void>;
  disconnect: () => Promise<void>;
}

export interface ConnectionControllerState {
  _client?: ConnectionControllerClient;
  wcUri?: string;
  wcPromise?: Promise<void>;
  wcPairingExpiry?: number;
  wcLinking?: {
    href: string;
    name: string;
  };
  wcError?: boolean;
  pressedWallet?: WcWallet;
  recentWallets?: WcWallet[];
}

type StateKey = keyof ConnectionControllerState;

// -- State --------------------------------------------- //
const state = proxy<ConnectionControllerState>({
  wcError: false
});

// -- Controller ---------------------------------------- //
export const ConnectionController = {
  state,

  subscribeKey<K extends StateKey>(
    key: K,
    callback: (value: ConnectionControllerState[K]) => void
  ) {
    return subKey(state, key, callback);
  },

  _getClient() {
    if (!state._client) {
      throw new Error('ConnectionController client not set');
    }

    return state._client;
  },

  setClient(client: ConnectionControllerClient) {
    state._client = ref(client);
  },

  connectWalletConnect() {
    state.wcPromise = this._getClient().connectWalletConnect(uri => {
      state.wcUri = uri;
      state.wcPairingExpiry = CoreHelperUtil.getPairingExpiry();
      StorageUtil.setConnectedConnector('WALLET_CONNECT');
    });
  },

  async connectExternal(options: ConnectExternalOptions) {
    await this._getClient().connectExternal?.(options);
    await StorageUtil.setConnectedConnector(options.type);
  },

  resetWcConnection() {
    state.wcUri = undefined;
    state.wcPairingExpiry = undefined;
    state.wcPromise = undefined;
    state.wcLinking = undefined;
    state.pressedWallet = undefined;
    StorageUtil.removeWalletConnectDeepLink();
    StorageUtil.removeConnectedConnector();
  },

  setWcLinking(wcLinking: ConnectionControllerState['wcLinking']) {
    state.wcLinking = wcLinking;
  },

  removeWcLinking() {
    state.wcLinking = undefined;
  },

  setWcError(wcError: ConnectionControllerState['wcError']) {
    state.wcError = wcError;
  },

  setPressedWallet(wallet: ConnectionControllerState['pressedWallet']) {
    state.pressedWallet = wallet;
  },

  removePressedWallet() {
    state.pressedWallet = undefined;
  },

  setRecentWallets(wallets: ConnectionControllerState['recentWallets']) {
    state.recentWallets = wallets;
  },

  async disconnect() {
    await this._getClient().disconnect();
    this.resetWcConnection();
    RouterController.reset('Connect');
  }
};
