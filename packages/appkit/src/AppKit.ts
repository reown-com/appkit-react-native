import {
  AccountController,
  EventsController,
  ModalController,
  ConnectionsController,
  OptionsController,
  RouterController,
  TransactionsController,
  type Metadata,
  StorageUtil,
  type OptionsControllerState,
  ThemeController
} from '@reown/appkit-core-react-native';

import type {
  WalletConnector,
  BlockchainAdapter,
  ProposalNamespaces,
  New_ConnectorType,
  Namespaces,
  CaipNetworkId,
  AppKitNetwork,
  Provider,
  ThemeVariables,
  ThemeMode,
  WalletInfo
} from '@reown/appkit-common-react-native';

import { WalletConnectConnector } from './connectors/WalletConnectConnector';
import { WcHelpersUtil } from './utils/HelpersUtil';
import { NetworkUtil } from './utils/NetworkUtil';
import { SIWEController, type AppKitSIWEClient } from '@reown/appkit-siwe-react-native';
import type { OpenOptions } from './client';

interface AppKitConfig {
  projectId: string;
  metadata: Metadata;
  adapters: BlockchainAdapter[];
  networks: AppKitNetwork[];
  extraConnectors?: WalletConnector[];
  clipboardClient?: OptionsControllerState['clipboardClient'];
  includeWalletIds?: OptionsControllerState['includeWalletIds'];
  excludeWalletIds?: OptionsControllerState['excludeWalletIds'];
  featuredWalletIds?: OptionsControllerState['featuredWalletIds'];
  customWallets?: OptionsControllerState['customWallets'];
  tokens?: OptionsControllerState['tokens'];
  enableAnalytics?: OptionsControllerState['enableAnalytics'];
  debug?: OptionsControllerState['debug'];
  themeMode?: ThemeMode;
  themeVariables?: ThemeVariables;
  // features?: Features;
  siweConfig?: AppKitSIWEClient;
  // defaultChain?: NetworkControllerState['caipNetwork'];
  // chainImages?: Record<number, string>;
}

export class AppKit {
  private projectId: string;
  private metadata: Metadata;
  private adapters: BlockchainAdapter[];
  private networks: AppKitNetwork[];
  private namespaces: ProposalNamespaces; //TODO: check if its ok to use universal provider NamespaceConfig here
  private extraConnectors: WalletConnector[];

  constructor(config: AppKitConfig) {
    this.projectId = config.projectId;
    this.metadata = config.metadata;
    this.adapters = config.adapters;
    this.networks = NetworkUtil.formatNetworks(config.networks, this.projectId); //TODO: check this
    this.namespaces = WcHelpersUtil.createNamespaces(config.networks) as ProposalNamespaces;
    this.extraConnectors = config.extraConnectors || [];

    this.initControllers(config);
    this.initConnectors();
  }

  private async createConnector(type: New_ConnectorType): Promise<WalletConnector> {
    // Check if an extra connector was provided by the developer
    const CustomConnector = this.extraConnectors.find(
      connector => connector.constructor.name.toLowerCase() === type.toLowerCase()
    );

    if (CustomConnector) {
      return CustomConnector;
    }

    // Default to WalletConnectConnector if no custom connector matches
    return WalletConnectConnector.create({ projectId: this.projectId, metadata: this.metadata });
  }

  /**
   * Initializes connectors based on stored connection data.
   * This attempts to restore previous sessions.
   */
  private async initConnectors() {
    const connectedConnectors = await StorageUtil.getConnectedConnectors(); // Fetch stored connectors

    if (connectedConnectors.length > 0) {
      ModalController.setLoading(true);

      for (const connected of connectedConnectors) {
        try {
          const connector = await this.createConnector(connected.type);

          const namespaces = connector.getNamespaces();
          const walletInfo = connector.getWalletInfo();

          if (namespaces && Object.keys(namespaces).length > 0) {
            // Ensure namespaces is not empty
            // Setup adapters and subscribe to events
            const initializedAdapters = this._setupAdaptersAndSubscribe(
              connector,
              Object.keys(namespaces)
            );

            // If adapters were successfully initialized, store the connection details
            if (initializedAdapters.length > 0) {
              this._storeConnectionDetails(initializedAdapters, namespaces, walletInfo);
            }

            this.syncAccounts(initializedAdapters);

            AccountController.setIsConnected(true);
          }
        } catch (error) {
          // Use console.warn for non-critical initialization failures
          console.warn(`Failed to initialize connector type ${connected.type}:`, error);
          await StorageUtil.removeConnectedConnectors(connected.type);
        }
      }
      ModalController.setLoading(false);
    }
  }

