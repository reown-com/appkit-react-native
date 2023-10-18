import { proxy, ref } from 'valtio';
import type { ProjectId, Tokens } from '../utils/TypeUtils';

// -- Types --------------------------------------------- //
export interface ClipboardClient {
  setString: (value: string) => Promise<void>;
}

export interface OptionsControllerState {
  projectId: ProjectId;
  _clipboardClient?: ClipboardClient;
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

  setClipboardClient(client: ClipboardClient) {
    state._clipboardClient = ref(client);
  },

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
  },

  isClipboardAvailable() {
    return !!state._clipboardClient;
  },

  copyToClipboard(value: string) {
    const client = state._clipboardClient;
    if (client) {
      client.setString(value);
    }
  }
};
