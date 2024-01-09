import { proxy } from 'valtio';

// -- Types --------------------------------------------- //
export interface SnackControllerState {
  message: string;
  variant: 'error' | 'success';
  open: boolean;
}

// -- State --------------------------------------------- //
const state = proxy<SnackControllerState>({
  message: '',
  variant: 'success',
  open: false
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

  hide() {
    state.open = false;
  }
};
