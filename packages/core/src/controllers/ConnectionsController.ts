import { proxy, ref } from 'valtio';
import { derive } from 'valtio/utils';
import type {
  BlockchainAdapter,
  CaipAddress,
  CaipNetworkId
} from '@reown/appkit-common-react-native';

// -- Types --------------------------------------------- //
interface Connection {
  accounts: CaipAddress[];
  balances: Record<string, string>;
  activeChainId: string;
  adapter: BlockchainAdapter;
  chains: CaipNetworkId[];
}

export interface ConnectionsControllerState {
  activeNamespace: string;
  connections: Record<string, Connection>;
}

// -- State --------------------------------------------- //
const baseState = proxy<ConnectionsControllerState>({
  activeNamespace: 'eip155',
  connections: {}
});

const derivedState = derive(
  {
    activeAddress: (get): string | null => {
      const snap = get(baseState);

      if (!snap.activeNamespace) return null;

      const connection = snap.connections[snap.activeNamespace];

      if (!connection || !connection.accounts || connection.accounts.length === 0) {
        return null;
      }

      const address = connection.accounts[0]?.split(':')[2];
      if (!address) return null;

      return address;
    }
  },
  {
    proxy: baseState // Link derived proxy to the base state proxy
  }
);

// -- Controller ---------------------------------------- //
export const ConnectionsController = {
  state: derivedState,

  setActiveNamespace(namespace: string) {
    baseState.activeNamespace = namespace;
  },

  storeConnection({
    namespace,
    adapter,
    accounts,
    chains
  }: {
    namespace: string;
    adapter: BlockchainAdapter;
    accounts: CaipAddress[];
    chains: CaipNetworkId[];
  }) {
    baseState.connections[namespace] = {
      balances: {},
      activeChainId: chains[0]!,
      adapter: ref(adapter),
      accounts,
      chains
    };
    console.log('ConnectionController:storeConnection - state.connections', baseState.connections);
  },

  updateAccounts(namespace: string, accounts: CaipAddress[]) {
    const connection = baseState.connections[namespace];
    if (!connection) {
      return;
    }
    connection.accounts = accounts;
  },

  updateBalances(namespace: string, balances: Record<string, string>) {
    const connection = baseState.connections[namespace];
    if (!connection) {
      return;
    }
    connection.balances = balances;
  },

  updateChainId(namespace: string, chainId: string) {
    const connection = baseState.connections[namespace];
    if (!connection) {
      return;
    }
    connection.activeChainId = chainId;
  },

  async disconnect(namespace: string) {
    const connection = baseState.connections[namespace];
    if (!connection) return;

    console.log('ConnectionController:disconnect - connection', connection);

    // Get the current connector from the adapter
    const connector = connection.adapter.connector;
    if (!connector) return;

    console.log('ConnectionController:disconnect - connector', connector);

    // Find all namespaces that use the same connector
    const namespacesUsingConnector = Object.keys(baseState.connections).filter(
      ns => baseState.connections[ns]?.adapter.connector === connector
    );

    console.log(
      'ConnectionController:disconnect - namespacesUsingConnector',
      namespacesUsingConnector
    );

    // Unsubscribe all event listeners from the adapter
    namespacesUsingConnector.forEach(ns => {
      const _connection = baseState.connections[ns];
      if (_connection?.adapter) {
        _connection.adapter.removeAllListeners();
      }
    });

    // Disconnect the adapter
    await connection.adapter.disconnect();

    // Remove all namespaces that used this connector
    namespacesUsingConnector.forEach(ns => {
      delete baseState.connections[ns];
    });

    console.log('ConnectionController:disconnect - baseState.connections', baseState.connections);
  }
};
