import {
  AccountController,
  EventsController,
  ModalController,
  OptionsController,
  RouterController,
  TransactionsController,
  type Metadata
} from '@reown/appkit-core-react-native';

import type { ConnectorType, WalletConnector, BlockchainAdapter } from './adapters/types';
import { ConnectionController } from './controllers/ConnectionController';
import { WalletConnectConnector } from './connectors/WalletConnectConnector';
interface AppKitConfig {
  projectId: string;
  metadata: Metadata;
  adapters: BlockchainAdapter[];
  networks: string[];
  extraConnectors?: WalletConnector[];
}

export class AppKit {
  private projectId: string;
  private metadata: Metadata;
  private adapters: BlockchainAdapter[];
  private networks: string[];
  private namespaces: string[];
  private extraConnectors: WalletConnector[];

  constructor(config: AppKitConfig) {
    this.projectId = config.projectId;
    this.metadata = config.metadata;
    this.adapters = config.adapters;
    this.networks = config.networks;
    this.namespaces = this.getNamespaces(config.networks);
    this.extraConnectors = config.extraConnectors || [];
    console.log(this.networks?.length);

    this.initControllers(config);
  }

  //TODO: define type for networks
  private getNamespaces(networks: any[]): string[] {
    // Extract unique namespaces from network identifiers
    // Default to 'eip155' if no namespace is found

    return [...new Set(networks.map(network => network.id.split?.(':')[0] || 'eip155'))];
  }

  private async createConnector(type: ConnectorType): Promise<WalletConnector> {
    // Check if an extra connector was provided by the developer
    const CustomConnector = this.extraConnectors.find(
      connector => connector.constructor.name.toLowerCase() === type.toLowerCase()
    );

    if (CustomConnector) {
      return CustomConnector;
    }

    return WalletConnectConnector.create({ projectId: this.projectId, metadata: this.metadata });
  }

  async connect(type: ConnectorType, requestedNamespaces?: string[]): Promise<void> {
    try {
      const connector = await this.createConnector(type);

      //Set connector in available adapters
      const adapters = this.adapters.filter(
        adapter => requestedNamespaces?.includes(adapter.getSupportedNamespace())
      );

      if (adapters.length === 0) {
        throw new Error('No compatible adapters found for the requested namespaces');
      }

      console.log(adapters);

      adapters.forEach(adapter => {
        adapter.setConnector(connector);
        this.subscribeToAdapterEvents(adapter);
      });

      // Connect using the connector and get approved namespaces
      const approvedNamespaces = await connector.connect(requestedNamespaces ?? this.namespaces);

      // Find adapters that support the approved namespaces
      const adapterInstances = adapters.filter(
        adapter => approvedNamespaces?.includes(adapter.getSupportedNamespace())
      );

      // if (adapterInstances.length === 0) {
      //   throw new Error('No compatible adapters found for the approved namespaces');
      // }

      // Store the connection in supported adapters
      adapterInstances.forEach(adapter => {
        // adapter.setConnector(connector);
        // this.subscribeToAdapterEvents(adapter);
        ConnectionController.storeConnection(adapter.getSupportedNamespace(), adapter);
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
      ConnectionController.updateAccounts(namespace, accounts);
    });

    adapter.on('chainChanged', ({ chainId, namespace }) => {
      console.log(`Chain changed for namespace: ${namespace}`);
      ConnectionController.updateChainId(namespace, chainId);
    });

    adapter.on('disconnect', ({ namespace }) => {
      console.log(`Disconnect event received for ${namespace}`);
      ConnectionController.disconnect(namespace);
    });
  }

  private async initControllers(options: AppKitConfig) {
    OptionsController.setProjectId(options.projectId);

    if (options.metadata) {
      OptionsController.setMetadata(options.metadata);
    }
  }

  async disconnect(namespace: string): Promise<void> {
    console.log('AppKit disconnecting', namespace);
    try {
      await ConnectionController.disconnect(namespace);
      ModalController.close();
      AccountController.setIsConnected(false);
      RouterController.reset('Connect');
      TransactionsController.resetTransactions();
      EventsController.sendEvent({
        type: 'track',
        event: 'DISCONNECT_SUCCESS'
      });
    } catch (error) {
      console.error('AppKit:disconnect - error', error);
      EventsController.sendEvent({
        type: 'track',
        event: 'DISCONNECT_ERROR'
      });
    }
  }

  getProvider<T>(namespace?: string): T | null {
    const connection =
      ConnectionController.state.connections[
        namespace ?? ConnectionController.state.activeNamespace
      ];
    if (!connection) return null;

    return (connection.adapter as any).currentConnector?.getProvider() as T;
  }
}

export function createAppKit(config: AppKitConfig): AppKit {
  return new AppKit(config);
}
