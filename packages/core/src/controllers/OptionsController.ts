import { proxy, ref } from 'valtio';
import type { Tokens, Storage, Metadata } from '@reown/appkit-common-react-native';
import type { CustomWallet, Features, ProjectId, SdkType, SdkVersion } from '../utils/TypeUtil';

import { ConstantsUtil } from '../utils/ConstantsUtil';

// -- Types --------------------------------------------- //
export interface ClipboardClient {
  setString: (value: string) => Promise<void>;
}

export interface OptionsControllerState {
  projectId: ProjectId;
  clipboardClient?: ClipboardClient;
  storage?: Storage;
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
  isOnRampEnabled?: boolean;
  features?: Features;
  debug?: boolean;
}

// -- State --------------------------------------------- //
const state = proxy<OptionsControllerState>({
  projectId: '',
  sdkType: 'appkit',
  sdkVersion: 'react-native-wagmi-undefined',
  features: ConstantsUtil.DEFAULT_FEATURES,
  debug: false
});

// -- Controller ---------------------------------------- //
export const OptionsController = {
  state,

  setClipboardClient(client: ClipboardClient) {
    state.clipboardClient = ref(client);
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

  setDebug(debug: OptionsControllerState['debug']) {
    state.debug = debug;
  },

  setIsOnRampEnabled(isOnRampEnabled: OptionsControllerState['isOnRampEnabled']) {
    state.isOnRampEnabled = isOnRampEnabled;
  },

  setStorage(storage?: OptionsControllerState['storage']) {
    if (storage) {
      state.storage = ref(storage);
    }
  },

  isClipboardAvailable() {
    return !!state.clipboardClient;
  },

  copyToClipboard(value: string) {
    const client = state.clipboardClient;
    if (client) {
      client?.setString(value);
    }
  }
};
