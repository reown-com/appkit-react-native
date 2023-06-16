import { proxy } from 'valtio';

import type { ConfigCtrlState } from '../types/controllerTypes';

// -- initial state ------------------------------------------------ //
const state = proxy<ConfigCtrlState>({
  projectId: '',
  recentWalletDeepLink: undefined,
  metadata: undefined,
  apiVersion: undefined,
});

// -- controller --------------------------------------------------- //
export const ConfigCtrl = {
  state,

  setProjectId(projectId: ConfigCtrlState['projectId']) {
    if (projectId !== state.projectId) {
      state.projectId = projectId;
    }
  },

  setMetadata(metadata: ConfigCtrlState['metadata']) {
    if (metadata && state.metadata !== metadata) {
      state.metadata = metadata;
    }
  },

  setRecentWalletDeepLink(deepLink?: string) {
    state.recentWalletDeepLink = deepLink;
  },

  setApiVersion(apiVersion: ConfigCtrlState['apiVersion']) {
    if (apiVersion !== state.apiVersion) {
      state.apiVersion = apiVersion;
    }
  },

  getRecentWalletDeepLink() {
    return state.recentWalletDeepLink;
  },

  getMetadata() {
    if (!state.metadata) {
      throw new Error('Metadata not set');
    }
    return state.metadata;
  },

  resetConfig() {
    state.recentWalletDeepLink = undefined;
  },
};
