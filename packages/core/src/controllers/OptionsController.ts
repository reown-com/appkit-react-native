import { proxy, ref } from 'valtio';
import type {
  CustomWallet,
  Features,
  Metadata,
  ProjectId,
  SdkType,
  SdkVersion,
  Tokens
} from '../utils/TypeUtil';
import { ConstantsUtil } from '../utils/ConstantsUtil';

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
  sdkType: SdkType;
  sdkVersion: SdkVersion;
  metadata?: Metadata;
  isSiweEnabled?: boolean;
  features?: Features;
}

// -- State --------------------------------------------- //
const state = proxy<OptionsControllerState>({
  projectId: '',
  sdkType: 'appkit',
  sdkVersion: 'react-native-wagmi-undefined',
  features: ConstantsUtil.DEFAULT_FEATURES
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

  setFeatures(features: OptionsControllerState['features']) {
    state.features = { ...ConstantsUtil.DEFAULT_FEATURES, ...features };
  },

  isClipboardAvailable() {
    return !!state._clipboardClient;
  },

  copyToClipboard(value: string) {
    const client = state._clipboardClient;
    if (client) {
      client?.setString(value);
    }
  }
};
