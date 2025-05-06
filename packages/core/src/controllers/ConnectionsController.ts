import { proxy, ref } from 'valtio';
import { derive } from 'valtio/utils';
import type {
  AppKitNetwork,
  BlockchainAdapter,
  CaipAddress,
  CaipNetworkId,
  ChainNamespace,
  GetBalanceResponse
} from '@reown/appkit-common-react-native';

// -- Types --------------------------------------------- //
type Balance = GetBalanceResponse;

//TODO: balance could be elsewhere
interface Connection {
  accounts: CaipAddress[];
  balances: Record<CaipAddress, Balance>; //TODO: make this an array of balances
  adapter: BlockchainAdapter;
  chains: CaipNetworkId[];
  activeChain: CaipNetworkId;
}

export interface ConnectionsControllerState {
  activeNamespace: ChainNamespace;
  connections: Record<string, Connection>;
  networks: AppKitNetwork[];
}

// -- State --------------------------------------------- //
const baseState = proxy<ConnectionsControllerState>({
  activeNamespace: 'eip155',
  connections: {},
  networks: []
});

const derivedState = derive(
  {
    activeAddress: (get): CaipAddress | undefined => {
      const snap = get(baseState);

      if (!snap.activeNamespace) return undefined;

      const connection = snap.connections[snap.activeNamespace];

      if (!connection || !connection.accounts || connection.accounts.length === 0) {
        return undefined;
      }

      const activeAccount = connection.accounts.find(account =>
        account.startsWith(connection.activeChain)
      );

      return activeAccount;
    },
    activeBalance: (get): Balance | undefined => {
      const snap = get(baseState);

      if (!snap.activeNamespace) return undefined;
      const connection = snap.connections[snap.activeNamespace];

      if (!connection || !connection.accounts || connection.accounts.length === 0) {
        return undefined;
      }

      const activeAccount = connection.accounts.find(account =>
        account.startsWith(connection.activeChain)
      );

      if (
        !connection ||
        !connection.balances ||
        !activeAccount ||
        Object.keys(connection.balances).length === 0
      ) {
        return undefined;
      }

      return connection.balances[activeAccount];
    },
    activeNetwork: (get): AppKitNetwork | undefined => {
      const snap = get(baseState);

      if (!snap.activeNamespace) return undefined;

      const connection = snap.connections[snap.activeNamespace];

      if (!connection) return undefined;

      return snap.networks.find(
        network =>
          (network.chainNamespace ?? 'eip155') === snap.activeNamespace &&
          network.id?.toString() === connection.activeChain?.split(':')[1]
      );
    },
    activeCaipNetworkId: (get): CaipNetworkId | undefined => {
      const snap = get(baseState);

      if (!snap.activeNamespace) return undefined;

      const connection = snap.connections[snap.activeNamespace];

      if (!connection) return undefined;

      return connection.activeChain;
    }
  },
  {
    proxy: baseState // Link derived proxy to the base state proxy
  }
);

// -- Controller ---------------------------------------- //
export const ConnectionsController = {
  state: derivedState,

  setActiveNamespace(namespace: ChainNamespace) {
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
      activeChain: chains[0]!,
      adapter: ref(adapter),
      accounts,
      chains
    };
  },

  updateAccounts(namespace: string, accounts: CaipAddress[]) {
    const connection = baseState.connections[namespace];
    if (!connection) {
      return;
    }
    connection.accounts = accounts;
  },

  updateBalance(namespace: string, address: CaipAddress, balance: Balance) {
    const connection = baseState.connections[namespace];
    if (!connection) {
      return;
    }
    connection.balances[address] = balance;
  },

  setActiveChain(namespace: string, chain: CaipNetworkId) {
    const connection = baseState.connections[namespace];

    if (!connection) {
      return;
    }

    connection.activeChain = chain;
  },

  setNetworks(networks: AppKitNetwork[]) {
    baseState.networks = networks;
  },

  getConnectedNetworks() {
    return baseState.networks.filter(
      network => baseState.connections[network.chainNamespace ?? 'eip155']
    );
  },

  async disconnect(namespace: string) {
    const connection = baseState.connections[namespace];
    if (!connection) return;

    // Get the current connector from the adapter
    const connector = connection.adapter.connector;
    if (!connector) return;

    // Find all namespaces that use the same connector
    const namespacesUsingConnector = Object.keys(baseState.connections).filter(
      ns => baseState.connections[ns]?.adapter.connector === connector
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
  }
};
