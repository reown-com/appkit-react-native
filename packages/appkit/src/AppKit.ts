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
  ThemeController,
  ConnectionController
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
  WalletInfo,
  Network,
  ChainNamespace
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
  networks: Network[];
  extraConnectors?: WalletConnector[];
  clipboardClient?: OptionsControllerState['clipboardClient'];
  includeWalletIds?: OptionsControllerState['includeWalletIds'];
  excludeWalletIds?: OptionsControllerState['excludeWalletIds'];
  featuredWalletIds?: OptionsControllerState['featuredWalletIds'];
  customWallets?: OptionsControllerState['customWallets'];
  tokens?: OptionsControllerState['tokens']; //TODO: check if needed in OptionsController
  enableAnalytics?: OptionsControllerState['enableAnalytics'];
  debug?: OptionsControllerState['debug'];
  themeMode?: ThemeMode;
  themeVariables?: ThemeVariables;
  siweConfig?: AppKitSIWEClient;
  defaultChain?: Network;
  // features?: Features;
  // chainImages?: Record<number, string>; //TODO: rename to networkImages
}

export class AppKit {
  private projectId: string;
  private metadata: Metadata;
  private adapters: BlockchainAdapter[];
  private networks: AppKitNetwork[];
  private defaultChain?: AppKitNetwork;
  private namespaces: ProposalNamespaces;
  private config: AppKitConfig;
  private extraConnectors: WalletConnector[];

  constructor(config: AppKitConfig) {
    this.projectId = config.projectId;
    this.metadata = config.metadata;
    this.adapters = config.adapters;
    this.networks = NetworkUtil.formatNetworks(config.networks, this.projectId); //TODO: check this
    this.defaultChain = config.defaultChain
      ? NetworkUtil.formatNetwork(config.defaultChain, this.projectId)
      : undefined;
    this.namespaces = WcHelpersUtil.createNamespaces(this.networks) as ProposalNamespaces;
    this.config = config;
    this.extraConnectors = config.extraConnectors || [];

    this.initControllers(config);
    this.initConnectors();
  }

