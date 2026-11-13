import { EventEmitter } from 'events';
import type { AppKitNetwork, WalletConnector } from '@reown/appkit-common-react-native';
import { mainnet, polygon } from 'viem/chains';
import { WagmiAdapter } from '../adapter';

// The `wagmi` package pulls in React; the connector only needs what it re-exports from @wagmi/core
jest.mock('wagmi', () => jest.requireActual('@wagmi/core'));

const ADDRESS_1 = '0x1111111111111111111111111111111111111111';
const ADDRESS_2 = '0x2222222222222222222222222222222222222222';

const polygonNetwork = {
  ...polygon,
  chainNamespace: 'eip155',
  caipNetworkId: `eip155:${polygon.id}`
} as unknown as AppKitNetwork;

type FakeProvider = EventEmitter & { request: jest.Mock };

const createWalletConnector = (address: string, { withAccounts = true } = {}) => {
  const provider = new EventEmitter() as FakeProvider;
  provider.request = jest.fn().mockResolvedValue(null);

  const connector = {
    getProvider: jest.fn(() => provider),
    getNamespaces: jest.fn(() =>
      withAccounts
        ? { eip155: { accounts: [`eip155:${mainnet.id}:${address}`], methods: [], events: [] } }
        : {}
    ),
    getChainId: jest.fn(() => `eip155:${mainnet.id}`),
    disconnect: jest.fn().mockResolvedValue(undefined)
  } as unknown as WalletConnector;

  return { connector, provider };
};

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

// Mirrors what AppKit does: subscribe to the adapter on init, and on `disconnect` run
// ConnectionsController.disconnect(namespace, false), which drops listeners and calls removeConnector()
const initLikeAppKit = async (adapter: WagmiAdapter, connector: WalletConnector) => {
  adapter.init({ connector });
  adapter.on('disconnect', () => {
    adapter.removeAllListeners();
    adapter.removeConnector();
  });
  await flush();
};

// The wallet ends the session (e.g. "disconnect" in the wallet UI)
const disconnectFromWallet = async (provider: FakeProvider) => {
  provider.emit('session_delete', { topic: 'topic' });
  await flush();
};

const createAdapter = () =>
  new WagmiAdapter({ networks: [mainnet, polygon], projectId: 'test-project-id' });

describe('WagmiAdapter', () => {
  let adapter: WagmiAdapter;

  beforeEach(() => {
    adapter = createAdapter();
  });

  afterEach(() => {
    adapter.removeAllListeners();
  });

  it('connects wagmi to the AppKit connector on init', async () => {
    const wallet = createWalletConnector(ADDRESS_1);

    await initLikeAppKit(adapter, wallet.connector);

    expect(adapter.wagmiConfig.state.status).toBe('connected');
    expect(adapter.wagmiConfig.connectors).toHaveLength(1);
  });

  it('sets up wagmi again after the wallet ends the session', async () => {
    const first = createWalletConnector(ADDRESS_1);
    const second = createWalletConnector(ADDRESS_2);

    await initLikeAppKit(adapter, first.connector);
    await disconnectFromWallet(first.provider);
    expect(adapter.wagmiConfig.state.status).toBe('disconnected');

    await initLikeAppKit(adapter, second.connector);

    expect(adapter.wagmiConfig.state.status).toBe('connected');
    const current = adapter.wagmiConfig.state.connections.get(adapter.wagmiConfig.state.current!);
    expect(current?.accounts).toEqual([ADDRESS_2]);

    await adapter.switchNetwork(polygonNetwork);

    expect(second.provider.request).toHaveBeenCalledWith({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x89' }]
    });
    expect(first.provider.request).not.toHaveBeenCalled();
  });

  it('clears the wagmi connection when the session is disconnected from another namespace', async () => {
    const first = createWalletConnector(ADDRESS_1);
    const second = createWalletConnector(ADDRESS_2);

    await initLikeAppKit(adapter, first.connector);

    // ConnectionsController.disconnect('solana') only calls removeConnector() on the EVM adapter
    adapter.removeAllListeners();
    adapter.removeConnector();

    expect(adapter.wagmiConfig.state.status).toBe('disconnected');
    expect(adapter.wagmiConfig.connectors).toHaveLength(0);
    await expect(adapter.switchNetwork(polygonNetwork)).rejects.toThrow('AppKit connector not set');

    await initLikeAppKit(adapter, second.connector);
    await adapter.switchNetwork(polygonNetwork);

    expect(second.provider.request).toHaveBeenCalledWith({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x89' }]
    });
    expect(first.provider.request).not.toHaveBeenCalled();
  });

  it('clears the wagmi connector when connecting wagmi fails', async () => {
    const unhandled = jest.fn();
    process.on('unhandledRejection', unhandled);

    try {
      // No accounts: UniversalConnector.connect rejects
      const wallet = createWalletConnector(ADDRESS_1, { withAccounts: false });

      await initLikeAppKit(adapter, wallet.connector);
      await flush();

      expect(unhandled).not.toHaveBeenCalled();
      expect(adapter.wagmiConfig.state.status).toBe('disconnected');
      expect(adapter.wagmiConfig.connectors).toHaveLength(0);
      await expect(adapter.switchNetwork(polygonNetwork)).rejects.toThrow(
        'AppKit connector not set'
      );
    } finally {
      process.off('unhandledRejection', unhandled);
    }
  });

  it('does not pile up wagmi connectors across connect / disconnect cycles', async () => {
    for (let i = 0; i < 3; i++) {
      const wallet = createWalletConnector(ADDRESS_1);

      await initLikeAppKit(adapter, wallet.connector);
      expect(adapter.wagmiConfig.connectors).toHaveLength(1);

      await disconnectFromWallet(wallet.provider);
      expect(adapter.wagmiConfig.connectors).toHaveLength(0);
    }
  });

  it('disconnects the wallet and wagmi when disconnecting from the app', async () => {
    const wallet = createWalletConnector(ADDRESS_1);

    await initLikeAppKit(adapter, wallet.connector);

    // ConnectionsController.disconnect(namespace) with isInternal = true
    adapter.removeAllListeners();
    await adapter.disconnect();
    adapter.removeConnector();

    expect(wallet.connector.disconnect).toHaveBeenCalledTimes(1);
    expect(adapter.wagmiConfig.state.status).toBe('disconnected');
    expect(adapter.wagmiConfig.connectors).toHaveLength(0);
    expect(adapter.connector).toBeUndefined();
  });
});
