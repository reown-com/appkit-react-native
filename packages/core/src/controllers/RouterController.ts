import { proxy } from 'valtio';
import type { WcWallet, CaipNetwork, Connector, SwapInputTarget } from '../utils/TypeUtil';

// -- Types --------------------------------------------- //
type TransactionAction = {
  goBack: boolean;
  view: RouterControllerState['view'] | null;
  close?: boolean;
  replace?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
};

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
    | 'ConnectingFarcaster'
    | 'ConnectingWalletConnect'
    | 'Create'
    | 'EmailVerifyDevice'
    | 'EmailVerifyOtp'
    | 'GetWallet'
    | 'Networks'
    | 'OnRamp'
    | 'OnRampCheckout'
    | 'OnRampLoading'
    | 'OnRampSettings'
    | 'SwitchNetwork'
    | 'Swap'
    | 'SwapSelectToken'
    | 'SwapPreview'
    | 'Transactions'
    | 'UnsupportedChain'
    | 'UpdateEmailPrimaryOtp'
    | 'UpdateEmailSecondaryOtp'
    | 'UpdateEmailWallet'
    | 'UpgradeEmailWallet'
    | 'UpgradeToSmartAccount'
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
  };
  transactionStack: TransactionAction[];
}

// -- State --------------------------------------------- //
const state = proxy<RouterControllerState>({
  view: 'Connect',
  history: ['Connect'],
  transactionStack: []
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

  pushTransactionStack(action: TransactionAction) {
    state.transactionStack = [...state.transactionStack, action];
  },

  popTransactionStack(cancel?: boolean) {
    const action = state.transactionStack.pop();

    if (!action) {
      return;
    }

    if (cancel) {
      this.goBack();
      action?.onCancel?.();
    } else {
      if (action.goBack) {
        this.goBack();
      } else if (action.view) {
        this.reset(action.view);
      }
      action?.onSuccess?.();
    }
  },

  reset(view: RouterControllerState['view']) {
    state.view = view;
    state.history = [view];
  },

  replace(view: RouterControllerState['view'], data?: RouterControllerState['data']) {
    if (state.history.length > 1 && state.history.at(-1) !== view) {
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
