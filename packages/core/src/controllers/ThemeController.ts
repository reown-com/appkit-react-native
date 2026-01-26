import { proxy, subscribe as sub } from 'valtio';
import type { ThemeMode, ThemeVariables } from '@reown/appkit-common-react-native';

// -- Types --------------------------------------------- //
export interface ThemeControllerState {
  themeMode: ThemeMode;
  systemThemeMode?: ThemeMode;
  defaultThemeMode?: ThemeMode;
  themeVariables: ThemeVariables;
}

// -- State --------------------------------------------- //
const state = proxy({
  systemThemeMode: undefined as ThemeMode | undefined,
  defaultThemeMode: undefined as ThemeMode | undefined,
  themeVariables: {} as ThemeVariables,
  get themeMode(): ThemeMode {
    // eslint-disable-next-line valtio/avoid-this-in-proxy -- using `this` for sibling property access in getters is the recommended valtio pattern for computed properties
    return this.defaultThemeMode ?? this.systemThemeMode ?? 'light';
  }
});

// -- Controller ---------------------------------------- //
export const ThemeController = {
  state: state as ThemeControllerState,

  subscribe(callback: (newState: ThemeControllerState) => void) {
    return sub(state, () => callback(state));
  },

  setSystemThemeMode(systemThemeMode?: ThemeControllerState['systemThemeMode']) {
    state.systemThemeMode = systemThemeMode ?? 'light';
  },

  setDefaultThemeMode(themeMode?: ThemeControllerState['defaultThemeMode']) {
    state.defaultThemeMode = themeMode;
  },

  setThemeVariables(themeVariables?: ThemeControllerState['themeVariables']) {
    if (!themeVariables) {
      state.themeVariables = {};

      return;
    }

    state.themeVariables = { ...state.themeVariables, ...themeVariables };
  }
};
