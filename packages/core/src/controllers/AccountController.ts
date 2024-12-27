import { proxy, ref } from 'valtio';

import {
  type Balance,
  type CaipAddress,
  type ChainNamespace,
  type SocialProvider
} from '@reown/appkit-common-react-native';
import type UniversalProvider from '@walletconnect/universal-provider';

import { CoreHelperUtil } from '../utils/CoreHelperUtil';
import type {
  AccountType,
  AccountTypeMap,
  AppKitFrameAccountType,
  CombinedProvider,
  ConnectedWalletInfo,
  Provider
} from '../utils/TypeUtil';
import { BlockchainApiController } from './BlockchainApiController';
import { SnackController } from './SnackController';
import { ChainController } from './ChainController';
import { SwapController } from './SwapController';
import { SwapApiUtil } from '../utils/SwapApiUtil';
import { ConstantsUtil } from '../utils/ConstantsUtil';

// -- Types --------------------------------------------- //
export interface AccountControllerState {
  currentTab: number;
  isConnected: boolean; //TODO: check this one
  caipAddress?: CaipAddress;
  address?: string;
  addressLabels: Map<string, string>;
  allAccounts: AccountType[];
  balance?: string;
  balanceSymbol?: string;
  tokenBalance?: Balance[];
  profileName?: string;
  profileImage?: string;
  addressExplorerUrl?: string;
  shouldUpdateToAddress?: string;
  connectedWalletInfo?: ConnectedWalletInfo;
  preferredAccountType?: AppKitFrameAccountType;
  smartAccountDeployed?: boolean;
  socialProvider?: SocialProvider;
  farcasterUrl?: string;
  provider?: UniversalProvider | Provider | CombinedProvider;
  status?: 'reconnecting' | 'connected' | 'disconnected' | 'connecting';
  lastRetry?: number;
}

// -- State --------------------------------------------- //
const state = proxy<AccountControllerState>({
  currentTab: 0,
  isConnected: false,
  tokenBalance: [],
  smartAccountDeployed: false,
  preferredAccountType: 'eoa',
  addressLabels: new Map(),
  allAccounts: []
});