  /**
   * Handles the full connection flow for a given connector type.
   * @param type - The type of connector to use.
   * @param requestedNamespaces - Optional specific namespaces to request.
   */
  async connect(type: New_ConnectorType, requestedNamespaces?: ProposalNamespaces): Promise<void> {
    try {
      const connector = await this.createConnector(type);
      const defaultChain = this.defaultChain
        ? NetworkUtil.getDefaultChainId(this.defaultChain)
        : undefined;

      const approvedNamespaces = await connector.connect({
        namespaces: requestedNamespaces ?? this.namespaces,
        defaultChain
      });

      const walletInfo = connector.getWalletInfo();

      if (!approvedNamespaces || Object.keys(approvedNamespaces).length === 0) {
        throw new Error('Connection cancelled or failed: No approved namespaces returned.');
      }

      // Setup adapters and subscribe to adapter events
      const approvedAdapters = this.setupAdaptersAndSubscribe(
        connector,
        Object.keys(approvedNamespaces)
      );

      // Check if any compatible adapters were found for the *approved* namespaces
      if (approvedAdapters.length === 0) {
        //TODO: handle case where devs want to connect to a namespace that has no adapters. Could use the provider directly.
        throw new Error('No compatible adapters found for the approved namespaces');
      }

      // Store the connection details for the successfully connected adapters
      this.storeConnectionDetails(approvedAdapters, approvedNamespaces, walletInfo);

      // Store connector type and namespaces in storage
      await StorageUtil.setConnectedConnectors({
        type: connector.type,
        namespaces: Object.keys(approvedNamespaces)
      });

      this.syncAccounts(approvedAdapters);

      //TODO: Replace this
      AccountController.setIsConnected(true);
    } catch (error) {
      console.warn('Connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnects from a given namespace.
   * @param namespace - The namespace to disconnect from.
   * @param isInternal - Whether the disconnect is internal (i.e. from the AppKit) or external (i.e. from wallet side).
   */
  async disconnect(namespace?: string, isInternal?: boolean): Promise<void> {
    try {
      const activeNamespace = namespace ?? ConnectionsController.state.activeNamespace;

      if (!activeNamespace) {
        return;
      }

      const connection = ConnectionsController.state.connections[activeNamespace];
      const connectorType = connection?.adapter?.connector?.type;

      await ConnectionsController.disconnect(activeNamespace, isInternal);

      if (connectorType) {
        await StorageUtil.removeConnectedConnectors(connectorType);
      }

      ModalController.close();

      AccountController.setIsConnected(false); // Might need adjustment based on multi-connection logic
      RouterController.reset('Connect');
      TransactionsController.resetTransactions();
      ConnectionController.disconnect();

      EventsController.sendEvent({
        type: 'track',
        event: 'DISCONNECT_SUCCESS'
      });
    } catch (error) {
      EventsController.sendEvent({
        type: 'track',
        event: 'DISCONNECT_ERROR'
      });
    }
  }

  /**
   * Returns the provider for a given namespace.
   * @param namespace - The namespace to get the provider for.
   * @returns The provider for the given namespace.
   */
  getProvider<T extends Provider>(namespace?: string): T | null {
    const activeNamespace = namespace ?? ConnectionsController.state.activeNamespace;
    if (!activeNamespace) return null;

    const connection = ConnectionsController.state.connections[activeNamespace];
    if (!connection || !connection.adapter || !connection.adapter.connector) return null;

    return connection.adapter.connector.getProvider() as T;
  }

  getNetworks() {
    return this.networks;
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

    if (ConnectionsController.state.activeNamespace !== network.chainNamespace) {
      ConnectionsController.setActiveNamespace(network.chainNamespace);
    }
  }

  open(options?: OpenOptions) {
    ModalController.open(options);
  }

  close() {
    ModalController.close();
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

  //TODO: reuse logic with connect method
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
            const initializedAdapters = this.setupAdaptersAndSubscribe(
              connector,
              Object.keys(namespaces)
            );

            // If adapters were successfully initialized, store the connection details
            if (initializedAdapters.length > 0) {
              this.storeConnectionDetails(initializedAdapters, namespaces, walletInfo);
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

  private setupAdaptersAndSubscribe(
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

  private getAdapterByNamespace(namespace: ChainNamespace): BlockchainAdapter | null {
    const namespaceConnection = ConnectionsController.state.connections[namespace];

    return namespaceConnection?.adapter ?? null;
  }

  private async syncAccounts(adapters: BlockchainAdapter[]) {
    // Get account balances
    adapters.map(adapter => {
      const namespace = adapter.getSupportedNamespace();
      const connection = ConnectionsController.state.connections[namespace];

      if (!connection) return;

      const network = this.networks.find(
        n => n.id?.toString() === connection?.activeChain?.split(':')[1]
      );

      const address =
        adapter.getAccounts()?.find(a => a.startsWith(connection?.activeChain)) ??
        adapter.getAccounts()?.[0];

      adapter.getBalance({ address, network, tokens: this.config.tokens });
    });
  }

  private storeConnectionDetails(
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
      const activeChain = adapter?.connector?.getChainId(namespace);

      ConnectionsController.storeConnection({
        namespace,
        adapter,
        accounts,
        chains,
        activeChain,
        wallet
      });
    });

    const updateActiveNamespace = !Object.keys(approvedNamespaces).find(
      n => n === ConnectionsController.state.activeNamespace
    );

    // If the active namespace is not in the approved namespaces or is undefined, set the first connected adapter's namespace as active
    if (updateActiveNamespace && adapters[0]) {
      ConnectionsController.setActiveNamespace(adapters[0].getSupportedNamespace());
    }
  }

  private subscribeToAdapterEvents(adapter: BlockchainAdapter): void {
    adapter.on('accountsChanged', ({ accounts, namespace }) => {
      //eslint-disable-next-line no-console
      console.log('accountsChanged', accounts, namespace);
      //TODO: check this
    });

    adapter.on('chainChanged', ({ chainId, namespace }) => {
      const chain = `${namespace}:${chainId}` as CaipNetworkId;
      ConnectionsController.setActiveChain(namespace, chain);

      const network = this.networks.find(n => n.id?.toString() === chainId);
      if (network) {
        adapter.getBalance({
          network,
          tokens: this.config.tokens
        });
      }
    });

    adapter.on('disconnect', ({ namespace }) => {
      // console.log('AppKit disconnect namespace', namespace);
      this.disconnect(namespace, false);
    });

    adapter.on('balanceChanged', ({ namespace, address, balance }) => {
      ConnectionsController.updateBalance(namespace, address, balance);
    });
  }

  private async initControllers(options: AppKitConfig) {
    await this.initAsyncValues();

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

    ConnectionsController.setNetworks(this.networks);

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

  private async initAsyncValues() {
    const activeNamespace = await StorageUtil.getActiveNamespace();
    if (activeNamespace) {
      ConnectionsController.setActiveNamespace(activeNamespace);
    } else if (this.defaultChain) {
      ConnectionsController.setActiveNamespace(this.defaultChain?.chainNamespace);
    }
  }
}

export function createAppKit(config: AppKitConfig): AppKit {
  return new AppKit(config);
}
