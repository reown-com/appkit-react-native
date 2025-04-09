import { proxy } from 'valtio';
import type { BlockchainAdapter } from '@reown/appkit-common-react-native';

// -- Types --------------------------------------------- //
interface Connection {
  accounts: string[];
  balances: Record<string, string>;
  activeChainId: string;
  adapter: BlockchainAdapter;
  events: string[];
  chains: string[];
  methods: string[];
}

export interface ConnectionsControllerState {
  activeNamespace: string;
  connections: Record<string, Connection>;
}

// -- State --------------------------------------------- //
const state = proxy<ConnectionsControllerState>({
  activeNamespace: 'eip155',
  connections: {}
});

// -- Controller ---------------------------------------- //
export const ConnectionsController = {
  state,

  setActiveNamespace(namespace: string) {
    state.activeNamespace = namespace;
  },

  storeConnection({
    namespace,
    adapter,
    accounts,
    events,
    chains,
    methods
  }: {
    namespace: string;
    adapter: BlockchainAdapter;
    accounts: string[];
    events: string[];
    chains: string[];
    methods: string[];
  }) {
    state.connections[namespace] = {
      balances: {},
      activeChainId: chains[0]!,
      adapter,
      accounts,
      events,
      chains,
      methods
    };
    console.log('ConnectionController:storeConnection - state.connections', state.connections);
  },

  updateAccounts(namespace: string, accounts: string[]) {
    const connection = state.connections[namespace];
    if (!connection) {
      return;
    }
    connection.accounts = accounts;
  },

  updateBalances(namespace: string, balances: Record<string, string>) {
    const connection = state.connections[namespace];
    if (!connection) {
      return;
    }
    connection.balances = balances;
  },

  updateChainId(namespace: string, chainId: string) {
    const connection = state.connections[namespace];
    if (!connection) {
      return;
    }
    connection.activeChainId = chainId;
  },

  async disconnect(namespace: string) {
    const connection = state.connections[namespace];
    if (!connection) return;

    console.log('ConnectionController:disconnect - connection', connection);

    // Get the current connector from the adapter
    const connector = connection.adapter.connector;
    if (!connector) return;

    console.log('ConnectionController:disconnect - connector', connector);

    // Find all namespaces that use the same connector
    const namespacesUsingConnector = Object.keys(state.connections).filter(
      ns => state.connections[ns]?.adapter.connector === connector
    );

    console.log(
      'ConnectionController:disconnect - namespacesUsingConnector',
      namespacesUsingConnector
    );

    // Unsubscribe all event listeners from the adapter
    namespacesUsingConnector.forEach(ns => {
      const _connection = state.connections[ns];
      if (_connection?.adapter) {
        _connection.adapter.removeAllListeners();
      }
    });

    // Disconnect the adapter
    await connection.adapter.disconnect();

    // Remove all namespaces that used this connector
    namespacesUsingConnector.forEach(ns => {
      delete state.connections[ns];
    });

    console.log('ConnectionController:disconnect - state.connections', state.connections);
  }
};
