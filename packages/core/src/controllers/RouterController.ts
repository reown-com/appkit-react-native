import { proxy } from 'valtio';
import type {
  AppKitNetwork,
  SocialProvider,
  WcWallet,
  OnRampTransactionResult
} from '@reown/appkit-common-react-native';

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
    | 'SwitchNetwork'
    | 'OnRamp'
    | 'OnRampCheckout'
    | 'OnRampLoading'
    | 'OnRampSettings'
    | 'OnRampTransaction'
    | 'Swap'
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
  navigationDirection: 'forward' | 'backward' | 'none';
  data?: {
    wallet?: WcWallet;
    network?: AppKitNetwork;
    onrampResult?: OnRampTransactionResult;
    socialProvider?: SocialProvider;
  };
}

// -- State --------------------------------------------- //
const state = proxy<RouterControllerState>({
  view: 'Connect',
  history: ['Connect'],
  navigationDirection: 'none'
});

// -- Controller ---------------------------------------- //
export const RouterController = {
  state,

  push(
    view: RouterControllerState['view'],
    data?: RouterControllerState['data'],
    direction: 'forward' | 'backward' = 'forward'
  ) {
    if (view !== state.view) {
      state.navigationDirection = direction;
      state.view = view;
      state.history = [...state.history, view];
      state.data = data;
    }
  },

  reset(view: RouterControllerState['view'], data?: RouterControllerState['data']) {
    state.navigationDirection = 'none';
    state.view = view;
    state.history = [view];
    state.data = data;
  },

  replace(view: RouterControllerState['view'], data?: RouterControllerState['data']) {
    if (state.history.length >= 1 && state.history.at(-1) !== view) {
      state.navigationDirection = 'none';
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
        state.navigationDirection = 'backward';
        state.view = last;
      }
    }
  },

  goBackToIndex(historyIndex: number) {
    if (state.history.length > 1) {
      state.history = state.history.slice(0, historyIndex + 1);
      const [last] = state.history.slice(-1);
      if (last) {
        state.navigationDirection = 'backward';
        state.view = last;
      }
    }
  }
};
