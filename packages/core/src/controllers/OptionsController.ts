import { proxy } from 'valtio';
import type { ProjectId, Tokens } from '../utils/TypeUtils';

// -- Types --------------------------------------------- //
export interface OptionsControllerState {
  projectId: ProjectId;
  includeWalletIds?: string[];
  excludeWalletIds?: string[];
  featuredWalletIds?: string[];
  tokens?: Tokens;
}

// -- State --------------------------------------------- //
const state = proxy<OptionsControllerState>({
  projectId: ''
});

// -- Controller ---------------------------------------- //
export const OptionsController = {
  state,

  setProjectId(projectId: OptionsControllerState['projectId']) {
    state.projectId = projectId;
  },

  setIncludeWalletIds(includeWalletIds: OptionsControllerState['includeWalletIds']) {
    state.includeWalletIds = includeWalletIds;
  },

  setExcludeWalletIds(excludeWalletIds: OptionsControllerState['excludeWalletIds']) {
    state.excludeWalletIds = excludeWalletIds;
  },

  setFeaturedWalletIds(featuredWalletIds: OptionsControllerState['featuredWalletIds']) {
    state.featuredWalletIds = featuredWalletIds;
  },

  setTokens(tokens: OptionsControllerState['tokens']) {
    state.tokens = tokens;
  }
};
