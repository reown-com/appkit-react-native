import { proxy } from 'valtio';
import { AccountController } from './AccountController';
import type { RouterControllerState } from './RouterController';
import { RouterController } from './RouterController';
import { PublicStateController } from './PublicStateController';
import { EventsController } from './EventsController';
import { ApiController } from './ApiController';
import { ConnectionsController } from './ConnectionsController';

// -- Types --------------------------------------------- //
export interface ModalControllerState {
  open: boolean;
  loading: boolean;
}

export interface ModalControllerArguments {
  open: {
    view?: RouterControllerState['view'];
  };
}

// -- State --------------------------------------------- //
const state = proxy<ModalControllerState>({
  open: false,
  loading: false
});

// -- Controller ---------------------------------------- //
export const ModalController = {
  state,

  async open(options?: ModalControllerArguments['open']) {
    await ApiController.state.prefetchPromise;
    const connected = AccountController.state.isConnected;
    if (options?.view) {
      RouterController.reset(options.view);
    } else if (AccountController.state.isConnected) {
      const isUniversalWallet = !!ConnectionsController.state.connection?.properties?.provider;
      RouterController.reset(isUniversalWallet ? 'Account' : 'AccountDefault');
    } else {
      RouterController.reset('Connect');
    }
    state.open = true;
    PublicStateController.set({ open: true });
    EventsController.sendEvent({
      type: 'track',
      event: 'MODAL_OPEN',
      properties: { connected }
    });
  },

  close() {
    const connected = AccountController.state.isConnected;
    state.open = false;
    PublicStateController.set({ open: false });
    EventsController.sendEvent({
      type: 'track',
      event: 'MODAL_CLOSE',
      properties: { connected }
    });
  },

  setLoading(loading: ModalControllerState['loading']) {
    state.loading = loading;
  }
};
