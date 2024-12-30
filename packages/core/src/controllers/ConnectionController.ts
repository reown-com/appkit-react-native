import { proxy, ref } from 'valtio';
import { subscribeKey as subKey } from 'valtio/utils';
import {
  ConstantsUtil,
  type CaipNetwork,
  type ChainNamespace,
  type SocialProvider
} from '@reown/appkit-common-react-native';
import { CoreHelperUtil } from '../utils/CoreHelperUtil';
import { StorageUtil } from '../utils/StorageUtil';
import type {
  Connector,
  EstimateGasTransactionArgs,
  SendTransactionArgs,
  WcWallet,
  WriteContractArgs
} from '../utils/TypeUtil';

// -- Types --------------------------------------------- //
export interface ConnectExternalOptions {
  id: Connector['id'];
  type: Connector['type'];
  provider?: Connector['provider'];
  info?: Connector['info'];
  chain?: ChainNamespace;
  chainId?: number | string;
  caipNetwork?: CaipNetwork;
}

export interface ConnectionControllerClient {
  connectWalletConnect: (
    onUri: (uri: string) => void,
    walletUniversalLink?: string
  ) => Promise<void>;
  connectExternal?: (options: ConnectExternalOptions) => Promise<void>;
  reconnectExternal?: (options: ConnectExternalOptions) => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  sendTransaction: (args: SendTransactionArgs) => Promise<string | null>;
  parseUnits: (value: string, decimals: number) => bigint;
  formatUnits: (value: bigint, decimals: number) => string;
  writeContract: (args: WriteContractArgs) => Promise<`0x${string}` | null>;
  estimateGas: (args: EstimateGasTransactionArgs) => Promise<bigint>;
  disconnect: () => Promise<void>;
  getEnsAddress: (value: string) => Promise<false | string>;
  getEnsAvatar: (value: string) => Promise<false | string>;
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
  selectedSocialProvider?: SocialProvider; //TODO: check this
  connectedWalletImageUrl?: string; //TODO: check this
  connectedSocialProvider?: SocialProvider; //TODO: check this
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

  connectWalletConnect(walletUniversalLink?: string) {
    StorageUtil.setConnectedConnectorId(ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT);

    state.wcPromise = this._getClient().connectWalletConnect(uri => {
      state.wcUri = uri;
      state.wcPairingExpiry = CoreHelperUtil.getPairingExpiry();
    }, walletUniversalLink);
  },

  async connectExternal(options: ConnectExternalOptions) {
    await this._getClient().connectExternal?.(options);
    StorageUtil.setConnectedConnectorId(options.id);
  },

  async signMessage(message: string) {
    return this._getClient().signMessage(message);
  },

  setUri(uri: string) {
    state.wcUri = uri;
    state.wcPairingExpiry = CoreHelperUtil.getPairingExpiry();
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

  setSelectedSocialProvider(provider: ConnectionControllerState['selectedSocialProvider']) {
    state.selectedSocialProvider = provider;
  },

  async setConnectedWalletImageUrl(url: ConnectionControllerState['connectedWalletImageUrl']) {
    state.connectedWalletImageUrl = url;

    if (url) {
      await StorageUtil.setConnectedWalletImageUrl(url);
    } else {
      StorageUtil.removeConnectedWalletImageUrl();
    }
  },

  setConnectedSocialProvider(provider: ConnectionControllerState['connectedSocialProvider']) {
    state.connectedSocialProvider = provider;

    if (provider) {
      StorageUtil.setConnectedSocialProvider(provider);
    } else {
      StorageUtil.removeConnectedSocialProvider();
    }
  },

  parseUnits(value: string, decimals: number) {
    return this._getClient().parseUnits(value, decimals);
  },

  formatUnits(value: bigint, decimals: number) {
    return this._getClient().formatUnits(value, decimals);
  },

  async sendTransaction(args: SendTransactionArgs) {
    return this._getClient().sendTransaction(args);
  },

  async estimateGas(args: EstimateGasTransactionArgs) {
    return this._getClient()?.estimateGas(args);
  },
  async writeContract(args: WriteContractArgs) {
    return this._getClient().writeContract(args);
  },

  async getEnsAddress(value: string) {
    return this._getClient().getEnsAddress(value);
  },

  async getEnsAvatar(value: string) {
    return this._getClient().getEnsAvatar(value);
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
    state.selectedSocialProvider = undefined;
    ConnectionController.setConnectedWalletImageUrl(undefined);
    // ConnectorController.setConnectedConnector(undefined);
    StorageUtil.removeWalletConnectDeepLink();
  },

  async disconnect() {
    await this._getClient().disconnect();
    this.resetWcConnection();
    // remove transactions
    // RouterController.reset('Connect');
  }
};
