import { proxy, ref } from 'valtio/vanilla';
import { subscribeKey as subKey } from 'valtio/vanilla/utils';
import type {
  CustomWallet,
  Features,
  Metadata,
  ProjectId,
  SdkVersion,
  Tokens
} from '../utils/TypeUtil';
import { ConstantsUtil } from '../utils/ConstantsUtil';

// -- Types --------------------------------------------- //
export interface ClipboardClient {
  setString: (value: string) => Promise<void>;
}

export interface OptionsControllerStatePublic {
  /**
   * The project ID for the AppKit. You can find or create your project ID in the Cloud.
   * @see https://cloud.walletconnect.com/
   */
  projectId: ProjectId;
  _clipboardClient?: ClipboardClient;
  includeWalletIds?: string[];
  excludeWalletIds?: string[];
  featuredWalletIds?: string[];
  customWallets?: CustomWallet[];
  tokens?: Tokens;
  enableAnalytics?: boolean;
  /**
   * Set of fields that related to your project which will be used to populate the metadata of the modal.
   * @default {}
   */

  metadata?: Metadata;

  /**
   * Enable or disable the Coinbase wallet in your AppKit.
   * @default true
   */
  enableCoinbase?: boolean;

  features?: Features;
  /**
   * Enable or disable debug mode in your AppKit. This is useful if you want to see UI alerts when debugging.
   * @default true
   */
  debug?: boolean;
  /**
   * Allow users to switch to an unsupported chain.
   * @default false
   */
  allowUnsupportedChain?: boolean;
}

export interface OptionsControllerStateInternal {
  sdkType: 'appkit';
  sdkVersion: SdkVersion;
  isSiweEnabled?: boolean;
  isUniversalProvider?: boolean;
  hasMultipleAddresses?: boolean;
  useInjectedUniversalProvider?: boolean;
}

type StateKey = keyof OptionsControllerStatePublic | keyof OptionsControllerStateInternal;
export type OptionsControllerState = OptionsControllerStatePublic & OptionsControllerStateInternal;

// -- State --------------------------------------------- //
const state = proxy<OptionsControllerState>({
  projectId: '',
  sdkType: 'appkit',
  sdkVersion: 'react-native-wagmi-undefined',
  features: ConstantsUtil.DEFAULT_FEATURES,
  debug: false,
  allowUnsupportedChain: false
});

// -- Controller ---------------------------------------- //
export const OptionsController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: OptionsControllerState[K]) => void) {
    return subKey(state, key, callback);
  },

  setOptions(options: OptionsControllerState) {
    Object.assign(state, options);
  },

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

  setDebug(debug: OptionsControllerState['debug']) {
    state.debug = debug;
  },

  setHasMultipleAddresses(hasMultipleAddresses: OptionsControllerState['hasMultipleAddresses']) {
    state.hasMultipleAddresses = hasMultipleAddresses;
  },

  // setEnableWalletConnect(enableWalletConnect: OptionsControllerState['enableWalletConnect']) {
  //   state.enableWalletConnect = enableWalletConnect;
  // },

  isClipboardAvailable() {
    return !!state._clipboardClient;
  },

  setAllowUnsupportedChain(allowUnsupportedChain: OptionsControllerState['allowUnsupportedChain']) {
    state.allowUnsupportedChain = allowUnsupportedChain;
  },

  setUsingInjectedUniversalProvider(
    useInjectedUniversalProvider: OptionsControllerState['useInjectedUniversalProvider']
  ) {
    state.useInjectedUniversalProvider = useInjectedUniversalProvider;
  },

  copyToClipboard(value: string) {
    const client = state._clipboardClient;
    if (client) {
      client?.setString(value);
    }
  }
};
