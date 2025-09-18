import { proxy, ref } from 'valtio';
import type {
  Storage,
  Metadata,
  AppKitNetwork,
  CustomWallet,
  Features,
  ProjectId,
  SdkType,
  SdkVersion,
  SIWXConfig
} from '@reown/appkit-common-react-native';

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
  enableAnalytics?: boolean;
  sdkType: SdkType;
  sdkVersion: SdkVersion;
  metadata?: Metadata;
  isSiweEnabled?: boolean;
  siwx?: SIWXConfig;
  isOnRampEnabled?: boolean;
  features?: Features;
  debug?: boolean;
  defaultNetwork?: AppKitNetwork;
  requestedNetworks?: AppKitNetwork[];
}

// -- State --------------------------------------------- //
const state = proxy<OptionsControllerState>({
  projectId: '',
  sdkType: 'appkit',
  sdkVersion: 'react-native-undefined-undefined',
  features: ConstantsUtil.DEFAULT_FEATURES,
  customWallets: [],
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

  setDefaultNetwork(defaultNetwork?: OptionsControllerState['defaultNetwork']) {
    state.defaultNetwork = defaultNetwork;
  },

  setRequestedNetworks(requestedNetworks?: OptionsControllerState['requestedNetworks']) {
    state.requestedNetworks = requestedNetworks;
  },

  setSiwx(siwx?: OptionsControllerState['siwx']) {
    //TODO: Add default values
    state.siwx = siwx;
  },

  isClipboardAvailable() {
    return !!state.clipboardClient;
  },

  getStorage() {
    if (!state.storage) {
      throw new Error('AppKit: Storage is not set');
    }

    return state.storage;
  },

  copyToClipboard(value: string) {
    const client = state.clipboardClient;
    if (client) {
      client?.setString(value);
    }
  }
};
