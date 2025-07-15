import { proxy } from 'valtio';
import { OptionsController } from './OptionsController';

// -- Types --------------------------------------------- //
interface Message {
  shortMessage: string;
  longMessage?: string;
}

export interface SnackControllerState {
  message: string;
  variant: 'error' | 'success' | 'loading';
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

// -- Private Variables --------------------------------- //
let hideTimeout: NodeJS.Timeout | null = null;

// -- Private Functions --------------------------------- //
const clearHideTimeout = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
};

const scheduleAutoHide = (long: boolean) => {
  clearHideTimeout();

  const duration = long ? 15000 : 2200;
  hideTimeout = setTimeout(() => {
    SnackController.hide();
  }, duration);
};

// -- Controller ---------------------------------------- //
export const SnackController = {
  state,

  showSuccess(message: SnackControllerState['message'], long = false) {
    state.message = message;
    state.variant = 'success';
    state.open = true;
    state.long = long;
    scheduleAutoHide(long);
  },

  showError(message: SnackControllerState['message'], long = false) {
    state.message = message;
    state.variant = 'error';
    state.open = true;
    state.long = long;
    scheduleAutoHide(long);
  },

  showLoading(message: SnackControllerState['message'], long = false) {
    state.message = message;
    state.variant = 'loading';
    state.open = true;
    state.long = long;
    scheduleAutoHide(long);
  },

  showInternalError(error: Message) {
    const { debug } = OptionsController.state;

    if (debug) {
      state.message = error.shortMessage;
      state.variant = 'error';
      state.open = true;
      state.long = true;
      scheduleAutoHide(true);
    }

    if (error.longMessage) {
      // eslint-disable-next-line no-console
      console.error(error.longMessage);
    }
  },

  hide() {
    clearHideTimeout();
    state.open = false;
    state.long = false;
  }
};
