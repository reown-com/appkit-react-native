import {
  AccountController,
  EventsController,
  ModalController,
  ConnectionsController,
  OptionsController,
  RouterController,
  TransactionsController,
  type Metadata
} from '@reown/appkit-core-react-native';

import type {
  WalletConnector,
  BlockchainAdapter,
  ProposalNamespaces,
  New_ConnectorType
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
  private networks: any[]; //TODO: define type for networks
  // private namespaces: Namespaces;
  private extraConnectors: WalletConnector[];

  constructor(config: AppKitConfig) {
    this.projectId = config.projectId;
    this.metadata = config.metadata;
    this.adapters = config.adapters;
    this.networks = config.networks;
    // this.namespaces = this.getNamespaces(config.networks);
    this.extraConnectors = config.extraConnectors || [];
    console.log(this.networks?.length);

    this.initControllers(config);
  }

  private async createConnector(type: New_ConnectorType): Promise<WalletConnector> {
    // Check if an extra connector was provided by the developer
    const CustomConnector = this.extraConnectors.find(
      connector => connector.constructor.name.toLowerCase() === type.toLowerCase()
    );

    if (CustomConnector) {
      return CustomConnector;
    }

    return WalletConnectConnector.create({ projectId: this.projectId, metadata: this.metadata });
  }

  async connect(type: New_ConnectorType, requestedNamespaces?: ProposalNamespaces): Promise<void> {
    try {
      const connector = await this.createConnector(type);

      //Set connector in available adapters
      const adapters = this.adapters.filter(adapter =>
        Object.keys(requestedNamespaces ?? {}).includes(adapter.getSupportedNamespace())
      );

      if (adapters.length === 0) {
        throw new Error('No compatible adapters found for the requested namespaces');
      }

      adapters.forEach(adapter => {
        adapter.setConnector(connector);
        this.subscribeToAdapterEvents(adapter);
      });

      // Connect using the connector and get approved namespaces
      const approvedNamespaces = await connector.connect(requestedNamespaces);

      if (!approvedNamespaces) {
        throw new Error('No approved namespaces found');
      }

      console.log('CONNECTED - approvedNamespaces', approvedNamespaces);

      // Find adapters that support the approved namespaces
      const adapterInstances = adapters.filter(adapter =>
        Object.keys(approvedNamespaces ?? {}).includes(adapter.getSupportedNamespace())
      );

      // Store the connection of supported adapters
      adapterInstances.forEach(async adapter => {
        const namespace = adapter.getSupportedNamespace();
        const accounts = approvedNamespaces[namespace]?.accounts ?? [];
        const chains = approvedNamespaces[namespace]?.chains ?? [];
        const methods = approvedNamespaces[namespace]?.methods ?? [];
        const events = approvedNamespaces[namespace]?.events ?? [];
        ConnectionsController.storeConnection({
          namespace,
          adapter,
          accounts,
          chains,
          methods,
          events
        });
      });

      // Unsubscribe evets from the not connected connectors
      const notConnectedAdapters = this.adapters.filter(
        adapter => !adapterInstances.includes(adapter)
      );

      notConnectedAdapters.forEach(adapter => {
        adapter.removeAllListeners();
        adapter.removeConnector();
      });
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    }
  }

  private subscribeToAdapterEvents(adapter: BlockchainAdapter): void {
    adapter.on('accountsChanged', ({ accounts, namespace }) => {
      console.log(`Updating accounts for namespace: ${namespace}`);
      ConnectionsController.updateAccounts(namespace, accounts);
    });

    adapter.on('chainChanged', ({ chainId, namespace }) => {
      console.log(`Chain changed for namespace: ${namespace}`);
      ConnectionsController.updateChainId(namespace, chainId);
    });

    adapter.on('disconnect', ({ namespace }) => {
      console.log(`Disconnect event received for ${namespace}`);
      ConnectionsController.disconnect(namespace);
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
      await ConnectionsController.disconnect(namespace);
      ModalController.close();
      AccountController.setIsConnected(false);
      RouterController.reset('Connect');
      TransactionsController.resetTransactions();
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

  getProvider<T>(namespace?: string): T | null {
    const connection =
      ConnectionsController.state.connections[
        namespace ?? ConnectionsController.state.activeNamespace
      ];
    if (!connection) return null;

    return connection.adapter.connector?.getProvider() as T;
  }
}

export function createAppKit(config: AppKitConfig): AppKit {
  return new AppKit(config);
}
