import { subscribeKey } from 'valtio/utils';
import {
  EventsController,
  ModalController,
  ConnectionsController,
  OptionsController,
  RouterController,
  TransactionsController,
  StorageUtil,
  ThemeController,
  WcController,
  SwapController,
  OnRampController,
  CoreHelperUtil,
  SendController,
  BlockchainApiController,
  WalletUtil,
  LogController,
  type RouterControllerState
} from '@reown/appkit-core-react-native';

import {
  type WalletConnector,
  type BlockchainAdapter,
  type ProposalNamespaces,
  type ConnectorType,
  type Namespaces,
  type CaipNetworkId,
  type AppKitNetwork,
  type Provider,
  type WalletInfo,
  type ChainNamespace,
  type AppKitConnectOptions,
  type ConnectionProperties,
  type AccountType,
  type AppKitOpenOptions,
  ConstantsUtil,
  type Connection,
  type WcWallet
} from '@reown/appkit-common-react-native';

import { WalletConnectConnector } from './connectors/WalletConnectConnector';
import { WcHelpersUtil } from './utils/HelpersUtil';
import { NetworkUtil } from './utils/NetworkUtil';
import { RouterUtil } from './utils/RouterUtil';
import { type AppKitConfig } from './types';
import { SIWXUtil } from './utils/SIWXUtil';

const APPKIT_INSTANCE_KEY = Symbol.for('__REOWN_APPKIT_INSTANCE__');

// Type helper to access the symbol-keyed property on globalThis
interface GlobalWithAppKit {
  [key: symbol]: AppKit | undefined;
}

export class AppKit {
  private projectId: string;
  private adapters: BlockchainAdapter[];
  private networks: AppKitNetwork[];
  private namespaces: ProposalNamespaces;
  private config: AppKitConfig;
  private extraConnectors: WalletConnector[];
  private walletConnectConnector?: WalletConnector;
  private balanceIntervalId?: ReturnType<typeof setInterval>;

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
    this.namespaces = WcHelpersUtil.createNamespaces(
      this.networks,
      config.universalProviderConfigOverride
    ) as ProposalNamespaces;
    this.config = config;
    this.extraConnectors = config.extraConnectors || [];

