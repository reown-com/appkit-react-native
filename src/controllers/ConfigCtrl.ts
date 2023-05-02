import { Appearance } from 'react-native';
import { proxy } from 'valtio';

import type { ConfigCtrlState } from '../types/controllerTypes';

// -- initial state ------------------------------------------------ //
function isDarkMode() {
  const colorScheme = Appearance.getColorScheme();
  return colorScheme === 'dark';
}

const state = proxy<ConfigCtrlState>({
  projectId: '',
  recentWalletDeepLink: undefined,
  themeMode: isDarkMode() ? 'dark' : 'light',
});

// -- controller --------------------------------------------------- //
export const ConfigCtrl = {
  state,

  setConfig(config: ConfigCtrlState) {
    Object.assign(state, config);
  },

  setThemeMode(themeMode: 'dark' | 'light') {
    state.themeMode = themeMode;
  },

  setRecentWalletDeepLink(deepLink?: string) {
    state.recentWalletDeepLink = deepLink;
  },

  getRecentWalletDeepLink() {
    return state.recentWalletDeepLink;
  },

  resetConfig() {
    state.recentWalletDeepLink = undefined;
  },
};
