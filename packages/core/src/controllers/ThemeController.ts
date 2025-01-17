import { proxy, subscribe as sub } from 'valtio';
import type { ThemeMode, ThemeVariables } from '@reown/appkit-common-react-native';

// -- Types --------------------------------------------- //
export interface ThemeControllerState {
  themeMode?: ThemeMode;
  themeVariables: ThemeVariables;
}

// -- State --------------------------------------------- //
const state = proxy<ThemeControllerState>({
  themeMode: undefined,
  themeVariables: {}
});

// -- Controller ---------------------------------------- //
export const ThemeController = {
  state,

  subscribe(callback: (newState: ThemeControllerState) => void) {
    return sub(state, () => callback(state));
  },

  setThemeMode(themeMode: ThemeControllerState['themeMode']) {
    state.themeMode = themeMode;
  },

  setThemeVariables(themeVariables: ThemeControllerState['themeVariables']) {
    state.themeVariables = { ...state.themeVariables, ...themeVariables };
  }
};
