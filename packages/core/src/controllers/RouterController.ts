import { proxy } from 'valtio';
import type { CaipNetwork, SocialProvider } from '@reown/appkit-common-react-native';

import type {
  WcWallet,
  Connector,
  SwapInputTarget,
  OnRampTransactionResult
} from '../utils/TypeUtil';

// -- Types --------------------------------------------- //
export interface RouterControllerState {
  view:
    | 'Account'
    | 'AccountDefault'
    | 'AllWallets'
    | 'Connect'
    | 'ConnectSocials'
    | 'ConnectingExternal'
    | 'ConnectingSiwe'
    | 'ConnectingSocial'
    | 'ConnectingWalletConnect'
    | 'GetWallet'
    | 'Networks'
    | 'OnRamp'
    | 'OnRampCheckout'
    | 'OnRampLoading'
    | 'OnRampSettings'
    | 'OnRampTransaction'
    | 'SwitchNetwork'
    | 'Swap'
    | 'SwapSelectToken'
    | 'SwapPreview'
    | 'Transactions'
    | 'UnsupportedChain'
    | 'UpgradeEmailWallet'
    | 'WalletCompatibleNetworks'
    | 'WalletReceive'
    | 'WalletSend'
    | 'WalletSendPreview'
    | 'WalletSendSelectToken'
    | 'WhatIsANetwork'
    | 'WhatIsAWallet';
  history: RouterControllerState['view'][];
  data?: {
    connector?: Connector;
    wallet?: WcWallet;
    network?: CaipNetwork;
    email?: string;
    newEmail?: string;
    swapTarget?: SwapInputTarget;
    onrampResult?: OnRampTransactionResult;
    socialProvider?: SocialProvider;
  };
}

// -- State --------------------------------------------- //
const state = proxy<RouterControllerState>({
  view: 'Connect',
  history: ['Connect']
});

// -- Controller ---------------------------------------- //
export const RouterController = {
  state,

  push(view: RouterControllerState['view'], data?: RouterControllerState['data']) {
    if (view !== state.view) {
      state.view = view;
      state.history = [...state.history, view];
      state.data = data;
    }
  },

  reset(view: RouterControllerState['view'], data?: RouterControllerState['data']) {
    state.view = view;
    state.history = [view];
    state.data = data;
  },

  replace(view: RouterControllerState['view'], data?: RouterControllerState['data']) {
    if (state.history.length >= 1 && state.history.at(-1) !== view) {
      state.view = view;
      state.history[state.history.length - 1] = view;
      state.data = data;
    }
  },

  goBack() {
    if (state.history.length > 1) {
      state.history.pop();
      const [last] = state.history.slice(-1);
      if (last) {
        state.view = last;
      }
    }
  },

  goBackToIndex(historyIndex: number) {
    if (state.history.length > 1) {
      state.history = state.history.slice(0, historyIndex + 1);
      const [last] = state.history.slice(-1);
      if (last) {
        state.view = last;
      }
    }
  }
};
