import {
  AccountController,
  EventsController,
  ModalController,
  ConnectionsController,
  OptionsController,
  RouterController,
  TransactionsController,
  type Metadata,
  StorageUtil
} from '@reown/appkit-core-react-native';

import type {
  WalletConnector,
  BlockchainAdapter,
  ProposalNamespaces,
  New_ConnectorType,
  Namespaces,
  CaipNetworkId
  // Namespaces,
} from '@reown/appkit-common-react-native';
import { WalletConnectConnector } from './connectors/WalletConnectConnector';
interface AppKitConfig {
  projectId: string;
  metadata: Metadata;
  adapters: BlockchainAdapter[];
  networks: any[];
  extraConnectors?: WalletConnector[];
}

export class AppKit {
  private projectId: string;
  private metadata: Metadata;
  private adapters: BlockchainAdapter[];
  // private networks: any[]; //TODO: define type for networks
  // private namespaces: Namespaces;
  private extraConnectors: WalletConnector[];

  constructor(config: AppKitConfig) {
    this.projectId = config.projectId;
    this.metadata = config.metadata;
    this.adapters = config.adapters;
    // this.networks = config.networks;
    // this.namespaces = this.getNamespaces(config.networks);
    this.extraConnectors = config.extraConnectors || [];
    // console.log(this.networks?.length); // Removed console log

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
          if (namespaces && Object.keys(namespaces).length > 0) {
            // Ensure namespaces is not empty
            // Setup adapters and subscribe to events
            const initializedAdapters = this._setupAdaptersAndSubscribe(
              connector,
              Object.keys(namespaces)
            );

            // If adapters were successfully initialized, store the connection details
            if (initializedAdapters.length > 0) {
              this._storeConnectionDetails(initializedAdapters, namespaces);
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

      // Connect using the connector and get approved namespaces first
      const approvedNamespaces = await connector.connect(requestedNamespaces);
      if (!approvedNamespaces || Object.keys(approvedNamespaces).length === 0) {
        throw new Error('Connection cancelled or failed: No approved namespaces returned.');
      }

      // Now, setup adapters and subscribe *only* for the approved namespaces
      const approvedAdapters = this._setupAdaptersAndSubscribe(
        connector,
        Object.keys(approvedNamespaces)
      );

      // Check if any compatible adapters were found for the *approved* namespaces
      if (approvedAdapters.length === 0) {
        // This case might happen if the user approved namespaces for which we have no adapters,
        // or if _setupAdaptersAndSubscribe failed internally.
        throw new Error('No compatible adapters found for the approved namespaces');
      }

      // Store the connection details for the successfully connected adapters
      this._storeConnectionDetails(approvedAdapters, approvedNamespaces);

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
    // Get account balance
    adapters.map(adapter => adapter.getBalance({ address: adapter.getAccounts()?.[0] }));
  }

  /**
   * Stores connection details in the ConnectionsController.
   * @param adapters - The adapters for which to store the connection.
   * @param approvedNamespaces - The map of approved namespaces and their details.
   */
  private _storeConnectionDetails(adapters: BlockchainAdapter[], approvedNamespaces: Namespaces) {
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
        chains
      });
    });

    // Set the first connected adapter's namespace as active
    if (adapters.length > 0 && adapters[0]) {
      ConnectionsController.setActiveNamespace(adapters[0].getSupportedNamespace());
    }
  }

  private subscribeToAdapterEvents(adapter: BlockchainAdapter): void {
    adapter.on('accountsChanged', ({ accounts, namespace }) => {
      // console.log(`Updating accounts for namespace: ${namespace}`); // Removed console log
      ConnectionsController.updateAccounts(namespace, accounts);
    });

    adapter.on('chainChanged', ({ chainId, namespace }) => {
      // console.log(`Chain changed for namespace: ${namespace}`); // Removed console log
      const chain = `${namespace}:${chainId}` as CaipNetworkId;
      ConnectionsController.updateChain(namespace, chain);
    });

    adapter.on('disconnect', ({ namespace }) => {
      // console.log(`Disconnect event received for ${namespace}`); // Removed console log
      ConnectionsController.disconnect(namespace);
      // Potentially remove from storage on disconnect event as well
      // StorageUtil.removeConnectedConnectors(connectorType); // Need connectorType here
    });

    adapter.on('balanceChanged', ({ namespace, address, balance }) => {
      // console.log('balanceChanged', namespace, address, balance);
      ConnectionsController.updateBalance(namespace, address, balance);
    });
  }

  private async initControllers(options: AppKitConfig) {
    OptionsController.setProjectId(options.projectId);

    if (options.metadata) {
      OptionsController.setMetadata(options.metadata);
    }
  }

  async disconnect(namespace: string): Promise<void> {
    try {
      const connection = ConnectionsController.state.connections[namespace];
      const connectorType = connection?.adapter?.connector?.type;

      await ConnectionsController.disconnect(namespace); // This should trigger the 'disconnect' event handler via the adapter/connector

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

  getProvider<T>(namespace?: string): T | null {
    const activeNamespace = namespace ?? ConnectionsController.state.activeNamespace;
    if (!activeNamespace) return null;

    const connection = ConnectionsController.state.connections[activeNamespace];
    if (!connection || !connection.adapter || !connection.adapter.connector) return null;

    return connection.adapter.connector.getProvider() as T | null;
  }
}

export function createAppKit(config: AppKitConfig): AppKit {
  return new AppKit(config);
}
