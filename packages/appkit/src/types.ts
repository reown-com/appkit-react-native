import { type OptionsControllerState } from '@reown/appkit-core-react-native';
import {
  type Features,
  type UniversalProviderConfigOverride,
  type WalletConnector,
  type BlockchainAdapter,
  type Metadata,
  type Network,
  type Storage,
  type ThemeMode,
  type ThemeVariables,
  type Tokens
} from '@reown/appkit-common-react-native';

/**
 * Configuration interface for initializing the AppKit instance.
 * This interface defines all the required and optional parameters needed to set up
 * the AppKit with blockchain adapters, networks, storage, and various customization options.
 *
 * @see {@link https://docs.reown.com/appkit/react-native/core/options | AppKit Options Documentation}
 */
export interface AppKitConfig {
  /**
   * The WalletConnect project ID required for establishing connections.
   * This is obtained from the https://dashboard.reown.com/
   * @see {@link https://docs.reown.com/appkit/react-native/core/options#projectid | Project ID Documentation}
   */
  projectId: string;

  /**
   * Metadata information about your application.
   * This is displayed to users during the connection process.
   *
   * @see {@link https://docs.reown.com/appkit/react-native/core/options#metadata | Metadata Documentation}
   */
  metadata: Metadata;

  /**
   * Array of blockchain adapters that handle different blockchain networks.
   * Each adapter must implement the BlockchainAdapter interface and support
   * a specific chain namespace (eip155, solana, etc.).
   * @see {@link https://docs.reown.com/appkit/react-native/core/options#adapters | Adapters Documentation}
   * @example [new EthersAdapter(), new SolanaAdapter()]
   */
  adapters: BlockchainAdapter[];

  /**
   * Array of supported networks that your application can connect to.
   * Each network should have a corresponding adapter in the adapters array.
   * @see {@link https://docs.reown.com/appkit/react-native/core/options#networks | Networks Documentation}
   * @example [ethereum, polygon, solana]
   */
  networks: Network[];

  /**
   * Storage implementation for persisting connection state, preferences, and session data.
   * Must implement the Storage interface with async methods for data persistence.
   */
  storage: Storage;

  /**
   * Optional array of custom wallet connectors beyond the default WalletConnect connector.
   * Useful for adding support for specific wallets like Coinbase, Phantom, etc.
   * @example [new CoinbaseConnector(), new PhantomConnector()]
   */
  extraConnectors?: WalletConnector[];

  /**
   * Optional clipboard client for handling copy operations in different environments.
   * Useful for customizing how addresses and other data are copied to clipboard.
   *
   * @see {@link https://docs.reown.com/appkit/react-native/core/options#clipboardclient | Clipboard Client Documentation}
   */
  clipboardClient?: OptionsControllerState['clipboardClient'];

  /**
   * Optional array of wallet IDs to include in the wallet selection list.
   * If provided, only these wallets will be shown to users.
   *
   * @see {@link https://docs.reown.com/appkit/react-native/core/options#includewalletids | Include Wallet IDs Documentation}
   * @example ["1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369", "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0"]
   */
  includeWalletIds?: OptionsControllerState['includeWalletIds'];

  /**
   * Optional array of wallet IDs to exclude from the wallet selection list.
   * These wallets will not be shown to users even if they're available.
   *
   * @see {@link https://docs.reown.com/appkit/react-native/core/options#excludewalletids | Exclude Wallet IDs Documentation}
   * @example ["1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369", "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0"]
   */
  excludeWalletIds?: OptionsControllerState['excludeWalletIds'];

  /**
   * Optional array of wallet IDs to feature at the top of the wallet selection list.
   * These wallets will appear prominently for better user experience.
   *
   * @see {@link https://docs.reown.com/appkit/react-native/core/options#featuredwalletids | Featured Wallet IDs Documentation}
   * @example ["1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369", "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0"]
   */
  featuredWalletIds?: OptionsControllerState['featuredWalletIds'];

  /**
   * Optional array of custom wallet configurations.
   * Allows you to add custom wallets with specific metadata and behavior.
   *
   * @see {@link https://docs.reown.com/appkit/react-native/core/options#customwallets | Custom Wallets Documentation}
   */
  customWallets?: OptionsControllerState['customWallets'];

  /**
   * Optional token configurations for different networks.
   * Used for displaying token balances and information in the UI.
   * @see {@link https://docs.reown.com/appkit/react-native/core/options#tokens | Tokens Documentation}
   * @example { "eip155:1": { address: "0x..." } }
   */
  tokens?: Tokens;

  /**
   * Optional flag to enable analytics tracking.
   * When enabled, AppKit will send usage analytics events.
   *
   * @see {@link https://docs.reown.com/appkit/react-native/core/options#enableanalytics | Enable Analytics Documentation}
   * @default false
   */
  enableAnalytics?: OptionsControllerState['enableAnalytics'];

  /**
   * Optional flag to enable debug mode.
   * When enabled, additional logging and debugging information will be output.
   *
   * @see {@link https://docs.reown.com/appkit/react-native/core/options#debug | Debug Documentation}
   * @default false
   */
  debug?: OptionsControllerState['debug'];

  /**
   * Optional theme mode for the AppKit UI.
   * Controls whether the interface uses light or dark theme.
   * @default "dark"
   * @see {@link https://docs.reown.com/appkit/react-native/core/theming#thememode | Theme Mode Documentation}
   * @example "light" | "dark"
   */
  themeMode?: ThemeMode;

  /**
   * Optional theme variables for customizing the AppKit UI appearance.
   * Allows you to override default colors and styling.
   *
   * @see {@link https://docs.reown.com/appkit/react-native/core/theming#themevariables | Theme Variables Documentation}
   * @example { accent: "#3B82F6" }
   */
  themeVariables?: ThemeVariables;

  /**
   * Optional default network to use when no specific network is selected.
   * This network will be used as the initial active network.
   *
   * @see {@link https://docs.reown.com/appkit/react-native/core/options#defaultnetwork | Default Network Documentation}
   */
  defaultNetwork?: Network;

  /**
   * Optional features configuration to enable/disable specific AppKit functionality.
   * Controls which features are available in the UI and API.
   *
   * @see {@link https://docs.reown.com/appkit/react-native/core/options#features | Features Documentation}
   * @example { onramp: true, swap: false }
   */
  features?: Features;

  /**
   * Optional configuration override for the Universal Provider.
   * Allows customization of WalletConnect's Universal Provider behavior.
   */
  universalProviderConfigOverride?: UniversalProviderConfigOverride;
}
