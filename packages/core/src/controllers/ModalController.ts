import { proxy } from 'valtio';
import { AccountController } from './AccountController';
import type { RouterControllerState } from './RouterController';
import { RouterController } from './RouterController';

// -- Types --------------------------------------------- //
export interface ModalControllerState {
  open: boolean;
}

export interface ModalControllerArguments {
  open: {
    view?: RouterControllerState['view'];
  };
}

// -- State --------------------------------------------- //
const state = proxy<ModalControllerState>({
  open: false
});

// -- Controller ---------------------------------------- //
export const ModalController = {
  state,

  open(options?: ModalControllerArguments['open']) {
    if (options?.view) {
      RouterController.reset(options.view);
    } else if (AccountController.state.isConnected) {
      RouterController.reset('Account');
    } else {
      RouterController.reset('Connect');
    }
    state.open = true;
  },

  close() {
    state.open = false;
  }
};
