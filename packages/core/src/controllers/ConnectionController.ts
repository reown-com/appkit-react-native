import { proxy } from 'valtio';
import { subscribeKey as subKey } from 'valtio/utils';
import type { SocialProvider, WalletDeepLink } from '@reown/appkit-common-react-native';
import { CoreHelperUtil } from '../utils/CoreHelperUtil';
import { StorageUtil } from '../utils/StorageUtil';
import type { WcWallet } from '../utils/TypeUtil';

// -- Types --------------------------------------------- //
export interface ConnectionControllerState {
  wcUri?: string;
  wcPromise?: Promise<void>;
  wcPairingExpiry?: number;
  wcLinking?: WalletDeepLink;
  wcError?: boolean;
  pressedWallet?: WcWallet;
  recentWallets?: WcWallet[];
  connectedSocialProvider?: SocialProvider; // TODO: remove this
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

  setWcPromise(wcPromise: ConnectionControllerState['wcPromise']) {
    state.wcPromise = wcPromise;
  },

  setWcUri(wcUri: ConnectionControllerState['wcUri']) {
    state.wcUri = wcUri;
    state.wcPairingExpiry = CoreHelperUtil.getPairingExpiry();
  },

  setRecentWallets(wallets: ConnectionControllerState['recentWallets']) {
    state.recentWallets = wallets;
  },

  setConnectedSocialProvider(provider: ConnectionControllerState['connectedSocialProvider']) {
    state.connectedSocialProvider = provider;

    if (provider) {
      StorageUtil.setConnectedSocialProvider(provider);
    } else {
      StorageUtil.removeConnectedSocialProvider();
    }
  },

  clearUri() {
    state.wcUri = undefined;
    state.wcPairingExpiry = undefined;
    state.wcPromise = undefined;
    state.wcLinking = undefined;
  },

  resetWcConnection() {
    this.clearUri();
    state.pressedWallet = undefined;
    StorageUtil.removeWalletConnectDeepLink();
  },

  async disconnect() {
    this.resetWcConnection();
    // remove transactions
    // RouterController.reset('Connect');
  }
};
