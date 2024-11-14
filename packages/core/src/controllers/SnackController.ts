import { proxy } from 'valtio';
import { OptionsController } from './OptionsController';

// -- Types --------------------------------------------- //
interface Message {
  shortMessage: string;
  longMessage?: string;
}

export interface SnackControllerState {
  message: string;
  variant: 'error' | 'success';
  open: boolean;
  long: boolean;
}

// -- State --------------------------------------------- //
const state = proxy<SnackControllerState>({
  message: '',
  variant: 'success',
  open: false,
  long: false
});

// -- Controller ---------------------------------------- //
export const SnackController = {
  state,

  showSuccess(message: SnackControllerState['message']) {
    state.message = message;
    state.variant = 'success';
    state.open = true;
  },

  showError(message: SnackControllerState['message']) {
    state.message = message;
    state.variant = 'error';
    state.open = true;
  },

  showInternalError(error: Message) {
    const { debug } = OptionsController.state;

    if (debug) {
      state.message = error.shortMessage;
      state.variant = 'error';
      state.open = true;
      state.long = true;
    }

    if (error.longMessage) {
      // eslint-disable-next-line no-console
      console.error(error.longMessage);
    }
  },

  hide() {
    state.open = false;
    state.long = false;
  }
};