  /**
   * Sets up blockchain adapters for a given connector and namespaces,
   * subscribes to adapter events.
   * @param connector - The WalletConnector instance.
   * @param namespaces - The namespaces to find adapters for.
   * @returns The array of BlockchainAdapter instances that were set up.
   */
  private _setupAdaptersAndSubscribe(
    connector: WalletConnector,
    namespaces: string[]
  ): BlockchainAdapter[] {
    const adapters = this.adapters.filter(adapter =>
      namespaces.includes(adapter.getSupportedNamespace())
    );

    if (adapters.length === 0) {
      // Log or handle cases where no adapters match
      console.warn(`No compatible adapters found for namespaces: ${namespaces.join(', ')}`);

      return [];
    }

    adapters.forEach(adapter => {
      adapter.setConnector(connector);
      this.subscribeToAdapterEvents(adapter);
    });

    return adapters;
  }

  /**
   * Handles the full connection flow for a given connector type.
   * @param type - The type of connector to use.
   * @param requestedNamespaces - Optional specific namespaces to request.
   */
  async connect(type: New_ConnectorType, requestedNamespaces?: ProposalNamespaces): Promise<void> {
    try {
      const connector = await this.createConnector(type);

      const approvedNamespaces = await connector.connect(requestedNamespaces ?? this.namespaces);
      const walletInfo = connector.getWalletInfo();

      if (!approvedNamespaces || Object.keys(approvedNamespaces).length === 0) {
        throw new Error('Connection cancelled or failed: No approved namespaces returned.');
      }

      // Setup adapters and subscribe to adapter events
      const approvedAdapters = this._setupAdaptersAndSubscribe(
        connector,
        Object.keys(approvedNamespaces)
      );

      // Check if any compatible adapters were found for the *approved* namespaces
      if (approvedAdapters.length === 0) {
        //TODO: handle case where devs want to connect to a namespace that has no adapters. Could use the provider directly.
        throw new Error('No compatible adapters found for the approved namespaces');
      }

      // Store the connection details for the successfully connected adapters
      this._storeConnectionDetails(approvedAdapters, approvedNamespaces, walletInfo);

      // Store connector type and namespaces in storage
      await StorageUtil.setConnectedConnectors({
        type: connector.type,
        namespaces: Object.keys(approvedNamespaces)
      });

      this.syncAccounts(approvedAdapters);

      // Set connected state (consider if this should be more nuanced for multi-connections)
      AccountController.setIsConnected(true);

      // No longer need to unsubscribe as we only subscribe to approved ones
    } catch (error) {
      // Log connection errors
      console.warn('Connection failed:', error); // Using warn for potentially recoverable errors
      // Rethrow or handle the error appropriately for the UI
      throw error;
    }
  }

  private async syncAccounts(adapters: BlockchainAdapter[]) {
    // Get account balances
    adapters.map(adapter => {
      const namespace = adapter.getSupportedNamespace();
      const connection = ConnectionsController.state.connections[namespace];

      const network = this.networks.find(
        n => n.id?.toString() === connection?.activeChain?.split(':')[1]
      );

      adapter.getBalance({ address: adapter.getAccounts()?.[0], network });
    });
  }

  /**
   * Stores connection details in the ConnectionsController.
   * @param adapters - The adapters for which to store the connection.
   * @param approvedNamespaces - The map of approved namespaces and their details.
   */
  private _storeConnectionDetails(
    adapters: BlockchainAdapter[],
    approvedNamespaces: Namespaces,
    wallet?: WalletInfo
  ) {
    adapters.forEach(async adapter => {
      const namespace = adapter.getSupportedNamespace();
      const namespaceDetails = approvedNamespaces[namespace];
      if (!namespaceDetails) return; // Should not happen if filtering is correct

      const accounts = namespaceDetails.accounts ?? [];
      const chains = namespaceDetails.chains ?? [];

      ConnectionsController.storeConnection({
        namespace,
        adapter,
        accounts,
        chains,
        wallet
      });
    });

    // Set the first connected adapter's namespace as active
    if (adapters.length > 0 && adapters[0]) {
      ConnectionsController.setActiveNamespace(adapters[0].getSupportedNamespace());
    }
  }

