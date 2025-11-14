import { Appearance } from 'react-native';
import { proxy, subscribe as sub } from 'valtio';
import type { ThemeMode, ThemeVariables } from '@reown/appkit-common-react-native';

const systemThemeMode = Appearance.getColorScheme() as ThemeMode;

// -- Types --------------------------------------------- //
export interface ThemeControllerState {
  themeMode: ThemeMode;
  defaultThemeMode?: ThemeMode;
  themeVariables: ThemeVariables;
}

// -- State --------------------------------------------- //
const state = proxy<ThemeControllerState>({
  themeMode: systemThemeMode,
  defaultThemeMode: undefined,
  themeVariables: {}
});

// -- Controller ---------------------------------------- //
export const ThemeController = {
  state,

  subscribe(callback: (newState: ThemeControllerState) => void) {
    return sub(state, () => callback(state));
  },

  setThemeMode(themeMode?: ThemeControllerState['themeMode']) {
    if (!themeMode) {
      state.themeMode = Appearance.getColorScheme() as ThemeMode;
    } else {
      state.themeMode = themeMode;
    }
  },

  setDefaultThemeMode(themeMode?: ThemeControllerState['defaultThemeMode']) {
    const _systemThemeMode = Appearance.getColorScheme() as ThemeMode;
    state.defaultThemeMode = themeMode ?? _systemThemeMode;
    this.setThemeMode(themeMode ?? _systemThemeMode);
  },

  setThemeVariables(themeVariables?: ThemeControllerState['themeVariables']) {
    if (!themeVariables) {
      state.themeVariables = {};

      return;
    }

    state.themeVariables = { ...state.themeVariables, ...themeVariables };
  }
};
