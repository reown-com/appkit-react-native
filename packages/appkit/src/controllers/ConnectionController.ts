import { proxy } from 'valtio';
import type { BlockchainAdapter } from '../adapters/types';

interface ConnectionState {
  accounts: string[];
  balances: Record<string, string>;
  activeChainId: string;
  adapter: BlockchainAdapter;
}

interface State {
  activeNamespace: string;
  connections: Record<string, ConnectionState>;
}

const state = proxy<State>({
  activeNamespace: 'eip155',
  connections: {}
});

function setActiveNamespace(namespace: string) {
  state.activeNamespace = namespace;
}

function storeConnection(
  namespace: string,
  adapter: BlockchainAdapter,
  accounts: string[] = [],
  chainId: string = ''
) {
  state.connections[namespace] = {
    accounts,
    balances: {},
    activeChainId: chainId,
    adapter
  };
}

function updateAccounts(namespace: string, accounts: string[]) {
  const connection = state.connections[namespace];
  if (!connection) {
    return;
  }
  connection.accounts = accounts;
}

function updateBalances(namespace: string, balances: Record<string, string>) {
  const connection = state.connections[namespace];
  if (!connection) {
    return;
  }
  connection.balances = balances;
}

function updateChainId(namespace: string, chainId: string) {
  const connection = state.connections[namespace];
  if (!connection) {
    return;
  }
  connection.activeChainId = chainId;
}

async function disconnect(namespace: string) {
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
}

export const ConnectionController = {
  state,
  setActiveNamespace,
  storeConnection,
  updateAccounts,
  updateBalances,
  updateChainId,
  disconnect
};
