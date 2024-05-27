import { proxy } from 'valtio';
import { subscribeKey as subKey } from 'valtio/utils';

import { CoreHelperUtil } from '../utils/CoreHelperUtil';
import type { CaipAddress, ConnectedWalletInfo } from '../utils/TypeUtil';

// -- Types --------------------------------------------- //
export interface AccountControllerState {
  isConnected: boolean;
  caipAddress?: CaipAddress;
  address?: string;
  balance?: string;
  balanceSymbol?: string;
  profileName?: string;
  profileImage?: string;
  addressExplorerUrl?: string;
  connectedWalletInfo?: ConnectedWalletInfo;
}

type StateKey = keyof AccountControllerState;

// -- State --------------------------------------------- //
const state = proxy<AccountControllerState>({
  isConnected: false
});

// -- Controller ---------------------------------------- //
export const AccountController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: AccountControllerState[K]) => void) {
    return subKey(state, key, callback);
  },

  setIsConnected(isConnected: AccountControllerState['isConnected']) {
    state.isConnected = isConnected;
  },

  setCaipAddress(caipAddress: AccountControllerState['caipAddress']) {
    const address = caipAddress ? CoreHelperUtil.getPlainAddress(caipAddress) : undefined;
    state.caipAddress = caipAddress;
    state.address = address;
  },

  setBalance(
    balance: AccountControllerState['balance'],
    balanceSymbol: AccountControllerState['balanceSymbol']
  ) {
    state.balance = balance;
    state.balanceSymbol = balanceSymbol;
  },

  setProfileName(profileName: AccountControllerState['profileName']) {
    state.profileName = profileName;
  },

  setProfileImage(profileImage: AccountControllerState['profileImage']) {
    state.profileImage = profileImage;
  },

  setConnectedWalletInfo(connectedWalletInfo: AccountControllerState['connectedWalletInfo']) {
    state.connectedWalletInfo = connectedWalletInfo;
  },

  setAddressExplorerUrl(explorerUrl: AccountControllerState['addressExplorerUrl']) {
    state.addressExplorerUrl = explorerUrl;
  },

  resetAccount() {
    state.isConnected = false;
    state.caipAddress = undefined;
    state.address = undefined;
    state.balance = undefined;
    state.balanceSymbol = undefined;
    state.profileName = undefined;
    state.profileImage = undefined;
    state.addressExplorerUrl = undefined;
  }
};
