import { proxy } from 'valtio';

import type { ModalCtrlState } from '../types/controllerTypes';
import { ClientCtrl } from './ClientCtrl';
import { OptionsCtrl } from './OptionsCtrl';
import { RouterCtrl } from './RouterCtrl';

// -- types -------------------------------------------------------- //
export interface OpenOptions {
  route?: 'ConnectWallet' | 'Qrcode' | 'WalletExplorer';
}

// -- initial state ------------------------------------------------ //
const state = proxy<ModalCtrlState>({
  open: false,
});

// -- controller --------------------------------------------------- //
export const ModalCtrl = {
  state,

  async open(options?: OpenOptions) {
    return new Promise<void>((resolve) => {
      const { isDataLoaded, isConnected } = OptionsCtrl.state;
      const { initialized } = ClientCtrl.state;

      if (options?.route) {
        RouterCtrl.replace(options.route);
      } else if (isConnected) {
        RouterCtrl.replace('Account');
      } else {
        RouterCtrl.replace('ConnectWallet');
      }

      // Open modal if async data is ready
      if (initialized && isDataLoaded) {
        state.open = true;
        resolve();
      }
      // Otherwise (slow network) re-attempt open checks
      else {
        const interval = setInterval(() => {
          if (ClientCtrl.state.initialized && OptionsCtrl.state.isDataLoaded) {
            clearInterval(interval);
            state.open = true;
            resolve();
          }
        }, 200);
      }
    });
  },

  close() {
    state.open = false;
  },
};
