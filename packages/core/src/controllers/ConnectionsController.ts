import { proxy, ref } from 'valtio';
import { derive } from 'valtio/utils';
import {
  EVMAdapter,
  type AppKitNetwork,
  type BlockchainAdapter,
  type CaipAddress,
  type CaipNetworkId,
  type ChainNamespace,
  type GetBalanceResponse,
  type WalletInfo,
  type ConnectionProperties,
  type AccountType
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
  properties?: ConnectionProperties;
  type?: AccountType;
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

// -- Helper Functions --------------------------------------------- //
const getActiveConnection = (snap: ConnectionsControllerState): Connection | undefined => {
  if (!snap.activeNamespace) return undefined;

  return snap.connections.get(snap.activeNamespace);
};

const hasValidAccounts = (connection: Connection): boolean => {
  return connection?.accounts && connection.accounts.length > 0;
};

const findSmartAccountForNetwork = (connection: Connection): CaipAddress | undefined => {
  return connection.properties?.smartAccounts?.find(account =>
    account.startsWith(connection.caipNetwork)
  );
};

const findEOAForNetwork = (connection: Connection): CaipAddress | undefined => {
  const smartAccounts = connection.properties?.smartAccounts || [];

  return connection.accounts.find(
    account => account.startsWith(connection.caipNetwork) && !smartAccounts.includes(account)
  );
};

const getActiveAddress = (connection: Connection): CaipAddress | undefined => {
  if (!hasValidAccounts(connection)) {
    return undefined;
  }

  // For smart accounts, prioritize smart account addresses
  if (connection.type === 'smartAccount') {
    const smartAccount = findSmartAccountForNetwork(connection);
    if (smartAccount) {
      return smartAccount;
    }
  }

  // Fall back to EOA or any account that matches the network
  return findEOAForNetwork(connection);
};

const derivedState = derive(
  {
    activeAddress: (get): CaipAddress | undefined => {
      const snap = get(baseState);
      const connection = getActiveConnection(snap);

      return connection ? getActiveAddress(connection) : undefined;
    },
    activeBalance: (get): Balance | undefined => {
      const snap = get(baseState);
      const connection = getActiveConnection(snap);

      if (!connection) {
        return undefined;
      }

      const activeAddress = getActiveAddress(connection);
      if (!activeAddress || !connection.balances || Object.keys(connection.balances).length === 0) {
        return undefined;
      }

      return connection.balances[activeAddress];
    },
    activeNetwork: (get): AppKitNetwork | undefined => {
      const snap = get(baseState);
      const connection = getActiveConnection(snap);

      if (!connection) return undefined;

      return snap.networks.find(
        network =>
          network.chainNamespace === snap.activeNamespace &&
          network.id?.toString() === connection.caipNetwork?.split(':')[1]
      );
    },
    activeCaipNetworkId: (get): CaipNetworkId | undefined => {
      const snap = get(baseState);
      const connection = getActiveConnection(snap);

      return connection?.caipNetwork;
    },
    accountType: (get): AccountType | undefined => {
      const snap = get(baseState);
      const connection = getActiveConnection(snap);

      return connection?.type;
    },
    connection: (get): Connection | undefined => {
      const snap = get(baseState);

      return getActiveConnection(snap);
    },
    walletInfo: (get): WalletInfo | undefined => {
      const snap = get(baseState);
      const connection = getActiveConnection(snap);

      return connection?.wallet;
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

  setConnection({
    accounts,
    adapter,
    caipNetwork,
    namespace,
    properties,
    wallet
  }: {
    accounts: CaipAddress[];
    adapter: BlockchainAdapter;
    caipNetwork: CaipNetworkId;
    namespace: ChainNamespace;
    properties?: ConnectionProperties;
    wallet?: WalletInfo;
  }) {
    const type: AccountType =
      properties?.smartAccounts?.length &&
      properties.smartAccounts.find(account => account.startsWith(caipNetwork))
        ? 'smartAccount'
        : 'eoa';

    const newConnectionEntry: Connection = {
      balances: {},
      caipNetwork,
      adapter: ref(adapter),
      accounts,
      wallet,
      properties,
      type
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

  setAccountType(namespace: ChainNamespace, type: AccountType) {
    const connection = baseState.connections.get(namespace);
    if (!connection) return;

    const newConnectionsMap = new Map(baseState.connections);
    newConnectionsMap.set(namespace, { ...connection, type });
    baseState.connections = newConnectionsMap;
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
  },

  parseUnits(value: string, decimals: number) {
    if (!baseState.activeNamespace) return undefined;

    return baseState.connections
      .get(baseState.activeNamespace)
      ?.adapter.parseUnits(value, decimals);
  },

  async signMessage(address: CaipAddress, message: string) {
    if (!baseState.activeNamespace) return undefined;

    const [namespace, chainId, plainAddress] = address.split(':');

    if (!namespace || namespace !== baseState.activeNamespace || !chainId || !plainAddress) {
      return undefined;
    }

    const adapter = baseState.connections.get(baseState.activeNamespace)?.adapter;

    if (adapter instanceof EVMAdapter && plainAddress && chainId) {
      return adapter.signMessage(plainAddress, message, chainId);
    }

    return undefined;
  },

  async sendTransaction(args: any) {
    if (!baseState.activeNamespace) return undefined;

    const adapter = baseState.connections.get(baseState.activeNamespace)?.adapter;

    if (adapter instanceof EVMAdapter) {
      return adapter.sendTransaction(args);
    }

    return undefined;
  },

  async estimateGas(args: any) {
    if (!baseState.activeNamespace || baseState.activeNamespace !== 'eip155') return undefined;

    const adapter = baseState.connections.get(baseState.activeNamespace)?.adapter;

    if (adapter instanceof EVMAdapter) {
      return adapter.estimateGas(args);
    }

    return undefined;
  }
};
