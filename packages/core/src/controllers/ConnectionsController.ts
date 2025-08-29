import { proxy, ref } from 'valtio';
import { derive } from 'derive-valtio';
import {
  EVMAdapter,
  type AppKitNetwork,
  type BlockchainAdapter,
  type CaipAddress,
  type CaipNetworkId,
  type ChainNamespace,
  type Balance,
  type WalletInfo,
  type ConnectionProperties,
  type AccountType,
  type Connection,
  SolanaBaseAdapter,
  type Identity
} from '@reown/appkit-common-react-native';
import { StorageUtil } from '../utils/StorageUtil';
import { BlockchainApiController } from './BlockchainApiController';
import { SnackController } from './SnackController';
import { CoreHelperUtil } from '../utils/CoreHelperUtil';

// -- Types --------------------------------------------- //
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

const updateConnection = (
  namespace: ChainNamespace,
  connection: Connection,
  updates: Partial<Connection>
) => {
  if (!connection) return;
  const newConnectionsMap = new Map(baseState.connections);
  newConnectionsMap.set(namespace, { ...connection, ...updates });
  baseState.connections = newConnectionsMap;
};

const getActiveIdentity = (connection: Connection): Identity | undefined => {
  const activeAddress = getActiveAddress(connection);
  if (!activeAddress) return undefined;

  return connection.identities?.get(activeAddress);
};

const derivedState = derive(
  {
    isConnected: (get): boolean => {
      const snap = get(baseState);

      return !!snap.activeNamespace && !!snap.connections.size;
    },
    activeAddress: (get): CaipAddress | undefined => {
      const snap = get(baseState);
      const connection = getActiveConnection(snap);

      return connection ? getActiveAddress(connection) : undefined;
    },
    identity: (get): Identity | undefined => {
      const snap = get(baseState);
      const connection = getActiveConnection(snap);

      return connection ? getActiveIdentity(connection) : undefined;
    },
    activeBalance: (get): Balance | undefined => {
      const snap = get(baseState);
      const connection = getActiveConnection(snap);

      if (!connection) {
        return undefined;
      }

      const activeAddress = getActiveAddress(connection);
      if (!activeAddress || !connection.balances || connection.balances.size === 0) {
        return undefined;
      }

      const addressBalances = connection.balances.get(activeAddress);
      if (!addressBalances || addressBalances.length === 0) {
        return undefined;
      }

      // Return the native token (first balance without address)
      const nativeToken = addressBalances.find(balance => !balance.address);
      if (nativeToken) {
        return nativeToken;
      }

      // Fallback to first available balance
      return addressBalances[0];
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
    balances: (get): Balance[] | undefined => {
      const snap = get(baseState);

      const _connection = getActiveConnection(snap);

      if (!_connection) {
        return undefined;
      }

      const _activeAddress = getActiveAddress(_connection);

      if (!_activeAddress) return [];

      return (
        _connection?.balances
          .get(_activeAddress)
          // Filter out tokens with no quantity
          ?.filter(balance => balance?.quantity?.numeric)
      );
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
      balances: new Map<CaipAddress, Balance[]>(),
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
      console.warn(`No connection found for namespace: ${namespace}`);

      return;
    }
    const newBalances = new Map(connection.balances);
    const existingBalances = connection.balances.get(address) || [];
    // Check if this token already exists by contract address or symbol
    const existingIndex = existingBalances.findIndex(existingBalance => {
      if (balance.address) {
        return existingBalance.address === balance.address;
      }

      return existingBalance.symbol === balance.symbol;
    });
    let updatedBalances: Balance[];
    if (existingIndex >= 0) {
      // Update existing token
      updatedBalances = [...existingBalances];
      updatedBalances[existingIndex] = {
        ...updatedBalances[existingIndex],
        ...balance
      };
    } else {
      // Add new token
      updatedBalances = [...existingBalances, balance];
    }
    newBalances.set(address, updatedBalances);
    updateConnection(namespace, connection, { balances: newBalances });
  },

  updateIdentity(
    namespace: ChainNamespace,
    connection: Connection,
    plainAddress: string,
    identity: Identity
  ) {
    const accounts = connection.accounts.filter(
      account => CoreHelperUtil.getPlainAddress(account) === plainAddress
    );

    if (accounts.length > 0) {
      const newIdentities = new Map(connection.identities || []);
      let hasChanges = false;

      accounts.forEach(account => {
        const existingIdentity = newIdentities.get(account);
        if (!existingIdentity || existingIdentity.name !== identity.name) {
          newIdentities.set(account, identity);
          hasChanges = true;
        }
      });

      if (hasChanges) {
        updateConnection(namespace, connection, { identities: newIdentities });
      }
    }
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
    const newConnection = { ...connection, type };
    newConnectionsMap.set(namespace, newConnection);
    baseState.connections = newConnectionsMap;

    return getActiveAddress(newConnection);
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
    if (adapter instanceof EVMAdapter || adapter instanceof SolanaBaseAdapter) {
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
  },

  async writeContract(args: any) {
    if (!baseState.activeNamespace) return undefined;

    const adapter = baseState.connections.get(baseState.activeNamespace)?.adapter;
    if (adapter instanceof EVMAdapter) {
      return adapter.writeContract(args);
    }

    return undefined;
  },

  async fetchBalance(forceUpdateAddresses?: CaipAddress[]) {
    const connection = getActiveConnection(baseState);
    if (!connection) {
      throw new Error('No active connection found for balance fetch');
    }

    const chainId = connection.caipNetwork;
    const address = getActiveAddress(connection);
    const namespace = baseState.activeNamespace;
    if (!namespace || !address || !chainId) {
      throw new Error('Missing required data for balance fetch');
    }

    try {
      const response = await BlockchainApiController.getBalance(address, forceUpdateAddresses);
      if (!response) {
        throw new Error('Failed to fetch token balance');
      }
      // Update balances for each token in the response
      response.balances.forEach(balance => {
        this.updateBalance(namespace, address, {
          name: balance.name,
          symbol: balance.symbol,
          amount: balance.quantity.numeric,
          address: balance.address,
          quantity: balance.quantity,
          price: balance.price,
          value: balance.value,
          iconUrl: balance.iconUrl
        });
      });
    } catch (error) {
      SnackController.showError('Failed to get account balance');
    }
  },

  getSmartAccountEnabledNetworks(): AppKitNetwork[] {
    const activeConnection = getActiveConnection(baseState);
    if (!activeConnection) {
      return [];
    }
    if (!activeConnection.properties?.smartAccounts?.length) {
      return [];
    }
    const smartAccountNetworks = new Set<CaipNetworkId>();
    activeConnection.properties.smartAccounts.forEach(smartAccount => {
      const parts = smartAccount.split(':');
      if (parts.length >= 2) {
        const networkId: CaipNetworkId = `${parts[0]}:${parts[1]}`;
        smartAccountNetworks.add(networkId);
      }
    });

    return baseState.networks.filter(network => {
      const networkId: CaipNetworkId = `${network.chainNamespace}:${network.id}`;

      return smartAccountNetworks.has(networkId);
    });
  }
};
