import { subscribeKey as subKey } from 'valtio/utils';
import { proxy, ref, subscribe as sub } from 'valtio';
import type { Address, Provider } from './EthersTypesUtil';

// -- Types --------------------------------------------- //

export interface EthersStoreUtilState {
  provider?: Provider;
  providerType?: 'WALLET_CONNECT' | 'COINBASE' | 'EMAIL' | 'EXTERNAL';
  address?: Address;
  chainId?: number;
  error?: unknown;
  isConnected: boolean;
}

type StateKey = keyof EthersStoreUtilState;

// -- State --------------------------------------------- //
const state = proxy<EthersStoreUtilState>({
  provider: undefined,
  providerType: undefined,
  address: undefined,
  chainId: undefined,
  isConnected: false
});

// -- StoreUtil ---------------------------------------- //
export const EthersStoreUtil = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: EthersStoreUtilState[K]) => void) {
    return subKey(state, key, callback);
  },

  subscribe(callback: (newState: EthersStoreUtilState) => void) {
    return sub(state, () => callback(state));
  },

  setProvider(provider: EthersStoreUtilState['provider']) {
    if (provider) {
      state.provider = ref(provider);
    }
  },

  setProviderType(providerType: EthersStoreUtilState['providerType']) {
    state.providerType = providerType;
  },

  setAddress(address: EthersStoreUtilState['address']) {
    state.address = address;
  },

  setChainId(chainId: EthersStoreUtilState['chainId']) {
    state.chainId = chainId;
  },

  setIsConnected(isConnected: EthersStoreUtilState['isConnected']) {
    state.isConnected = isConnected;
  },

  setError(error: EthersStoreUtilState['error']) {
    state.error = error;
  },

  reset() {
    state.provider = undefined;
    state.address = undefined;
    state.chainId = undefined;
    state.providerType = undefined;
    state.isConnected = false;
    state.error = undefined;
  }
};
