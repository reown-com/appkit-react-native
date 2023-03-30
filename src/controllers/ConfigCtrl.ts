import { Appearance } from 'react-native';
import { proxy, subscribe as valtioSub } from 'valtio/vanilla';
import type { ConfigCtrlState } from '../types/controllerTypes';
import { OptionsCtrl } from './OptionsCtrl';

// -- initial state ------------------------------------------------ //
function isDarkMode() {
  const colorScheme = Appearance.getColorScheme();
  return colorScheme === 'dark';
}

const state = proxy<ConfigCtrlState>({
  projectId: '',
  themeMode: isDarkMode() ? 'dark' : 'light',
});

// -- controller --------------------------------------------------- //
export const ConfigCtrl = {
  state,

  subscribe(callback: (newState: ConfigCtrlState) => void) {
    return valtioSub(state, () => callback(state));
  },

  setConfig(config: ConfigCtrlState) {
    OptionsCtrl.setWalletConnectVersion(config.walletConnectVersion ?? 2);

    Object.assign(state, config);
  },
};
