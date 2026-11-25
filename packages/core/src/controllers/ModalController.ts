import { proxy } from 'valtio';
import { RouterController, type RouterControllerState } from './RouterController';
import { PublicStateController } from './PublicStateController';
import { EventsController } from './EventsController';
import { ApiController } from './ApiController';
import { ConnectionsController } from './ConnectionsController';

// -- Types --------------------------------------------- //
export interface ModalControllerState {
  open: boolean;
  loading: boolean;
  shake: boolean;
}

export interface ModalControllerArguments {
  open: {
    view?: RouterControllerState['view'];
  };
}

// -- State --------------------------------------------- //
const state = proxy<ModalControllerState>({
  open: false,
  loading: false,
  shake: false
});

// open() waits for the prefetch before showing the modal. Each open() and close() bumps this id,
// so an open() that finishes waiting after a newer close() or open() does nothing.
let latestRequestId = 0;

// -- Controller ---------------------------------------- //
export const ModalController = {
  state,

  async open(options?: ModalControllerArguments['open']) {
    const requestId = ++latestRequestId;
    await ApiController.state.prefetchPromise;
    if (requestId !== latestRequestId) {
      return;
    }
    const isConnected = ConnectionsController.state.isConnected;
    const isUniversalWallet = !!ConnectionsController.state.connection?.properties?.provider;
    if (options?.view) {
      if (options.view === 'Account' && !isUniversalWallet) {
        options.view = 'AccountDefault';
      }

      RouterController.reset(options.view);
    } else if (isConnected) {
      RouterController.reset(isUniversalWallet ? 'Account' : 'AccountDefault');
    } else {
      RouterController.reset('Connect');
    }
    state.open = true;
    PublicStateController.set({ open: true });
    EventsController.sendEvent({
      type: 'track',
      event: 'MODAL_OPEN',
      properties: { connected: isConnected }
    });
  },

  close() {
    latestRequestId++;
    const connected = ConnectionsController.state.isConnected;
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
  },

  // Shakes the modal to signal it can't be closed in the current view
  shake() {
    if (state.shake) {
      return;
    }
    state.shake = true;
    setTimeout(() => {
      state.shake = false;
    }, 500);
  }
};
