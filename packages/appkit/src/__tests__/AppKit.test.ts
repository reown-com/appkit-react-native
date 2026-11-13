import {
  BlockchainApiController,
  ConnectionsController,
  LogController,
  ModalController,
  OptionsController,
  StorageUtil
} from '@reown/appkit-core-react-native';
import type {
  BlockchainAdapter,
  ChainNamespace,
  Namespaces,
  Network,
  Storage
} from '@reown/appkit-common-react-native';

import { AppKit } from '../AppKit';
import type { AppKitConfig } from '../types';

const mockInit = jest.fn();
const mockConnect = jest.fn();
const mockConnectorConstructor = jest.fn();
const mockDisconnect = jest.fn();

jest.mock('../connectors/WalletConnectConnector', () => ({
  WalletConnectConnector: jest.fn().mockImplementation(config => {
    mockConnectorConstructor(config);

    return {
      type: 'walletconnect',
      init: mockInit,
      connect: mockConnect,
      getNamespaces: jest.fn(() => ({})),
      getWalletInfo: jest.fn(),
      getProperties: jest.fn(),
      getChainId: jest.fn(() => 'eip155:1'),
      disconnect: mockDisconnect
    };
  })
}));

function createDeferred<T = void>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

const storage: Storage = {
  getKeys: jest.fn().mockResolvedValue([]),
  getEntries: jest.fn().mockResolvedValue([]),
  getItem: jest.fn().mockResolvedValue(undefined),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined)
};

const createConfig = (overrides?: Partial<AppKitConfig>): AppKitConfig => ({
  projectId: 'test-project-id',
  metadata: {
    name: 'Test',
    description: 'Test',
    url: 'https://test.com',
    icons: []
  },
  adapters: [],
  networks: [],
  storage,
  ...overrides
});

describe('AppKit initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInit.mockResolvedValue(undefined);
    ModalController.setLoading(false);
  });

  it('waits for the connector initialization when connecting during startup', async () => {
    const init = createDeferred();
    mockInit.mockReturnValueOnce(init.promise);
    mockConnect.mockRejectedValue(new Error('User rejected'));

    const appKit = new AppKit(createConfig());
    const connectPromise = appKit.connect();
    await flushPromises();

    expect(mockConnect).not.toHaveBeenCalled();

    init.resolve();

    await expect(connectPromise).rejects.toThrow('User rejected');
    expect(mockConnect).toHaveBeenCalledTimes(1);
    // The connect call shares the startup initialization instead of starting another one
    expect(mockConnectorConstructor).toHaveBeenCalledTimes(1);
  });

  it('clears the loading state and retries the initialization on connect when it fails', async () => {
    mockInit.mockRejectedValueOnce(new Error('Init failed'));
    mockConnect.mockRejectedValue(new Error('User rejected'));

    const appKit = new AppKit(createConfig());

    expect(ModalController.state.loading).toBe(true);

    await flushPromises();

    expect(ModalController.state.loading).toBe(false);

    await expect(appKit.connect()).rejects.toThrow('User rejected');
    // The same connector instance is initialized again instead of creating a new one
    expect(mockConnectorConstructor).toHaveBeenCalledTimes(1);
    expect(mockInit).toHaveBeenCalledTimes(2);
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });

  it('rejects connect when the controllers setup fails', async () => {
    const appKit = new AppKit(createConfig({ storage: undefined as unknown as Storage }));
    await flushPromises();

    expect(ModalController.state.loading).toBe(false);
    await expect(appKit.connect()).rejects.toThrow('AppKit: Storage is not set');
    expect(mockConnect).not.toHaveBeenCalled();
  });

  it('keeps the stored connections when the initialization fails', async () => {
    mockInit.mockRejectedValueOnce(new Error('Init failed'));
    jest
      .spyOn(StorageUtil, 'getConnectedConnectors')
      .mockResolvedValueOnce([{ type: 'walletconnect', namespaces: ['eip155'] }]);
    const removeSpy = jest.spyOn(StorageUtil, 'removeConnectedConnectors');

    expect(() => new AppKit(createConfig())).not.toThrow();
    await flushPromises();

    expect(removeSpy).not.toHaveBeenCalled();
    expect(ModalController.state.loading).toBe(false);
  });

  it('restores sessions after the controllers are set up', async () => {
    const siwx = { signOutOnDisconnect: false } as unknown as AppKitConfig['siwx'];
    const setSiwxSpy = jest.spyOn(OptionsController, 'setSiwx');
    const getConnectedSpy = jest.spyOn(StorageUtil, 'getConnectedConnectors');

    expect(() => new AppKit(createConfig({ siwx }))).not.toThrow();
    await flushPromises();

    expect(setSiwxSpy).toHaveBeenCalledWith(siwx);
    expect(getConnectedSpy).toHaveBeenCalled();
    expect(setSiwxSpy.mock.invocationCallOrder[0]).toBeLessThan(
      getConnectedSpy.mock.invocationCallOrder[0]!
    );
  });
});

