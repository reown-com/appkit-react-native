/**
 * Connection lifecycle tests: connect, wallet events, restore and disconnect, with real event emitters.
 * The adapter, connectors and provider are fakes from `@reown/appkit-common-react-native`'s fixtures.
 */
import {
  BlockchainApiController,
  ConnectionsController,
  ModalController,
  OptionsController,
  RouterController,
  StorageUtil,
  TransactionsController
} from '@reown/appkit-core-react-native';
import type { AppKitNetwork, Namespaces, Storage } from '@reown/appkit-common-react-native';

import { FakeAdapter, FakeConnector } from '@shared-test-utils/adapterFakes';
import { AppKit } from '../AppKit';
import type { AppKitConfig } from '../types';

const ADDRESS = '0x1234567890123456789012345678901234567890';
const OTHER_ADDRESS = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

const createNamespaces = (accounts: string[] = []): Namespaces =>
  ({
    eip155: {
      accounts: [`eip155:1:${ADDRESS}`, `eip155:137:${ADDRESS}`, ...accounts],
      chains: ['eip155:1', 'eip155:137'],
      methods: [],
      events: []
    }
  }) as Namespaces;

// Holds the WalletConnect connector the mocked module returns. Set in beforeEach.
const mockWc: { connector?: FakeConnector } = {};

jest.mock('../connectors/WalletConnectConnector', () => ({
  WalletConnectConnector: jest.fn().mockImplementation(() => mockWc.connector)
}));

const network = (id: number, name: string) =>
  ({
    id,
    name,
    chainNamespace: 'eip155',
    caipNetworkId: `eip155:${id}`,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://rpc.test'] } }
  }) as unknown as AppKitNetwork;

const mainnet = network(1, 'Ethereum');
const polygon = network(137, 'Polygon');

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

const storage: Storage = {
  getKeys: jest.fn().mockResolvedValue([]),
  getEntries: jest.fn().mockResolvedValue([]),
  getItem: jest.fn().mockResolvedValue(undefined),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined)
};

const createAppKit = async (adapter: FakeAdapter, overrides?: Partial<AppKitConfig>) => {
  const appKit = new AppKit({
    projectId: 'test-project-id',
    metadata: { name: 'Test', description: 'Test', url: 'https://test.com', icons: [] },
    adapters: [adapter],
    networks: [mainnet, polygon],
    storage,
    ...overrides
  });
  await flushPromises();

  return appKit;
};

