import { proxy } from 'valtio';
import { subscribeKey as subKey } from 'valtio/utils';
import type { Balance } from '@reown/appkit-common-react-native';

import { CoreHelperUtil } from '../utils/CoreHelperUtil';
import type { AppKitFrameAccountType, CaipAddress, ConnectedWalletInfo } from '../utils/TypeUtil';
import { NetworkController } from './NetworkController';
import { BlockchainApiController } from './BlockchainApiController';
import { SnackController } from './SnackController';

// -- Types --------------------------------------------- //
export interface AccountControllerState {
  isConnected: boolean;
  caipAddress?: CaipAddress;
  address?: string;
  balance?: string;
  balanceSymbol?: string;
  tokenBalance?: Balance[];
  profileName?: string;
  profileImage?: string;
  addressExplorerUrl?: string;
  connectedWalletInfo?: ConnectedWalletInfo;
  preferredAccountType?: AppKitFrameAccountType;
  smartAccountDeployed?: boolean;
}

type StateKey = keyof AccountControllerState;

// -- State --------------------------------------------- //
const state = proxy<AccountControllerState>({
  isConnected: false,
  tokenBalance: [],
  smartAccountDeployed: false,
  preferredAccountType: 'eoa'
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

  setTokenBalance(tokenBalance: AccountControllerState['tokenBalance']) {
    state.tokenBalance = tokenBalance;
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

  setPreferredAccountType(accountType: AccountControllerState['preferredAccountType']) {
    state.preferredAccountType = accountType;
  },

  setSmartAccountDeployed(smartAccountDeployed: AccountControllerState['smartAccountDeployed']) {
    state.smartAccountDeployed = smartAccountDeployed;
  },

  async fetchTokenBalance() {
    const chainId = NetworkController.state.caipNetwork?.id;
    const address = AccountController.state.address;

    try {
      if (address && chainId) {
        const response = await BlockchainApiController.getBalance(address, chainId);

        if (!response) {
          throw new Error('Failed to fetch token balance');
        }

        const filteredBalances = response.balances.filter(
          balance => balance.quantity.decimals !== '0'
        );

        this.setTokenBalance(filteredBalances);
      }
    } catch (error) {
      SnackController.showError('Failed to fetch token balance');
    }
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
    state.tokenBalance = [];
    state.connectedWalletInfo = undefined;
    state.preferredAccountType = 'eoa';
    state.smartAccountDeployed = false;
  }
};
