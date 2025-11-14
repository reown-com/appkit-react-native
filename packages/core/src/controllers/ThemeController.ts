import { proxy, subscribe as sub } from 'valtio';
import type { ThemeMode, ThemeVariables } from '@reown/appkit-common-react-native';
import { derive } from 'derive-valtio';

// -- Types --------------------------------------------- //
export interface ThemeControllerState {
  systemThemeMode?: ThemeMode | null;
  defaultThemeMode?: ThemeMode | null;
  themeVariables: ThemeVariables;
}

// -- State --------------------------------------------- //
const baseState = proxy<ThemeControllerState>({
  systemThemeMode: undefined,
  defaultThemeMode: undefined,
  themeVariables: {}
});

// -- Derived State ------------------------------------- //
const derivedState = derive(
  {
    themeMode: (get): ThemeMode => {
      const snap = get(baseState);

      return snap.defaultThemeMode ?? snap.systemThemeMode ?? 'light';
    }
  },
  {
    proxy: baseState
  }
);

// -- Controller ---------------------------------------- //
export const ThemeController = {
  state: derivedState,

  subscribe(callback: (newState: ThemeControllerState) => void) {
    return sub(derivedState, () => callback(derivedState));
  },

  setSystemThemeMode(systemThemeMode?: ThemeControllerState['systemThemeMode']) {
    baseState.systemThemeMode = systemThemeMode ?? 'light';
  },

  setDefaultThemeMode(themeMode?: ThemeControllerState['defaultThemeMode']) {
    baseState.defaultThemeMode = themeMode;
  },

  setThemeVariables(themeVariables?: ThemeControllerState['themeVariables']) {
    if (!themeVariables) {
      baseState.themeVariables = {};

      return;
    }

    baseState.themeVariables = { ...baseState.themeVariables, ...themeVariables };
  }
};
