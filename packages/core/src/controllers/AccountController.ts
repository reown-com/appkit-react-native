import { proxy } from 'valtio';
import { subscribeKey as subKey } from 'valtio/utils';

// -- Types --------------------------------------------- //
export interface AccountControllerState {
  profileName?: string;
  profileImage?: string;
}

type StateKey = keyof AccountControllerState;

// -- State --------------------------------------------- //
const state = proxy<AccountControllerState>({});

// -- Controller ---------------------------------------- //
export const AccountController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: AccountControllerState[K]) => void) {
    return subKey(state, key, callback);
  },

  setProfileName(profileName: AccountControllerState['profileName']) {
    state.profileName = profileName;
  },

  setProfileImage(profileImage: AccountControllerState['profileImage']) {
    state.profileImage = profileImage;
  },

  resetAccount() {
    state.profileName = undefined;
    state.profileImage = undefined;
  }
};