  private subscribeToAdapterEvents(adapter: BlockchainAdapter): void {
    adapter.on('accountsChanged', ({ accounts, namespace }) => {
      console.log('accountsChanged', accounts, namespace);
      //TODO: do i need this?
    });

    adapter.on('chainChanged', ({ chainId, namespace }) => {
      const chain = `${namespace}:${chainId}` as CaipNetworkId;
      ConnectionsController.setActiveChain(namespace, chain);
    });

    adapter.on('disconnect', ({ namespace }) => {
      this.disconnect(namespace, false);
    });

    adapter.on('balanceChanged', ({ namespace, address, balance }) => {
      ConnectionsController.updateBalance(namespace, address, balance);
    });
  }

  private async initControllers(options: AppKitConfig) {
    OptionsController.setProjectId(options.projectId);
    OptionsController.setMetadata(options.metadata);
    OptionsController.setIncludeWalletIds(options.includeWalletIds);
    OptionsController.setExcludeWalletIds(options.excludeWalletIds);
    OptionsController.setFeaturedWalletIds(options.featuredWalletIds);
    OptionsController.setTokens(options.tokens);
    OptionsController.setCustomWallets(options.customWallets);
    OptionsController.setEnableAnalytics(options.enableAnalytics);
    OptionsController.setDebug(options.debug);
    // OptionsController.setFeatures(options.features);

    ThemeController.setThemeMode(options.themeMode);
    ThemeController.setThemeVariables(options.themeVariables);

    //TODO: function to get sdk version based on adapters
    // OptionsController.setSdkVersion(options._sdkVersion);

    if (options.clipboardClient) {
      OptionsController.setClipboardClient(options.clipboardClient);
    }

    ConnectionsController.setNetworks(options.networks);

    if (options.siweConfig) {
      SIWEController.setSIWEClient(options.siweConfig);
    }

    // if (
    //   (options.features?.onramp === true || options.features?.onramp === undefined) &&
    //   (options.metadata?.redirect?.universal || options.metadata?.redirect?.native)
    // ) {
    //   OptionsController.setIsOnRampEnabled(true);
    // }
  }

  async disconnect(namespace?: string, isInternal?: boolean): Promise<void> {
    try {
      const connection =
        ConnectionsController.state.connections[
          namespace ?? ConnectionsController.state.activeNamespace
        ];
      const connectorType = connection?.adapter?.connector?.type;

      await ConnectionsController.disconnect(
        namespace ?? ConnectionsController.state.activeNamespace,
        isInternal
      );

      if (connectorType) {
        await StorageUtil.removeConnectedConnectors(connectorType);
      }

      ModalController.close();
      // Resetting states after successful disconnect logic
      AccountController.setIsConnected(false); // Might need adjustment based on multi-connection logic
      RouterController.reset('Connect');
      TransactionsController.resetTransactions();
      EventsController.sendEvent({
        type: 'track',
        event: 'DISCONNECT_SUCCESS'
      });
    } catch (error) {
      // Use console.warn for disconnect errors as they might not be critical app failures
      console.warn('Disconnect failed:', error); // Keep error log for disconnect issues
      EventsController.sendEvent({
        type: 'track',
        event: 'DISCONNECT_ERROR'
      });
      // Do not rethrow? Or handle differently?
    }
  }

  getProvider<T extends Provider>(namespace?: string): T | null {
    const activeNamespace = namespace ?? ConnectionsController.state.activeNamespace;
    if (!activeNamespace) return null;

    const connection = ConnectionsController.state.connections[activeNamespace];
    if (!connection || !connection.adapter || !connection.adapter.connector) return null;

    return connection.adapter.connector.getProvider() as T;
  }

  private getAdapterByNamespace(namespace: string = 'eip155'): BlockchainAdapter | null {
    const namespaceConnection = ConnectionsController.state.connections[namespace];

    return namespaceConnection?.adapter ?? null;
  }

  async switchNetwork(network: AppKitNetwork): Promise<void> {
    const adapter = this.getAdapterByNamespace(network.chainNamespace);
    if (!adapter) throw new Error('No active adapter');

    await adapter.switchNetwork(network);

    EventsController.sendEvent({
      type: 'track',
      event: 'SWITCH_NETWORK',
      properties: {
        network: network.id
      }
    });

    ConnectionsController.setActiveChain(
      adapter.getSupportedNamespace(),
      `${adapter.getSupportedNamespace()}:${network.id}` as CaipNetworkId
    );

    if (ConnectionsController.state.activeNamespace !== (network.chainNamespace ?? 'eip155')) {
      ConnectionsController.setActiveNamespace(network.chainNamespace ?? 'eip155');
    }

    adapter.getBalance({ network });
  }

  open(options?: OpenOptions) {
    ModalController.open(options);
  }

  close() {
    ModalController.close();
  }
}

export function createAppKit(config: AppKitConfig): AppKit {
  return new AppKit(config);
}
