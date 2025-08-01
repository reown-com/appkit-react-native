import {
  type Features,
  EventsController,
  ModalController,
  ConnectionsController,
  OptionsController,
  RouterController,
  TransactionsController,
  StorageUtil,
  type OptionsControllerState,
  ThemeController,
  ConnectionController,
  SwapController,
  OnRampController,
  CoreHelperUtil,
  SendController,
  BlockchainApiController
} from '@reown/appkit-core-react-native';

import {
  type WalletConnector,
  type BlockchainAdapter,
  type ProposalNamespaces,
  type ConnectorType,
  type Namespaces,
  type Metadata,
  type CaipNetworkId,
  type AppKitNetwork,
  type Provider,
  type ThemeVariables,
  type ThemeMode,
  type WalletInfo,
  type Network,
  type ChainNamespace,
  type Storage,
  type AppKitConnectOptions,
  type AppKitSIWEClient,
  type ConnectionProperties,
  type AccountType,
  type AppKitOpenOptions,
  ConstantsUtil,
  type Connection,
  type Tokens
} from '@reown/appkit-common-react-native';
import { SIWEController } from '@reown/appkit-siwe-react-native';

import { WalletConnectConnector } from './connectors/WalletConnectConnector';
import { WcHelpersUtil } from './utils/HelpersUtil';
import { NetworkUtil } from './utils/NetworkUtil';
import { RouterUtil } from './utils/RouterUtil';

interface AppKitConfig {
  projectId: string;
  metadata: Metadata;
  adapters: BlockchainAdapter[];
  networks: Network[];
  storage: Storage;
  extraConnectors?: WalletConnector[];
  clipboardClient?: OptionsControllerState['clipboardClient'];
  includeWalletIds?: OptionsControllerState['includeWalletIds'];
  excludeWalletIds?: OptionsControllerState['excludeWalletIds'];
  featuredWalletIds?: OptionsControllerState['featuredWalletIds'];
  customWallets?: OptionsControllerState['customWallets'];
  tokens?: Tokens;
  enableAnalytics?: OptionsControllerState['enableAnalytics'];
  debug?: OptionsControllerState['debug'];
  themeMode?: ThemeMode;
  themeVariables?: ThemeVariables;
  siweConfig?: AppKitSIWEClient;
  defaultNetwork?: Network;
  features?: Features;
  // chainImages?: Record<number, string>; //TODO: rename to networkImages
}

export class AppKit {
  private projectId: string;
  private adapters: BlockchainAdapter[];
  private networks: AppKitNetwork[];
  private namespaces: ProposalNamespaces;
  private config: AppKitConfig;
  private extraConnectors: WalletConnector[];
  private walletConnectConnector?: WalletConnector;

  constructor(config: AppKitConfig) {
    this.projectId = config.projectId;
    this.adapters = config.adapters ?? [];

    // Validate adapters to ensure no duplicate chainNamespaces
    const namespaceMap = new Map<ChainNamespace, string>();
    for (const adapter of this.adapters) {
      const chainNamespace = adapter.supportedNamespace;
      const adapterName = adapter.constructor.name;
      if (namespaceMap.has(chainNamespace)) {
        throw new Error(
          `Duplicate adapter for namespace '${chainNamespace}'. Adapter "${adapterName}" conflicts with adapter "${namespaceMap.get(
            chainNamespace
          )}". Please provide only one adapter per chain namespace.`
        );
      }
      namespaceMap.set(chainNamespace, adapterName);
    }

    const formattedNetworks = NetworkUtil.formatNetworks(config.networks, this.projectId);

    // Use only networks that have adapters
    const networksWithAdapters = formattedNetworks.filter(network => {
      return this.adapters.some(
        adapter => adapter.getSupportedNamespace() === network.chainNamespace
      );
    });

    config.networks.forEach(network => {
      if (!networksWithAdapters.some(n => n.id === network.id)) {
        console.warn(`AppKit: missing adapter for network ${network.name} - ${network.id}`);
      }
    });

    this.networks = networksWithAdapters;
    this.namespaces = WcHelpersUtil.createNamespaces(this.networks) as ProposalNamespaces;
    this.config = config;
    this.extraConnectors = config.extraConnectors || [];

    this.initControllers(config);
    this.initConnectors();
  }