const ACCOUNT = 'eip155:1:0x1234567890123456789012345678901234567890';

const mainnet = {
  id: 1,
  name: 'Ethereum',
  chainNamespace: 'eip155',
  caipNetworkId: 'eip155:1',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.test'] } }
} as unknown as Network;

const approvedNamespaces: Namespaces = {
  eip155: {
    accounts: [ACCOUNT],
    chains: ['eip155:1'],
    methods: [],
    events: []
  }
} as unknown as Namespaces;

const createAdapter = (namespace: ChainNamespace = 'eip155') => {
  let connector: { disconnect: () => Promise<void> } | undefined;

  return {
    supportedNamespace: namespace,
    get connector() {
      return connector;
    },
    init: jest.fn((params: { connector: typeof connector }) => {
      connector = params.connector;
    }),
    getSupportedNamespace: jest.fn(() => namespace),
    getAccounts: jest.fn(() => [ACCOUNT]),
    getBalance: jest.fn().mockResolvedValue({ amount: '0', symbol: 'ETH' }),
    on: jest.fn(),
    removeAllListeners: jest.fn(),
    removeConnector: jest.fn(() => {
      connector = undefined;
    }),
    disconnect: jest.fn(() => connector?.disconnect())
  };
};

describe('AppKit connect', () => {
  let setConnectedSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockInit.mockResolvedValue(undefined);
    mockDisconnect.mockResolvedValue(undefined);
    mockConnect.mockResolvedValue(approvedNamespaces);
    OptionsController.setSiwx(undefined);
    ModalController.setLoading(false);
    setConnectedSpy = jest.spyOn(StorageUtil, 'setConnectedConnectors').mockResolvedValue();
    jest.spyOn(StorageUtil, 'getConnectedConnectors').mockResolvedValue([]);
    jest.spyOn(BlockchainApiController, 'fetchIdentity').mockResolvedValue(undefined as any);
  });

  afterEach(async () => {
    for (const namespace of ConnectionsController.state.connections.keys()) {
      await ConnectionsController.disconnect(namespace, false);
    }
    jest.restoreAllMocks();
  });

  const createAppKit = async (adapter = createAdapter()) => {
    const appKit = new AppKit(
      createConfig({
        adapters: [adapter as unknown as BlockchainAdapter],
        networks: [mainnet]
      })
    );
    await flushPromises();

    return appKit;
  };

  it('is connected and stores the connector when connect resolves', async () => {
    const appKit = await createAppKit();

    await appKit.connect();

    expect(ConnectionsController.state.isConnected).toBe(true);
    expect(ConnectionsController.state.activeAddress).toBe(ACCOUNT);
    expect(setConnectedSpy).toHaveBeenCalledWith({
      type: 'walletconnect',
      namespaces: ['eip155']
    });
  });

  it('rejects and saves nothing when setting up the connection fails', async () => {
    const adapter = createAdapter();
    adapter.init.mockImplementation(() => {
      throw new Error('Adapter setup failed');
    });
    const appKit = await createAppKit(adapter);

    await expect(appKit.connect()).rejects.toThrow('Adapter setup failed');

    expect(setConnectedSpy).not.toHaveBeenCalled();
    expect(ConnectionsController.state.isConnected).toBe(false);
    // The wallet approved the session, so it's closed
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it('rejects and closes the session when no adapter matches the approved namespaces', async () => {
    mockConnect.mockResolvedValue({
      solana: {
        accounts: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:abc'],
        chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
        methods: [],
        events: []
      }
    });
    const appKit = await createAppKit();

    await expect(appKit.connect()).rejects.toThrow(/No compatible adapters/);

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
    expect(setConnectedSpy).not.toHaveBeenCalled();
    expect(ConnectionsController.state.isConnected).toBe(false);
  });

  it('keeps the original error when closing the session fails', async () => {
    const adapter = createAdapter();
    adapter.init.mockImplementation(() => {
      throw new Error('Adapter setup failed');
    });
    mockDisconnect.mockRejectedValue(new Error('Disconnect failed'));
    const appKit = await createAppKit(adapter);

    await expect(appKit.connect()).rejects.toThrow('Adapter setup failed');
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it('removes the half-set connection when a later step fails', async () => {
    const appKit = await createAppKit();
    // Fails after the connection is stored in ConnectionsController
    jest.spyOn(ModalController, 'close').mockImplementationOnce(() => {
      throw new Error('Close failed');
    });

    await expect(appKit.connect()).rejects.toThrow('Close failed');

    expect(ConnectionsController.state.connections.size).toBe(0);
    expect(ConnectionsController.state.isConnected).toBe(false);
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
    expect(setConnectedSpy).not.toHaveBeenCalled();
  });

  it('resolves without waiting for the balance and logs its error', async () => {
    const adapter = createAdapter();
    const balanceError = new Error('Balance failed');
    adapter.getBalance.mockRejectedValue(balanceError);
    const sendErrorSpy = jest.spyOn(LogController, 'sendError');
    const appKit = await createAppKit(adapter);

    await expect(appKit.connect()).resolves.toBeUndefined();
    await flushPromises();

    expect(adapter.getBalance).toHaveBeenCalled();
    expect(ConnectionsController.state.isConnected).toBe(true);
    expect(sendErrorSpy).toHaveBeenCalledWith(balanceError, 'AppKit.ts', 'syncNativeBalance');
  });

  it('waits for the SIWX sessions check before resolving', async () => {
    const sessions = createDeferred<unknown[]>();
    const siwx = {
      getSessions: jest.fn(() => sessions.promise),
      signOutOnDisconnect: false
    } as unknown as AppKitConfig['siwx'];
    const adapter = createAdapter();
    const appKit = new AppKit(
      createConfig({
        adapters: [adapter as unknown as BlockchainAdapter],
        networks: [mainnet],
        siwx
      })
    );
    await flushPromises();

    let resolved = false;
    const connectPromise = appKit.connect().then(() => {
      resolved = true;
    });
    await flushPromises();

    expect(siwx!.getSessions).toHaveBeenCalled();
    expect(resolved).toBe(false);

    sessions.resolve([{}]);
    await connectPromise;

    expect(resolved).toBe(true);
    expect(setConnectedSpy).toHaveBeenCalled();
  });

  it("doesn't store the connector when the SIWX check disconnects it", async () => {
    const siwx = {
      getSessions: jest.fn().mockRejectedValue(new Error('Sessions failed')),
      signOutOnDisconnect: false
    } as unknown as AppKitConfig['siwx'];
    const adapter = createAdapter();
    const appKit = new AppKit(
      createConfig({
        adapters: [adapter as unknown as BlockchainAdapter],
        networks: [mainnet],
        siwx
      })
    );
    await flushPromises();

    await appKit.connect();

    expect(ConnectionsController.state.isConnected).toBe(false);
    expect(setConnectedSpy).not.toHaveBeenCalled();
  });
});
