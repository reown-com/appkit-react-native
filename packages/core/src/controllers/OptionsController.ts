import { proxy, ref } from 'valtio';
import type { CustomWallet, Metadata, ProjectId, SdkVersion, Tokens } from '../utils/TypeUtil';

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
  customWallets?: CustomWallet[];
  tokens?: Tokens;
  enableAnalytics?: boolean;
  sdkType: string;
  sdkVersion: SdkVersion;
  metadata?: Metadata;
  isSiweEnabled?: boolean;
}

// -- State --------------------------------------------- //
const state = proxy<OptionsControllerState>({
  projectId: '',
  sdkType: 'w3m',
  sdkVersion: 'react-native-wagmi-undefined'
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

  setCustomWallets(customWallets: OptionsControllerState['customWallets']) {
    state.customWallets = customWallets;
  },

  setEnableAnalytics(enableAnalytics: OptionsControllerState['enableAnalytics']) {
    state.enableAnalytics = enableAnalytics;
  },

  setSdkVersion(sdkVersion: OptionsControllerState['sdkVersion']) {
    state.sdkVersion = sdkVersion;
  },

  setMetadata(metadata: OptionsControllerState['metadata']) {
    state.metadata = metadata;
  },

  setIsSiweEnabled(isSiweEnabled: OptionsControllerState['isSiweEnabled']) {
    state.isSiweEnabled = isSiweEnabled;
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