  /**
   * Handles the full connection flow for a given connector type.
   * @param type - The type of connector to use.
   * @param options - Optional connection options.
   */
  async connect(type: ConnectorType, options?: AppKitConnectOptions): Promise<void> {
    try {
      const { namespaces, defaultChain, universalLink } = options ?? {};
      const connector = await this.createConnector(type);

      const chain =
        defaultChain ??
        NetworkUtil.getDefaultChainId(this.namespaces, OptionsController.state.defaultNetwork);

      const approvedNamespaces = await connector.connect({
        namespaces: namespaces ?? this.namespaces,
        defaultChain: chain,
        universalLink,
        siweConfig: this.config?.siweConfig
      });

      const walletInfo = connector.getWalletInfo();
      const properties = connector.getProperties();

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
      this.setConnection(approvedAdapters, approvedNamespaces, walletInfo, properties);

      // Store connector type and namespaces in storage
      await StorageUtil.setConnectedConnectors({
        type: connector.type,
        namespaces: Object.keys(approvedNamespaces)
      });

      this.syncAccounts(approvedAdapters);

      if (
        OptionsController.state.isSiweEnabled &&
        ConnectionsController.state.activeNamespace === 'eip155'
      ) {
        this.handleSiweChange({ isConnection: true });
      } else {
        ModalController.close();
      }
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

      const connection = ConnectionsController.state.connections.get(
        activeNamespace as ChainNamespace
      );
      const connectorType = connection?.adapter?.connector?.type;

      await ConnectionsController.disconnect(activeNamespace as ChainNamespace, isInternal);

      if (connectorType) {
        await StorageUtil.removeConnectedConnectors(connectorType);
      }

      ModalController.close();

      RouterController.reset('Connect');
      TransactionsController.resetState();
      SwapController.resetState();
      SendController.resetState();
      OnRampController.resetState();
      ConnectionController.disconnect();

      if (ConnectionsController.state.activeNamespace === undefined) {
        ConnectionsController.setActiveNamespace(
          OptionsController.state.defaultNetwork?.chainNamespace
        );
      }

      if (OptionsController.state.isSiweEnabled) {
        await SIWEController.signOut();
      }

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

    const connection = ConnectionsController.state.connections.get(
      activeNamespace as ChainNamespace
    );
    if (!connection || !connection.adapter || !connection.adapter.connector) return null;

    return connection.adapter.connector.getProvider() as T;
  }

  getNetworks() {
    return this.networks;
  }

  async switchNetwork(network: AppKitNetwork): Promise<void> {
    const { isConnected } = ConnectionsController.state;

    if (!isConnected) {
      OptionsController.setDefaultNetwork(network);

      return Promise.resolve();
    }

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

    ConnectionsController.setActiveNetwork(network.chainNamespace, network.caipNetworkId);

    if (ConnectionsController.state.activeNamespace !== network.chainNamespace) {
      ConnectionsController.setActiveNamespace(network.chainNamespace);
    }
  }

  open(options?: AppKitOpenOptions) {
    ModalController.open(options);
  }

  async close() {
    ModalController.close();

    if (OptionsController.state.isSiweEnabled && ConnectionsController.state.isConnected) {
      const session = await SIWEController.getSession();
      if (
        !session &&
        SIWEController.state.status !== 'success' &&
        ConnectionsController.state.activeNamespace === 'eip155' &&
        !!ConnectionsController.state.activeAddress
      ) {
        await this.disconnect();
      }
    }

    RouterUtil.checkOnRampBack();
    RouterUtil.checkSocialLoginBack();
  }

  back() {
    if (RouterController.state.history.length > 1) {
      RouterUtil.checkBack();

      return RouterController.goBack();
    }

    return this.close();
  }

  async switchAccountType(namespace: ChainNamespace, type: AccountType, network: AppKitNetwork) {
    const adapter = this.getAdapterByNamespace(namespace);
    if (!adapter) throw new Error('No active adapter');

    ConnectionsController.setAccountType(namespace, type);

    // Get balances from API
    ConnectionsController.fetchBalance();

    // Sync balances from adapter
    this.syncBalances(adapter, network);

    EventsController.sendEvent({
      type: 'track',
      event: 'SET_PREFERRED_ACCOUNT_TYPE',
      properties: {
        accountType: type,
        network: network?.caipNetworkId || ''
      }
    });
  }

  private async createConnector(type: ConnectorType): Promise<WalletConnector> {
    // Check if an extra connector was provided by the developer
    const CustomConnector = this.extraConnectors.find(
      connector => connector.type.toLowerCase() === type.toLowerCase()
    );

    if (CustomConnector) {
      await CustomConnector.init({
        storage: this.config.storage,
        metadata: this.config.metadata
      });

      return CustomConnector;
    }

    // Default to WalletConnectConnector if no custom connector matches
    return this.createWalletConnectConnector();
  }

  private async createWalletConnectConnector() {
    if (this.walletConnectConnector) {
      return this.walletConnectConnector;
    }

    this.walletConnectConnector = new WalletConnectConnector({
      projectId: this.projectId
    });
    await this.walletConnectConnector.init({
      storage: this.config.storage,
      metadata: this.config.metadata
    });

    return this.walletConnectConnector;
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
          const properties = connector.getProperties();

          if (namespaces && Object.keys(namespaces).length > 0) {
            // Ensure namespaces is not empty
            // Setup adapters and subscribe to events
            const initializedAdapters = this.setupAdaptersAndSubscribe(
              connector,
              Object.keys(namespaces)
            );

            // If adapters were successfully initialized, store the connection details
            if (initializedAdapters.length > 0) {
              this.setConnection(initializedAdapters, namespaces, walletInfo, properties);
            }

            this.syncAccounts(initializedAdapters);

            if (
              OptionsController.state.isSiweEnabled &&
              ConnectionsController.state.activeNamespace === 'eip155'
            ) {
              this.handleSiweChange({ isConnection: true });
            }
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
    const namespaceConnection = ConnectionsController.state.connections.get(namespace);
    if (namespaceConnection) {
      return namespaceConnection.adapter;
    }

    return null;
  }

  private async syncAccounts(adapters: BlockchainAdapter[]) {
    adapters.forEach(async adapter => {
      const namespace = adapter.getSupportedNamespace();
      const connection = ConnectionsController.state.connections.get(namespace);
      const network = this.networks.find(
        n => n.id?.toString() === connection?.caipNetwork?.split(':')[1]
      );

      this.syncBalances(adapter, network);
      this.syncIdentity(namespace, connection);
    });
  }

  private syncBalances(adapter: BlockchainAdapter, network?: AppKitNetwork) {
    if (adapter && network) {
      const accounts = adapter.getAccounts();
      if (accounts && accounts.length > 0) {
        const addresses = accounts.filter(a => a.split(':')[1] === network?.id?.toString());

        if (addresses.length > 0) {
          addresses.forEach(address => {
            adapter.getBalance({ address, network, tokens: this.config.tokens });
          });
        }
      }
    }
  }

  private async syncIdentity(namespace?: ChainNamespace, connection?: Connection) {
    if (namespace !== 'eip155' || !connection?.accounts?.length) return;

    const uniqueAddresses = [
      ...new Set(connection.accounts.map(account => CoreHelperUtil.getPlainAddress(account)))
    ];

    // Process addresses sequentially to avoid race conditions
    for (const plainAddress of uniqueAddresses) {
      try {
        // Validate address format before type assertion
        if (!plainAddress || !CoreHelperUtil.isAddress(plainAddress, 'eip155')) {
          console.warn(`Invalid Ethereum address format: ${plainAddress}`);
          continue;
        }

        const identity = await BlockchainApiController.fetchIdentity({
          address: plainAddress as `0x${string}`
        });

        if (identity?.name) {
          ConnectionsController.updateIdentity(
            namespace,
            connection,
            plainAddress as `0x${string}`,
            identity
          );
        }
      } catch (error) {
        // Continue processing other addresses even if one fails
      }
    }
  }

  private setConnection(
    adapters: BlockchainAdapter[],
    approvedNamespaces: Namespaces,
    wallet?: WalletInfo,
    properties?: ConnectionProperties
  ) {
    adapters.forEach(async adapter => {
      const namespace = adapter.getSupportedNamespace();
      const namespaceDetails = approvedNamespaces[namespace];
      if (!namespaceDetails) return;

      const accounts = namespaceDetails.accounts ?? [];
      const chains = namespaceDetails.chains ?? [];
      const caipNetwork = adapter?.connector?.getChainId(namespace);
      const namespaceProperties = {
        ...properties,
        smartAccounts: properties?.smartAccounts?.filter(account => account.startsWith(namespace))
      };

      ConnectionsController.setConnection({
        accounts,
        adapter,
        caipNetwork: caipNetwork ?? chains[0]!,
        namespace,
        properties: namespaceProperties,
        wallet
      });
    });

    const updateActiveNamespace = !Object.keys(approvedNamespaces).some(
      namespace => namespace === ConnectionsController.state.activeNamespace
    );

    // If the active namespace is not in the approved namespaces or is undefined, set the first connected adapter's namespace as active
    if (updateActiveNamespace && adapters[0]) {
      ConnectionsController.setActiveNamespace(adapters[0].getSupportedNamespace());
    }
  }

  private subscribeToAdapterEvents(adapter: BlockchainAdapter): void {
    adapter.on('accountsChanged', ({ accounts }) => {
      const namespace = adapter.getSupportedNamespace();
      ConnectionsController.updateAccounts(namespace, accounts);

      if (namespace === 'eip155') {
        this.handleSiweChange({ isAccountChange: true });
      }
    });

    adapter.on('chainChanged', ({ chainId }) => {
      //eslint-disable-next-line no-console
      console.log('chainChanged', chainId);
      const namespace = adapter.getSupportedNamespace();
      const chain = `${namespace}:${chainId}` as CaipNetworkId;
      ConnectionsController.setActiveNetwork(namespace, chain);
      const connection = ConnectionsController.state.connections.get(namespace);
      const isAuth = !!connection?.properties?.provider;

      const network = this.networks.find(n => n.id?.toString() === chainId);
      this.syncBalances(adapter, network);
      SendController.resetState();

      if (isAuth) {
        ConnectionsController.fetchBalance();
      }

      if (namespace === 'eip155') {
        this.handleSiweChange({ isNetworkChange: true });
      }
    });

    adapter.on('disconnect', () => {
      const namespace = adapter.getSupportedNamespace();
      this.disconnect(namespace, false);
    });

    //TODO: Add types to this events
    adapter.on('balanceChanged', ({ address, balance }) => {
      //eslint-disable-next-line no-console
      console.log('balanceChanged', address, balance);
      const namespace = adapter.getSupportedNamespace();
      ConnectionsController.updateBalance(namespace, address, balance);
    });
  }

  private async initControllers(options: AppKitConfig) {
    await this.initStorageAndValues(options);

    OptionsController.setProjectId(options.projectId);
    OptionsController.setMetadata(options.metadata);
    OptionsController.setIncludeWalletIds(options.includeWalletIds);
    this.setExcludedWallets(options);
    this.setCustomWallets(options);
    OptionsController.setFeaturedWalletIds(options.featuredWalletIds);
    OptionsController.setEnableAnalytics(options.enableAnalytics);
    OptionsController.setDebug(options.debug);
    OptionsController.setFeatures(options.features);

    if (options.defaultNetwork) {
      const network = NetworkUtil.formatNetwork(options.defaultNetwork, this.projectId);
      OptionsController.setDefaultNetwork(network);
    }

    ThemeController.setThemeMode(options.themeMode);
    ThemeController.setThemeVariables(options.themeVariables);

    OptionsController.setSdkVersion(
      CoreHelperUtil.generateSdkVersion(this.adapters, ConstantsUtil.VERSION)
    );

    if (options.clipboardClient) {
      OptionsController.setClipboardClient(options.clipboardClient);
    }

    ConnectionsController.setNetworks(this.networks);

    if (options.siweConfig) {
      SIWEController.setSIWEClient(options.siweConfig);
    }

    if (
      (options.features?.onramp === true || options.features?.onramp === undefined) &&
      (options.metadata?.redirect?.universal || options.metadata?.redirect?.native)
    ) {
      OptionsController.setIsOnRampEnabled(true);
    }
  }

  private async initActiveNamespace() {
    const activeNamespace = await StorageUtil.getActiveNamespace();
    if (activeNamespace) {
      ConnectionsController.setActiveNamespace(activeNamespace);
    } else if (OptionsController.state.defaultNetwork) {
      ConnectionsController.setActiveNamespace(
        OptionsController.state.defaultNetwork?.chainNamespace
      );
    }
  }

  private async initRecentWallets(options: AppKitConfig) {
    const wallets = await StorageUtil.getRecentWallets();
    const connectedWalletImage = await StorageUtil.getConnectedWalletImageUrl();

    const filteredWallets = wallets.filter(wallet => {
      const { includeWalletIds, excludeWalletIds } = options;
      if (includeWalletIds) {
        return includeWalletIds.includes(wallet.id);
      }
      if (excludeWalletIds) {
        return !excludeWalletIds.includes(wallet.id);
      }

      return true;
    });

    ConnectionController.setRecentWallets(filteredWallets);

    if (connectedWalletImage) {
      ConnectionController.setConnectedWalletImageUrl(connectedWalletImage);
    }
  }

  private setExcludedWallets(options: AppKitConfig) {
    const excludedWallets = options.excludeWalletIds || [];

    // Exclude Coinbase if the connector is not implemented
    const excludeCoinbase = !this.extraConnectors.some(connector => connector.type === 'coinbase');

    if (excludeCoinbase) {
      excludedWallets.push(ConstantsUtil.COINBASE_EXPLORER_ID);
    }

    OptionsController.setExcludeWalletIds(excludedWallets);
  }

  private setCustomWallets(options: AppKitConfig) {
    const { customWallets, extraConnectors, adapters } = options;

    const customList = [...(customWallets ?? [])];

    const addPhantom =
      adapters.some(adapter => adapter.getSupportedNamespace() === 'solana') &&
      extraConnectors?.some(connector => connector.type.toLowerCase() === 'phantom') &&
      !customList.some(wallet => wallet.id === ConstantsUtil.PHANTOM_CUSTOM_WALLET.id);

    if (addPhantom) {
      customList.push(ConstantsUtil.PHANTOM_CUSTOM_WALLET);
    }

    OptionsController.setCustomWallets(customList);
  }

  private async initStorageAndValues(options: AppKitConfig) {
    if (!options.storage) {
      throw new Error('AppKit: Storage is not set');
    }

    OptionsController.setStorage(options.storage);
    await this.initActiveNamespace();
    await this.initRecentWallets(options);
  }

  private onSiweNavigation = () => {
    if (ModalController.state.open) {
      RouterController.push('ConnectingSiwe');
    } else {
      ModalController.open({ view: 'ConnectingSiwe' });
    }
  };

  private async handleSiweChange(params?: {
    isConnection?: boolean;
    isNetworkChange?: boolean;
    isAccountChange?: boolean;
  }) {
    const { isNetworkChange, isAccountChange, isConnection } = params ?? {};
    const { enabled, signOutOnAccountChange, signOutOnNetworkChange } =
      SIWEController.state._client?.options ?? {};

    if (enabled) {
      const session = await SIWEController.getSession();
      if (session && isAccountChange) {
        if (signOutOnAccountChange) {
          // If the address has changed and signOnAccountChange is enabled, sign out
          await SIWEController.signOut();

          return this.onSiweNavigation();
        }
      } else if (isNetworkChange) {
        if (signOutOnNetworkChange) {
          // If the network has changed and signOnNetworkChange is enabled, sign out
          await SIWEController.signOut();

          return this.onSiweNavigation();
        }
      } else if (!session) {
        // If it's connected but there's no session, show sign view
        return this.onSiweNavigation();
      } else if (isConnection) {
        // Connected with 1CA
        ModalController.close();
      }
    }
  }
}

export function createAppKit(config: AppKitConfig): AppKit {
  return new AppKit(config);
}