// -- Controller ---------------------------------------- //
export const AccountController = {
  state,

  replaceState(newState: AccountControllerState | undefined) {
    if (!newState) {
      return;
    }

    Object.assign(state, ref(newState));
  },

  subscribe(callback: (val: AccountControllerState) => void) {
    return ChainController.subscribeChainProp('accountState', accountState => {
      if (accountState) {
        return callback(accountState);
      }

      return undefined;
    });
  },

  subscribeKey<K extends keyof AccountControllerState>(
    property: K,
    callback: (val: AccountControllerState[K]) => void,
    chain?: ChainNamespace
  ) {
    let prev: AccountControllerState[K] | undefined;

    return ChainController.subscribeChainProp(
      'accountState',
      accountState => {
        if (accountState) {
          const nextValue = accountState[
            property as keyof typeof accountState
          ] as AccountControllerState[K];
          if (prev !== nextValue) {
            prev = nextValue;
            callback(nextValue);
          }
        }
      },
      chain
    );
  },

  //TODO: CHECK THIS ONE
  setIsConnected(isConnected: AccountControllerState['isConnected']) {
    state.isConnected = isConnected;
  },

  setStatus(status: AccountControllerState['status'], chain: ChainNamespace | undefined) {
    ChainController.setAccountProp('status', status, chain);
  },

  getCaipAddress(chain: ChainNamespace | undefined) {
    return ChainController.getAccountProp('caipAddress', chain);
  },

  setProvider(provider: AccountControllerState['provider'], chain: ChainNamespace | undefined) {
    if (provider) {
      ChainController.setAccountProp('provider', provider, chain);
    }
  },

  setCaipAddress(
    caipAddress: AccountControllerState['caipAddress'],
    chain: ChainNamespace | undefined
  ) {
    const newAddress = caipAddress ? CoreHelperUtil.getPlainAddress(caipAddress) : undefined;

    if (chain === ChainController.state.activeChain) {
      ChainController.state.activeCaipAddress = caipAddress;
    }

    ChainController.setAccountProp('caipAddress', caipAddress, chain);
    ChainController.setAccountProp('address', newAddress, chain);
  },

  setBalance(
    balance: AccountControllerState['balance'],
    balanceSymbol: AccountControllerState['balanceSymbol'],
    chain: ChainNamespace
  ) {
    ChainController.setAccountProp('balance', balance, chain);
    ChainController.setAccountProp('balanceSymbol', balanceSymbol, chain);
  },

  setTokenBalance(
    tokenBalance: AccountControllerState['tokenBalance'],
    chain: ChainNamespace | undefined
  ) {
    if (tokenBalance) {
      ChainController.setAccountProp('tokenBalance', tokenBalance, chain);
    }
  },

  setProfileName(profileName: AccountControllerState['profileName'], chain: ChainNamespace) {
    ChainController.setAccountProp('profileName', profileName, chain);
  },

  setProfileImage(profileImage: AccountControllerState['profileImage'], chain?: ChainNamespace) {
    ChainController.setAccountProp('profileImage', profileImage, chain);
  },

  setAllAccounts<N extends ChainNamespace>(accounts: AccountTypeMap[N][], namespace: N) {
    ChainController.setAccountProp('allAccounts', accounts, namespace);
  },

  addAddressLabel(address: string, label: string, chain: ChainNamespace | undefined) {
    const map = ChainController.getAccountProp('addressLabels', chain) || new Map();
    map.set(address, label);
    ChainController.setAccountProp('addressLabels', map, chain);
  },

  removeAddressLabel(address: string, chain: ChainNamespace | undefined) {
    const map = ChainController.getAccountProp('addressLabels', chain) || new Map();
    map.delete(address);
    ChainController.setAccountProp('addressLabels', map, chain);
  },

  setConnectedWalletInfo(
    connectedWalletInfo: AccountControllerState['connectedWalletInfo'],
    chain: ChainNamespace
  ) {
    ChainController.setAccountProp('connectedWalletInfo', connectedWalletInfo, chain, false);
  },

  setAddressExplorerUrl(
    explorerUrl: AccountControllerState['addressExplorerUrl'],
    chain: ChainNamespace | undefined
  ) {
    ChainController.setAccountProp('addressExplorerUrl', explorerUrl, chain);
  },

  setPreferredAccountType(
    preferredAccountType: AccountControllerState['preferredAccountType'],
    chain: ChainNamespace
  ) {
    ChainController.setAccountProp('preferredAccountType', preferredAccountType, chain);
  },

  setSmartAccountDeployed(isDeployed: boolean, chain: ChainNamespace | undefined) {
    ChainController.setAccountProp('smartAccountDeployed', isDeployed, chain);
  },

  //TODO Check if used
  setShouldUpdateToAddress(address: string, chain: ChainNamespace | undefined) {
    ChainController.setAccountProp('shouldUpdateToAddress', address, chain);
  },

  //TODO: Use it in tabs view
  setCurrentTab(currentTab: AccountControllerState['currentTab']) {
    ChainController.setAccountProp('currentTab', currentTab, ChainController.state.activeChain);
  },

  setSocialProvider(
    socialProvider: AccountControllerState['socialProvider'],
    chain: ChainNamespace | undefined
  ) {
    if (socialProvider) {
      ChainController.setAccountProp('socialProvider', socialProvider, chain);
    }
  },

  setFarcasterUrl(
    farcasterUrl: AccountControllerState['farcasterUrl'],
    chain: ChainNamespace | undefined
  ) {
    if (farcasterUrl) {
      ChainController.setAccountProp('farcasterUrl', farcasterUrl, chain);
    }
  },

  async fetchTokenBalance() {
    const chainId = ChainController.state.activeCaipNetwork?.caipNetworkId;
    const chain = ChainController.state.activeCaipNetwork?.chainNamespace;
    const caipAddress = ChainController.state.activeCaipAddress;
    const address = caipAddress ? CoreHelperUtil.getPlainAddress(caipAddress) : undefined;

    if (
      state.lastRetry &&
      !CoreHelperUtil.isAllowedRetry(state.lastRetry, 30 * ConstantsUtil.ONE_SEC_MS)
    ) {
      return;
    }

    try {
      if (address && chainId && chain) {
        const response = await BlockchainApiController.getBalance(address, chainId);

        if (!response) {
          throw new Error('Failed to fetch token balance');
        }

        const filteredBalances = response.balances.filter(
          balance => balance.quantity.decimals !== '0'
        );

        this.setTokenBalance(filteredBalances, chain);
        SwapController.setBalances(SwapApiUtil.mapBalancesToSwapTokens(response.balances));
        state.lastRetry = undefined;
      }
    } catch (error) {
      state.lastRetry = Date.now();

      SnackController.showError('Token Balance Unavailable');
    }
  },

  resetAccount(chain: ChainNamespace) {
    ChainController.resetAccount(chain);
  }
};