    this.initControllers(config);
    this.initConnectors();
    this.watchBalance();
  }

  /**
   * Handles the full connection flow for a given connector type.
   * @param type - The type of connector to use.
   * @param options - Optional connection options.
   */
  async connect(options?: AppKitConnectOptions): Promise<void> {
    try {
      const { wallet, walletId } = options ?? {};

      let targetWallet: WcWallet | undefined;

      if (walletId) {
        targetWallet = WalletUtil.getWallet(walletId);
      } else if (wallet) {
        targetWallet = wallet;
      }

      const connectorType = WcHelpersUtil.getConnectorTypeByWallet(targetWallet);

      const connector = await this.createConnector(connectorType);

      const chain = NetworkUtil.getDefaultNetwork(
        this.namespaces,
        OptionsController.state.defaultNetwork
      );

      const approvedNamespaces = await connector.connect({
        namespaces: this.namespaces,
        defaultNetwork: chain,
        universalLink: targetWallet?.link_mode ?? undefined
      });

      this.processConnection(connector, approvedNamespaces);

      // Save connector type and namespaces in storage
      if (approvedNamespaces && Object.keys(approvedNamespaces).length > 0) {
        await StorageUtil.setConnectedConnectors({
          type: connector.type,
          namespaces: Object.keys(approvedNamespaces)
        });
      }
    } catch (error) {
      LogController.sendError(error, 'AppKit.ts', 'connect');
      throw error;
    }
  }

  private async processConnection(connector: WalletConnector, namespaces?: Namespaces) {
    if (!namespaces || Object.keys(namespaces).length === 0) {
      throw new Error('No namespaces provided');
    }

    const walletInfo = connector.getWalletInfo();
    const properties = connector.getProperties();

    const initializedAdapters = this.setupAdaptersAndSubscribe(connector, Object.keys(namespaces));

    if (initializedAdapters.length === 0) {
      console.warn('No compatible adapters found for namespaces:', Object.keys(namespaces));

      return;
    }

    // Store the connection details
    this.setConnection(initializedAdapters, namespaces, walletInfo, properties);

    // Sync accounts
    await this.syncAccounts(initializedAdapters);

    await SIWXUtil.initializeIfEnabled({ onDisconnect: this.disconnect, closeModal: true });
  }

  /**
   * Disconnects from a given namespace.
   * @param namespace - The namespace to disconnect from.
   * @param isInternal - Whether the disconnect is internal (i.e. from the AppKit) or external (i.e. from wallet side).
   */
  async disconnect(namespace?: ChainNamespace, isInternal?: boolean): Promise<void> {
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
      WcController.resetState();
      EventsController.resetState();

      if (ConnectionsController.state.activeNamespace === undefined) {
        ConnectionsController.setActiveNamespace(
          OptionsController.state.defaultNetwork?.chainNamespace
        );
      }

      if (SIWXUtil.getSIWX()?.signOutOnDisconnect) {
        await SIWXUtil.clearSessions();
      }

      EventsController.sendEvent({
        type: 'track',
        event: 'DISCONNECT_SUCCESS',
        properties: {
          namespace: activeNamespace
        }
      });
    } catch (error) {
      LogController.sendError(error, 'AppKit.ts', 'disconnect');
      EventsController.sendEvent({
        type: 'track',
        event: 'DISCONNECT_ERROR'
      });
    }
  }

  /**
   * Returns the provider for a given namespace.
   * @param namespace - The namespace to get the provider for.
   * @returns The provider for the given namespace, or null if not available or not yet initialized.
   */
  getProvider<T extends Provider>(namespace?: string): T | null {
    const activeNamespace = namespace ?? ConnectionsController.state.activeNamespace;
    if (!activeNamespace) return null;

    const connection = ConnectionsController.state.connections.get(
      activeNamespace as ChainNamespace
    );
    if (!connection || !connection.adapter || !connection.adapter.connector) return null;

    try {
      return connection.adapter.connector.getProvider() as T | null;
    } catch (error) {
      // Provider not initialized yet during session restoration
      // This can happen on app restart when restoring a previous connection
      LogController.sendError(error, 'AppKit.ts', 'getProvider');

      return null;
    }
  }

  getNetworks() {
    return this.networks;
  }

  /**
   * Switches to a different network.
   * @param network - Either an AppKitNetwork object or a CAIP network ID string (e.g., 'eip155:1')
   * @throws {Error} When the network is not found in configured networks
   * @throws {Error} When no active adapter is available (only when connected)
   * @returns Promise that resolves when the network switch is complete
   */
  async switchNetwork(network: AppKitNetwork | CaipNetworkId): Promise<void> {
    const { isConnected } = ConnectionsController.state;

    const appKitNetwork =
      typeof network === 'string' ? this.networks.find(n => n.caipNetworkId === network) : network;

    if (!appKitNetwork) {
      const error = new Error(`Network not found: ${network}`);
      LogController.sendError(`Network not found: ${network}`, 'AppKit.ts', 'switchNetwork');

      throw error;
    }

    if (!isConnected) {
      OptionsController.setDefaultNetwork(appKitNetwork);

      return;
    }

    const adapter = this.getAdapterByNamespace(appKitNetwork.chainNamespace);
    if (!adapter) throw new Error('No active adapter');

    await adapter.switchNetwork(appKitNetwork);

    EventsController.sendEvent({
      type: 'track',
      event: 'SWITCH_NETWORK',
      properties: {
        network: appKitNetwork.caipNetworkId
      }
    });

    ConnectionsController.setActiveNetwork(
      appKitNetwork.chainNamespace,
      appKitNetwork.caipNetworkId
    );
  }

  open(options?: AppKitOpenOptions) {
    ModalController.open(options);
  }

  async close() {
    ModalController.close();
    const isSIWXRequired = SIWXUtil.getSIWX()?.getRequired?.();

    if (isSIWXRequired && ConnectionsController.state.isConnected) {
      const sessions = await SIWXUtil.getSessions();
      if (!sessions.length) {
        return await this.disconnect();
      }
    }

    if (RouterController.state.view === 'UnsupportedChain') {
      return await this.disconnect();
    }

    RouterUtil.checkOnRampBack();
    RouterUtil.checkSocialLoginBack();
    EventsController.sendWalletImpressions();
  }

  back() {
    if (RouterController.state.history.length > 1) {
      RouterUtil.checkBack();

      return RouterController.goBack();
    }

    const isSIWXRequired = SIWXUtil.getSIWX()?.getRequired?.();

    if (isSIWXRequired) {
      // Don't close the modal if SIWX is required
      return;
    }

    return this.close();
  }

  async switchAccountType(namespace: ChainNamespace, type: AccountType, network: AppKitNetwork) {
    const adapter = this.getAdapterByNamespace(namespace);
    if (!adapter) throw new Error('No active adapter');

    const address = ConnectionsController.setAccountType(namespace, type);

    // Get balances from API
    ConnectionsController.fetchBalance();

    // Fetch transactions for the new account
    if (address) {
      TransactionsController.fetchTransactions(address, true);
    }

    // Sync balances from adapter
    this.syncNativeBalance(adapter, network);

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

  /**
   * Initializes connectors based on stored connection data.
   * This attempts to restore previous sessions.
   */
  private async initConnectors() {
    ModalController.setLoading(true);

    //Always init the walletconnect connector
    await this.createWalletConnectConnector();

    const connectedConnectors = await StorageUtil.getConnectedConnectors();
    if (connectedConnectors.length > 0) {
      for (const connected of connectedConnectors) {
        try {
          const connector = await this.createConnector(connected.type);

          const namespaces = connector.getNamespaces();

          await this.processConnection(connector, namespaces);
        } catch (error) {
          LogController.sendError(error, 'AppKit.ts', 'initializeConnector', {
            connectorType: connected.type
          });
          await StorageUtil.removeConnectedConnectors(connected.type);
        }
      }

      const address = ConnectionsController.state.activeAddress;
      const walletInfo = ConnectionsController.state.walletInfo;
      if (address) {
        EventsController.sendEvent({
          type: 'track',
          event: 'CONNECT_SUCCESS',
          address: CoreHelperUtil.getPlainAddress(address),
          properties: {
            name: walletInfo?.name ?? 'Unknown',
            reconnect: true
          }
        });
      }
    }

    ModalController.setLoading(false);
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
      adapter.init({ connector });
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

      this.syncNativeBalance(adapter, network);
      this.syncIdentity(namespace, connection);
    });
  }

  private syncNativeBalance(adapter: BlockchainAdapter, network?: AppKitNetwork) {
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
        LogController.sendError(error, 'AppKit.ts', 'syncIdentity');
        // Continue processing other addresses even if one fails
      }
    }
  }

  private refreshBalance(fetchAllBalances: boolean = false) {
    try {
      if (fetchAllBalances) {
        ConnectionsController.fetchBalance();
      }
      const ns = ConnectionsController.state.activeNamespace;
      const network = ConnectionsController.state.activeNetwork;
      if (ns && network) {
        const adapter = this.getAdapterByNamespace(ns);
        if (adapter) {
          this.syncNativeBalance(adapter, network);
        }
      }
    } catch (error) {
      // ignore
      LogController.sendError(error, 'AppKit.ts', 'refreshBalance');
    }
  }

  private startBalancePolling(fetchAllBalances: boolean = false) {
    if (this.balanceIntervalId) return;
    // immediate fetch
    this.refreshBalance(fetchAllBalances);
    this.balanceIntervalId = setInterval(() => this.refreshBalance(fetchAllBalances), 10000);
  }

  private stopBalancePolling() {
    if (this.balanceIntervalId) {
      clearInterval(this.balanceIntervalId);
      this.balanceIntervalId = undefined;
    }
  }

  private watchBalance() {
    // watch balance when user is on account or account default view
    const recomputePolling = () => {
      const open = ModalController.state.open;
      const view = RouterController.state.view;
      if (open && (view === 'Account' || view === 'AccountDefault')) {
        // fetch all balances when user is using embedded wallet
        this.startBalancePolling(view === 'Account');
      } else {
        this.stopBalancePolling();
      }
    };
    recomputePolling();
    subscribeKey(RouterController.state, 'view', () => recomputePolling());
    subscribeKey(ModalController.state, 'open', () => recomputePolling());
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
        smartAccounts: properties?.smartAccounts?.filter(account => account.startsWith(namespace)),
        canAddEvmChain: wallet?.name === 'MetaMask Wallet' // MetaMask allows adding EVM chains after connecting
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
    });

    adapter.on('chainChanged', async ({ chainId }) => {
      const isSupported = this.networks.some(network => network.id?.toString() === chainId);
      if (!isSupported) {
        return this.navigate('UnsupportedChain');
      }

      const namespace = adapter.getSupportedNamespace();
      const chain = `${namespace}:${chainId}` as CaipNetworkId;

      ConnectionsController.setActiveNetwork(namespace, chain);

      const connection = ConnectionsController.state.connections.get(namespace);
      const isAuth = !!connection?.properties?.provider;

      const network = this.networks.find(n => n.id?.toString() === chainId);
      this.syncNativeBalance(adapter, network);
      SendController.resetState();

      // Refresh balance for embedded wallets
      if (isAuth) {
        ConnectionsController.fetchBalance();
      }

      const address = connection?.accounts?.find(account =>
        account.startsWith(`${namespace}:${chainId}`)
      );
      if (address) {
        TransactionsController.fetchTransactions(address, true);
      }

      const closeModal = RouterController.state.view === 'UnsupportedChain';

      SIWXUtil.initializeIfEnabled({
        onDisconnect: this.disconnect,
        caipAddress: address,
        closeModal
      });
    });

    adapter.on('disconnect', () => {
      const namespace = adapter.getSupportedNamespace();
      this.disconnect(namespace, false);
    });

    adapter.on('balanceChanged', ({ address, balance }) => {
      const namespace = adapter.getSupportedNamespace();
      ConnectionsController.updateBalance(namespace, address, balance);
    });
  }

  private async initControllers(options: AppKitConfig) {
    await this.initStorageAndValues(options);
    let defaultNetwork;

    OptionsController.setProjectId(options.projectId);
    OptionsController.setMetadata(options.metadata);
    OptionsController.setIncludeWalletIds(options.includeWalletIds);
    this.setExcludedWallets(options);
    this.setCustomWallets(options);
    OptionsController.setFeaturedWalletIds(options.featuredWalletIds);
    OptionsController.setEnableAnalytics(options.enableAnalytics);
    OptionsController.setDebug(options.debug);

    LogController.sendInfo('AppKit initialization started', 'AppKit.ts', 'initControllers', {
      projectId: options.projectId,
      adapters: this.adapters.map(a => a.constructor.name),
      networks: this.networks.map(n => n.name),
      debug: options.debug
    });

    OptionsController.setFeatures(options.features);
    OptionsController.setRequestedNetworks(this.networks);

    if (options.defaultNetwork) {
      defaultNetwork = NetworkUtil.formatNetwork(options.defaultNetwork, this.projectId);
      OptionsController.setDefaultNetwork(defaultNetwork);
    }

    ThemeController.setDefaultThemeMode(options.themeMode);
    ThemeController.setThemeVariables(options.themeVariables);

    OptionsController.setSdkVersion(
      CoreHelperUtil.generateSdkVersion(this.adapters, ConstantsUtil.VERSION)
    );

    if (options.clipboardClient) {
      OptionsController.setClipboardClient(options.clipboardClient);
    }

    ConnectionsController.setNetworks(this.networks);

    if (options.siwx) {
      OptionsController.setSiwx(options.siwx);
    }

    if (
      (options.features?.onramp === true || options.features?.onramp === undefined) &&
      (options.metadata?.redirect?.universal || options.metadata?.redirect?.native)
    ) {
      OptionsController.setIsOnRampEnabled(true);
    }

    EventsController.sendEvent({
      type: 'track',
      event: 'INITIALIZE',
      properties: {
        showWallets: options.features?.showWallets,
        themeMode: options.themeMode,
        themeVariables: options.themeVariables,
        networks: this.networks.map(network => network.caipNetworkId).filter(Boolean),
        defaultNetwork: defaultNetwork?.caipNetworkId,
        metadata: options.metadata,
        enableAnalytics: options.enableAnalytics,
        features: options.features,
        adapters: this.adapters.map(adapter => adapter?.constructor?.name).filter(Boolean),
        extraConnectors: this.extraConnectors.map(connector => connector?.type).filter(Boolean),
        siwx: !!options.siwx
      }
    });
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
    const filteredWallets = wallets.filter(wallet => {
      const { includeWalletIds, excludeWalletIds } = options;

      if (includeWalletIds?.length) {
        return includeWalletIds.includes(wallet.id);
      }
      if (excludeWalletIds?.length) {
        return !excludeWalletIds.includes(wallet.id);
      }

      return this.networks.some(
        network => wallet.chains?.some(chain => network.caipNetworkId === chain)
      );
    });

    WcController.setRecentWallets(filteredWallets);
  }

  private setExcludedWallets(options: AppKitConfig) {
    const excludedWallets = options.excludeWalletIds || [];

    // Exclude Coinbase if the connector is not implemented
    const excludeCoinbase = !this.extraConnectors.some(connector => connector.type === 'coinbase');

    if (excludeCoinbase) {
      excludedWallets.push(ConstantsUtil.COINBASE_CUSTOM_WALLET.id);
    }

    OptionsController.setExcludeWalletIds(excludedWallets);
  }

  private setCustomWallets(options: AppKitConfig) {
    const { customWallets, extraConnectors, adapters } = options;

    const customList = [...(customWallets ?? [])];

    const isSolanaEnabled =
      adapters.some(adapter => adapter.getSupportedNamespace() === 'solana') &&
      this.networks.some(network => network.chainNamespace === 'solana');

    const addPhantom =
      isSolanaEnabled &&
      extraConnectors?.some(connector => connector.type.toLowerCase() === 'phantom') &&
      !customList.some(wallet => wallet.id === ConstantsUtil.PHANTOM_CUSTOM_WALLET.id);

    if (addPhantom) {
      customList.push(ConstantsUtil.PHANTOM_CUSTOM_WALLET);
    }

    const addSolflare =
      isSolanaEnabled &&
      extraConnectors?.some(connector => connector.type.toLowerCase() === 'solflare') &&
      !customList.some(wallet => wallet.id === ConstantsUtil.SOLFLARE_CUSTOM_WALLET.id);

    if (addSolflare) {
      customList.push(ConstantsUtil.SOLFLARE_CUSTOM_WALLET);
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

  private navigate = (routeName: RouterControllerState['view']) => {
    if (RouterController.state.view === routeName) {
      return;
    }

    if (ModalController.state.open) {
      RouterController.push(routeName);
    } else {
      ModalController.open({ view: routeName });
    }
  };
}

/**
 * Creates or returns the existing AppKit singleton instance.
 *
 * @warning This function implements a singleton pattern. If an instance already exists,
 * it will be returned and the provided config parameter will be IGNORED. If you need to
 * change configuration, you must reload your application or clear the singleton manually.
 *
 * @param config - AppKit configuration options
 * @returns The AppKit singleton instance
 * @throws Error if configuration validation fails
 */
export function createAppKit(config: AppKitConfig): AppKit {
  try {
    const globalWithAppKit = globalThis as GlobalWithAppKit;

    if (!globalWithAppKit[APPKIT_INSTANCE_KEY]) {
      if (config.debug && __DEV__) {
        // using console.log to avoid possible issues with LogController not being initialized
        //eslint-disable-next-line no-console
        console.log('AppKit: Creating new instance - AppKit.ts:createAppKit');
      }
      globalWithAppKit[APPKIT_INSTANCE_KEY] = new AppKit(config);
    } else if (config.debug && __DEV__) {
      //eslint-disable-next-line no-console
      console.log('AppKit: Reusing existing instance - AppKit.ts:createAppKit');
    }

    return globalWithAppKit[APPKIT_INSTANCE_KEY]!;
  } catch (error) {
    if (__DEV__) {
      // using console.error to avoid possible issues with LogController not being initialized
      //eslint-disable-next-line no-console
      console.error('AppKit: Failed to create instance - AppKit.ts:createAppKit', error);
    }

    throw error;
  }
}
