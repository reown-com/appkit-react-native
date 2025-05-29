import { proxy, ref } from 'valtio';
import { derive } from 'valtio/utils';
import type {
  AppKitNetwork,
  BlockchainAdapter,
  CaipAddress,
  CaipNetworkId,
  ChainNamespace,
  GetBalanceResponse,
  WalletInfo
} from '@reown/appkit-common-react-native';
import { StorageUtil } from '../utils/StorageUtil';

// -- Types --------------------------------------------- //
type Balance = GetBalanceResponse;

//TODO: balance could be elsewhere
interface Connection {
  accounts: CaipAddress[];
  balances: Record<CaipAddress, Balance>; //TODO: make this an array of balances
  adapter: BlockchainAdapter;
  caipNetwork: CaipNetworkId;
  wallet?: WalletInfo;
}

export interface ConnectionsControllerState {
  activeNamespace?: ChainNamespace;
  connections: Map<ChainNamespace, Connection>;
  networks: AppKitNetwork[];
}

// -- State --------------------------------------------- //
const baseState = proxy<ConnectionsControllerState>({
  activeNamespace: undefined,
  connections: new Map<ChainNamespace, Connection>(),
  networks: []
});

const derivedState = derive(
  {
    activeAddress: (get): CaipAddress | undefined => {
      const snap = get(baseState);

      if (!snap.activeNamespace) {
        return undefined;
      }

      const connection = snap.connections.get(snap.activeNamespace);

      if (!connection || !connection.accounts || connection.accounts.length === 0) {
        return undefined;
      }

      //TODO: what happens if there are several accounts on the same chain?
      const activeAccount = connection.accounts.find(account =>
        account.startsWith(connection.caipNetwork)
      );

      return activeAccount;
    },
    activeBalance: (get): Balance | undefined => {
      const snap = get(baseState);

      if (!snap.activeNamespace) return undefined;
      const connection = snap.connections.get(snap.activeNamespace);

      if (!connection || !connection.accounts || connection.accounts.length === 0) {
        return undefined;
      }

      const activeAccount = connection.accounts.find(account =>
        account.startsWith(connection.caipNetwork)
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

      const connection = snap.connections.get(snap.activeNamespace);

      if (!connection) return undefined;

      return snap.networks.find(
        network =>
          network.chainNamespace === snap.activeNamespace &&
          network.id?.toString() === connection.caipNetwork?.split(':')[1]
      );
    },
    activeCaipNetworkId: (get): CaipNetworkId | undefined => {
      const snap = get(baseState);

      if (!snap.activeNamespace) return undefined;

      const connection = snap.connections.get(snap.activeNamespace);

      if (!connection) return undefined;

      return connection.caipNetwork;
    },
    walletInfo: (get): WalletInfo | undefined => {
      const snap = get(baseState);

      if (!snap.activeNamespace) return undefined;

      return snap.connections.get(snap.activeNamespace)?.wallet;
    }
  },
  {
    proxy: baseState // Link derived proxy to the base state proxy
  }
);

// -- Controller ---------------------------------------- //
export const ConnectionsController = {
  state: derivedState,

  setActiveNamespace(namespace?: ChainNamespace) {
    baseState.activeNamespace = namespace;
    StorageUtil.setActiveNamespace(namespace);
  },

  storeConnection({
    namespace,
    adapter,
    accounts,
    chains,
    wallet,
    caipNetwork
  }: {
    namespace: ChainNamespace;
    adapter: BlockchainAdapter;
    accounts: CaipAddress[];
    chains: CaipNetworkId[];
    wallet?: WalletInfo;
    caipNetwork?: CaipNetworkId;
  }) {
    const newConnectionEntry = {
      balances: {},
      caipNetwork: caipNetwork ?? chains[0]!,
      adapter: ref(adapter),
      accounts,
      chains,
      wallet
    };

    // Create a new Map to ensure Valtio detects the change
    const newConnectionsMap = new Map(baseState.connections);
    newConnectionsMap.set(namespace, newConnectionEntry);
    baseState.connections = newConnectionsMap;
  },

  updateAccounts(namespace: ChainNamespace, accounts: CaipAddress[]) {
    const connection = baseState.connections.get(namespace);
    if (!connection) {
      return;
    }

    const newConnectionsMap = new Map(baseState.connections);
    const updatedConnection = { ...connection, accounts };
    newConnectionsMap.set(namespace, updatedConnection);
    baseState.connections = newConnectionsMap;
  },

  updateBalance(namespace: ChainNamespace, address: CaipAddress, balance: Balance) {
    const connection = baseState.connections.get(namespace);
    if (!connection) {
      return;
    }

    const newBalances = { ...connection.balances, [address]: balance };
    const updatedConnection = { ...connection, balances: newBalances };
    const newConnectionsMap = new Map(baseState.connections);
    newConnectionsMap.set(namespace, updatedConnection);
    baseState.connections = newConnectionsMap;
  },

  setActiveNetwork(namespace: ChainNamespace, networkId: CaipNetworkId) {
    const connection = baseState.connections.get(namespace);

    if (!connection) {
      return;
    }

    baseState.connections.set(namespace, {
      ...connection,
      caipNetwork: networkId
    });
  },

  setNetworks(networks: AppKitNetwork[]) {
    baseState.networks = networks;
  },

  getConnectedNetworks() {
    return baseState.networks.filter(
      network =>
        baseState.connections
          .get(network.chainNamespace)
          ?.accounts.some(account => account.startsWith(network.caipNetworkId))
    );
  },

  async disconnect(namespace: ChainNamespace, isInternal = true) {
    const connection = baseState.connections.get(namespace);
    if (!connection) return;

    // Get the current connector from the adapter
    const connector = connection.adapter.connector;
    if (!connector) return;

    // Find all namespaces that use the same connector
    const namespacesUsingConnector = Array.from(baseState.connections.keys()).filter(
      ns => baseState.connections.get(ns)?.adapter.connector === connector
    );

    // Unsubscribe all event listeners from the adapter
    namespacesUsingConnector.forEach(ns => {
      const _connection = baseState.connections.get(ns);
      if (_connection?.adapter) {
        _connection.adapter.removeAllListeners();
      }
    });

    // Disconnect the adapter
    if (isInternal) {
      await connection.adapter.disconnect();
    }

    // Remove all namespaces that used this connector
    const newConnectionsMap = new Map(baseState.connections);
    namespacesUsingConnector.forEach(ns => {
      newConnectionsMap.delete(ns);
    });
    baseState.connections = newConnectionsMap;

    // Remove activeNamespace if it is in the list of namespaces using the connector
    if (
      baseState.activeNamespace &&
      (baseState.activeNamespace === namespace ||
        namespacesUsingConnector.includes(baseState.activeNamespace))
    ) {
      baseState.activeNamespace = undefined;
      StorageUtil.setActiveNamespace(undefined);
    }
  }
};
