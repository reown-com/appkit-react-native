import { proxy } from 'valtio';
import { subscribeKey as subKey } from 'valtio/utils';
import type { WalletDeepLink } from '@reown/appkit-common-react-native';
import { CoreHelperUtil } from '../utils/CoreHelperUtil';
import { StorageUtil } from '../utils/StorageUtil';
import type { WcWallet } from '../utils/TypeUtil';

// -- Types --------------------------------------------- //
export interface WcControllerState {
  wcUri?: string;
  wcPromise?: Promise<void>;
  wcPairingExpiry?: number;
  wcLinking?: WalletDeepLink;
  wcError?: boolean;
  pressedWallet?: WcWallet;
  recentWallets?: WcWallet[];
}

type StateKey = keyof WcControllerState;

// -- State --------------------------------------------- //
const state = proxy<WcControllerState>({
  wcError: false
});

// -- Controller ---------------------------------------- //
export const WcController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: WcControllerState[K]) => void) {
    return subKey(state, key, callback);
  },

  setWcLinking(wcLinking: WcControllerState['wcLinking']) {
    state.wcLinking = wcLinking;
  },

  removeWcLinking() {
    state.wcLinking = undefined;
  },

  setWcError(wcError: WcControllerState['wcError']) {
    state.wcError = wcError;
  },

  setPressedWallet(wallet: WcControllerState['pressedWallet']) {
    state.pressedWallet = wallet;
  },

  removePressedWallet() {
    state.pressedWallet = undefined;
  },

  setWcPromise(wcPromise: WcControllerState['wcPromise']) {
    state.wcPromise = wcPromise;
  },

  setWcUri(wcUri: WcControllerState['wcUri']) {
    state.wcUri = wcUri;
    state.wcPairingExpiry = CoreHelperUtil.getPairingExpiry();
  },

  setRecentWallets(wallets: WcControllerState['recentWallets']) {
    state.recentWallets = wallets;
  },

  async addRecentWallet(wallet: WcWallet) {
    const recentWallets = await StorageUtil.addRecentWallet(wallet);
    if (recentWallets) {
      WcController.setRecentWallets(recentWallets);
    }
  },

  setConnectedWallet: async (wcLinking: WalletDeepLink, pressedWallet?: WcWallet) => {
    StorageUtil.setWalletConnectDeepLink(wcLinking);

    if (pressedWallet) {
      WcController.addRecentWallet(pressedWallet);
    }
  },

  clearUri() {
    state.wcUri = undefined;
    state.wcPairingExpiry = undefined;
    state.wcPromise = undefined;
    state.wcLinking = undefined;
  },

  resetState() {
    this.clearUri();
    state.pressedWallet = undefined;
    StorageUtil.removeWalletConnectDeepLink();
  }
};