describe('AppKit connection lifecycle', () => {
  let adapter: FakeAdapter;
  let getConnectedSpy: jest.SpyInstance;
  let removeConnectedSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new FakeAdapter('eip155');
    mockWc.connector = new FakeConnector({ type: 'walletconnect', namespaces: createNamespaces() });
    OptionsController.setSiwx(undefined);
    ModalController.setLoading(false);
    jest.spyOn(StorageUtil, 'setConnectedConnectors').mockResolvedValue();
    getConnectedSpy = jest.spyOn(StorageUtil, 'getConnectedConnectors').mockResolvedValue([]);
    removeConnectedSpy = jest.spyOn(StorageUtil, 'removeConnectedConnectors').mockResolvedValue();
    jest.spyOn(BlockchainApiController, 'fetchIdentity').mockResolvedValue(undefined as any);
    // A chain change fetches the account history, which would call the real API
    jest.spyOn(TransactionsController, 'fetchTransactions').mockResolvedValue();
  });

  afterEach(async () => {
    for (const namespace of ConnectionsController.state.connections.keys()) {
      await ConnectionsController.disconnect(namespace, false);
    }
    jest.restoreAllMocks();
  });

  const provider = () => mockWc.connector!.fakeProvider;

  describe('wallet events', () => {
    it('updates the accounts when the wallet changes accounts', async () => {
      mockWc.connector = new FakeConnector({
        type: 'walletconnect',
        namespaces: createNamespaces([`eip155:1:${OTHER_ADDRESS}`])
      });
      const appKit = await createAppKit(adapter);
      await appKit.connect();

      provider().emit('accountsChanged', [OTHER_ADDRESS]);
      await flushPromises();

      expect(ConnectionsController.state.connections.get('eip155')?.accounts).toEqual([
        `eip155:1:${OTHER_ADDRESS}`
      ]);
    });

    it('switches the active network when the wallet changes to a supported chain', async () => {
      const appKit = await createAppKit(adapter);
      await appKit.connect();

      provider().emit('chainChanged', '137');
      await flushPromises();

      expect(ConnectionsController.state.activeNetwork?.id).toBe(137);
    });

    it('shows the unsupported chain view when the wallet changes to an unknown chain', async () => {
      // An unsupported chain the wallet approved, so the adapter forwards the event
      mockWc.connector = new FakeConnector({
        type: 'walletconnect',
        namespaces: createNamespaces([`eip155:56:${ADDRESS}`])
      });
      const appKit = await createAppKit(adapter);
      await appKit.connect();

      provider().emit('chainChanged', '56');
      await flushPromises();

      expect(RouterController.state.view).toBe('UnsupportedChain');
      expect(ConnectionsController.state.connections.get('eip155')?.caipNetwork).toBe('eip155:56');
    });

    it('disconnects and forgets the stored connector when the wallet ends the session', async () => {
      const appKit = await createAppKit(adapter);
      await appKit.connect();

      provider().emit('disconnect');
      await flushPromises();

      expect(ConnectionsController.state.isConnected).toBe(false);
      expect(removeConnectedSpy).toHaveBeenCalledWith('walletconnect');
      // Ended by the wallet, so the session isn't closed again from the app
      expect(provider().disconnect).not.toHaveBeenCalled();
    });
  });

  describe('listeners', () => {
    const expectSingleSubscription = () => {
      for (const event of ['accountsChanged', 'chainChanged', 'disconnect', 'balanceChanged']) {
        expect({ event, count: adapter.listenerCount(event) }).toEqual({ event, count: 1 });
      }
      for (const event of ['accountsChanged', 'chainChanged', 'disconnect']) {
        expect({ event, count: provider().listenerCount(event) }).toEqual({ event, count: 1 });
      }
    };

    it('subscribes once per event after connect', async () => {
      const appKit = await createAppKit(adapter);
      await appKit.connect();

      expectSingleSubscription();
    });

    it("doesn't stack listeners when connecting again without disconnecting", async () => {
      const appKit = await createAppKit(adapter);
      await appKit.connect();
      await appKit.connect();
      await appKit.connect();

      expectSingleSubscription();
    });

    it('runs the disconnect flow once after connecting twice', async () => {
      const disconnectSpy = jest.spyOn(ConnectionsController, 'disconnect');
      const appKit = await createAppKit(adapter);
      await appKit.connect();
      await appKit.connect();

      provider().emit('disconnect');
      await flushPromises();

      expect(disconnectSpy).toHaveBeenCalledTimes(1);
      expect(removeConnectedSpy).toHaveBeenCalledTimes(1);
    });

    it("doesn't stack listeners when two stored connectors share a namespace", async () => {
      const coinbase = new FakeConnector({ type: 'coinbase', namespaces: createNamespaces() });
      getConnectedSpy.mockResolvedValue([
        { type: 'coinbase', namespaces: ['eip155'] },
        { type: 'walletconnect', namespaces: ['eip155'] }
      ]);

      await createAppKit(adapter, { extraConnectors: [coinbase] });

      expect(adapter.listenerCount('disconnect')).toBe(1);
      expect(adapter.listenerCount('chainChanged')).toBe(1);
    });

    it('subscribes again after a disconnect and reconnect', async () => {
      const appKit = await createAppKit(adapter);
      await appKit.connect();
      await appKit.disconnect();

      expect(adapter.listenerCount('disconnect')).toBe(0);
      expect(provider().listenerCount('disconnect')).toBe(0);

      await appKit.connect();

      expectSingleSubscription();
      expect(ConnectionsController.state.isConnected).toBe(true);
    });
  });

  describe('restore', () => {
    it('restores a stored connection on startup', async () => {
      getConnectedSpy.mockResolvedValue([{ type: 'walletconnect', namespaces: ['eip155'] }]);

      await createAppKit(adapter);

      expect(ConnectionsController.state.isConnected).toBe(true);
      expect(ConnectionsController.state.activeAddress).toBe(`eip155:1:${ADDRESS}`);
      expect(ModalController.state.loading).toBe(false);
    });

    it('removes only the stored connector that fails to restore', async () => {
      const coinbase = new FakeConnector({ type: 'coinbase', namespaces: createNamespaces() });
      coinbase.init = jest.fn().mockRejectedValue(new Error('Coinbase init failed'));
      getConnectedSpy.mockResolvedValue([
        { type: 'coinbase', namespaces: ['eip155'] },
        { type: 'walletconnect', namespaces: ['eip155'] }
      ]);

      await createAppKit(adapter, { extraConnectors: [coinbase] });

      expect(removeConnectedSpy).toHaveBeenCalledTimes(1);
      expect(removeConnectedSpy).toHaveBeenCalledWith('coinbase');
      expect(ConnectionsController.state.isConnected).toBe(true);
    });
  });

  describe('switchNetwork', () => {
    it('only changes the default network when not connected', async () => {
      const appKit = await createAppKit(adapter);

      await appKit.switchNetwork(polygon);

      expect(adapter.switchNetwork).not.toHaveBeenCalled();
      expect(OptionsController.state.defaultNetwork?.id).toBe(137);
    });

    it('switches through the adapter and updates the active network when connected', async () => {
      const appKit = await createAppKit(adapter);
      await appKit.connect();

      await appKit.switchNetwork('eip155:137');

      expect(adapter.switchNetwork).toHaveBeenCalledWith(expect.objectContaining({ id: 137 }));
      expect(ConnectionsController.state.activeNetwork?.id).toBe(137);
    });

    it('keeps the current network when the wallet rejects the switch', async () => {
      const appKit = await createAppKit(adapter);
      await appKit.connect();
      adapter.switchNetwork.mockRejectedValueOnce(new Error('User rejected'));

      await expect(appKit.switchNetwork(polygon)).rejects.toThrow('User rejected');

      expect(ConnectionsController.state.activeNetwork?.id).toBe(1);
    });

    it('rejects an unknown network', async () => {
      const appKit = await createAppKit(adapter);

      await expect(appKit.switchNetwork('eip155:999' as any)).rejects.toThrow('Network not found');
    });
  });

  describe('disconnect', () => {
    it('closes the session, clears the connection and the stored connector', async () => {
      const appKit = await createAppKit(adapter);
      await appKit.connect();

      await appKit.disconnect();

      expect(provider().disconnect).toHaveBeenCalledTimes(1);
      expect(ConnectionsController.state.isConnected).toBe(false);
      expect(ConnectionsController.state.connections.size).toBe(0);
      expect(adapter.connector).toBeUndefined();
      expect(removeConnectedSpy).toHaveBeenCalledWith('walletconnect');
      expect(RouterController.state.view).toBe('Connect');
    });
  });

  describe('setup', () => {
    it('rejects two adapters for the same namespace', () => {
      expect(
        () =>
          new AppKit({
            projectId: 'test-project-id',
            metadata: { name: 'Test', description: 'Test', url: 'https://test.com', icons: [] },
            adapters: [new FakeAdapter('eip155'), new FakeAdapter('eip155')],
            networks: [mainnet],
            storage
          })
      ).toThrow(/Duplicate adapter for namespace 'eip155'/);
    });
  });
});
