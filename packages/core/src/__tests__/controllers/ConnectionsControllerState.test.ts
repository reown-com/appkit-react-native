import type {
  AppKitNetwork,
  BlockchainAdapter,
  CaipAddress,
  Storage
} from '@reown/appkit-common-react-native';

type Core = typeof import('../../index');

// -- Fixtures -----------------------------------------------------------------
const EVM_EOA: CaipAddress = 'eip155:1:0x0000000000000000000000000000000000000001';
const EVM_EOA_POLYGON: CaipAddress = 'eip155:137:0x0000000000000000000000000000000000000001';
const EVM_SMART: CaipAddress = 'eip155:1:0x00000000000000000000000000000000000000aa';
const SOL_ADDRESS: CaipAddress =
  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:11111111111111111111111111111111';

function network(
  chainNamespace: AppKitNetwork['chainNamespace'],
  id: string | number
): AppKitNetwork {
  return {
    id,
    name: `${chainNamespace}:${id}`,
    chainNamespace,
    caipNetworkId: `${chainNamespace}:${id}`,
    nativeCurrency: { name: 'Token', symbol: 'TKN', decimals: 18 },
    rpcUrls: { default: { http: [] } }
  } as unknown as AppKitNetwork;
}

// Rebuilt for every test: valtio proxies the objects it is given, and each test
// loads a fresh copy of the controllers.
let MAINNET: AppKitNetwork;
let POLYGON: AppKitNetwork;
let BASE: AppKitNetwork;
let SOLANA: AppKitNetwork;

function createAdapter() {
  return {
    connector: { type: 'walletconnect' },
    removeAllListeners: jest.fn(),
    disconnect: jest.fn().mockResolvedValue(undefined),
    removeConnector: jest.fn()
  } as unknown as BlockchainAdapter;
}

function createStorage(): Storage {
  const data = new Map<string, unknown>();

  return {
    getKeys: jest.fn(async () => Array.from(data.keys())),
    getEntries: jest.fn(async () => Array.from(data.entries()) as [string, any][]),
    getItem: jest.fn(async (key: string) => data.get(key) as any),
    setItem: jest.fn(async (key: string, value: unknown) => {
      data.set(key, value);
    }),
    removeItem: jest.fn(async (key: string) => {
      data.delete(key);
    })
  };
}

const flush = () => new Promise(resolve => setImmediate(resolve));

// Each test gets fresh controller state (ConnectionsController has no reset).
let core: Core;
let storage: Storage;

beforeEach(() => {
  MAINNET = network('eip155', 1);
  POLYGON = network('eip155', 137);
  BASE = network('eip155', 8453);
  SOLANA = network('solana', '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp');
  jest.isolateModules(() => {
    core = require('../../index');
  });
  storage = createStorage();
  core.OptionsController.setStorage(storage);
  jest.spyOn(core.LogController, 'sendError').mockImplementation(() => {});
  jest.spyOn(core.SnackController, 'showError').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

function connectEvm(
  overrides: Partial<Parameters<Core['ConnectionsController']['setConnection']>[0]> = {}
) {
  core.ConnectionsController.setConnection({
    namespace: 'eip155',
    adapter: createAdapter(),
    accounts: [EVM_EOA, EVM_EOA_POLYGON],
    caipNetwork: 'eip155:1',
    ...overrides
  });
}

// -- Derived state ------------------------------------------------------------
describe('ConnectionsController derived state', () => {
  it('starts disconnected', async () => {
    const { state } = core.ConnectionsController;

    expect(state.isConnected).toBe(false);
    expect(state.activeAddress).toBeUndefined();
    expect(state.activeNetwork).toBeUndefined();
    expect(state.connection).toBeUndefined();
  });

  it('is not connected until a namespace is active', async () => {
    connectEvm();
    await flush();
    expect(core.ConnectionsController.state.isConnected).toBe(false);

    core.ConnectionsController.setActiveNamespace('eip155');
    await flush();
    expect(core.ConnectionsController.state.isConnected).toBe(true);
  });

  it('is not connected with an active namespace but no connections', async () => {
    core.ConnectionsController.setActiveNamespace('eip155');

    await flush();
    expect(core.ConnectionsController.state.isConnected).toBe(false);
  });

  it('is not connected when the active namespace has no connection', async () => {
    connectEvm();
    core.ConnectionsController.setActiveNamespace('solana');

    await flush();
    expect(core.ConnectionsController.state.isConnected).toBe(false);
    expect(core.ConnectionsController.state.activeAddress).toBeUndefined();
  });

  it('uses the account that matches the active network', async () => {
    connectEvm({ caipNetwork: 'eip155:137' });
    core.ConnectionsController.setActiveNamespace('eip155');

    await flush();
    expect(core.ConnectionsController.state.activeAddress).toBe(EVM_EOA_POLYGON);
    expect(core.ConnectionsController.state.activeCaipNetworkId).toBe('eip155:137');
  });

  it('has no active address when no account matches the active network', async () => {
    connectEvm({ caipNetwork: 'eip155:8453' });
    core.ConnectionsController.setActiveNamespace('eip155');

    await flush();
    expect(core.ConnectionsController.state.activeAddress).toBeUndefined();
  });

  it('has no active address when the connection has no accounts', async () => {
    connectEvm({ accounts: [] });
    core.ConnectionsController.setActiveNamespace('eip155');

    await flush();
    expect(core.ConnectionsController.state.activeAddress).toBeUndefined();
  });

  it('prefers the smart account on networks that have one', async () => {
    connectEvm({
      accounts: [EVM_EOA, EVM_SMART],
      properties: { smartAccounts: [EVM_SMART] }
    });
    core.ConnectionsController.setActiveNamespace('eip155');

    await flush();
    expect(core.ConnectionsController.state.accountType).toBe('smartAccount');
    expect(core.ConnectionsController.state.activeAddress).toBe(EVM_SMART);
  });

  it('uses the EOA when the account type is switched to eoa', async () => {
    connectEvm({
      accounts: [EVM_EOA, EVM_SMART],
      properties: { smartAccounts: [EVM_SMART] }
    });
    core.ConnectionsController.setActiveNamespace('eip155');

    const address = core.ConnectionsController.setAccountType('eip155', 'eoa');

    await flush();
    expect(address).toBe(EVM_EOA);
    expect(core.ConnectionsController.state.activeAddress).toBe(EVM_EOA);
  });

  it('is an eoa connection when the smart account is on another network', async () => {
    connectEvm({
      accounts: [EVM_EOA],
      properties: { smartAccounts: ['eip155:137:0x00000000000000000000000000000000000000aa'] }
    });
    core.ConnectionsController.setActiveNamespace('eip155');

    await flush();
    expect(core.ConnectionsController.state.accountType).toBe('eoa');
    expect(core.ConnectionsController.state.activeAddress).toBe(EVM_EOA);
  });

  it('does not use an account from a network whose id starts with the active one', async () => {
    // eip155:137 starts with eip155:1, but it is a different network
    connectEvm({ accounts: [EVM_EOA_POLYGON], caipNetwork: 'eip155:1' });
    core.ConnectionsController.setActiveNamespace('eip155');

    await flush();
    expect(core.ConnectionsController.state.activeAddress).toBeUndefined();
  });

  it('resolves the active network from the configured networks', async () => {
    core.ConnectionsController.setNetworks([MAINNET, POLYGON, SOLANA]);
    connectEvm({ caipNetwork: 'eip155:137' });
    core.ConnectionsController.setActiveNamespace('eip155');

    await flush();
    expect(core.ConnectionsController.state.activeNetwork).toEqual(POLYGON);
  });

  it('has no active network when the connected network is not configured', async () => {
    core.ConnectionsController.setNetworks([MAINNET]);
    connectEvm({ caipNetwork: 'eip155:137' });
    core.ConnectionsController.setActiveNamespace('eip155');

    await flush();
    expect(core.ConnectionsController.state.activeNetwork).toBeUndefined();
  });

  it('follows the active namespace across connections', async () => {
    core.ConnectionsController.setNetworks([MAINNET, SOLANA]);
    connectEvm();
    core.ConnectionsController.setConnection({
      namespace: 'solana',
      adapter: createAdapter(),
      accounts: [SOL_ADDRESS],
      caipNetwork: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
    });

    core.ConnectionsController.setActiveNamespace('solana');
    await flush();
    expect(core.ConnectionsController.state.activeAddress).toBe(SOL_ADDRESS);
    expect(core.ConnectionsController.state.activeNetwork).toEqual(SOLANA);

    core.ConnectionsController.setActiveNamespace('eip155');
    await flush();
    expect(core.ConnectionsController.state.activeAddress).toBe(EVM_EOA);
    expect(core.ConnectionsController.state.activeNetwork).toEqual(MAINNET);
  });
});

// -- Networks -----------------------------------------------------------------
describe('ConnectionsController networks', () => {
  beforeEach(() => {
    core.ConnectionsController.setNetworks([MAINNET, POLYGON, BASE, SOLANA]);
  });

  it('offers every configured network when disconnected', async () => {
    expect(core.ConnectionsController.getAvailableNetworks()).toEqual([
      MAINNET,
      POLYGON,
      BASE,
      SOLANA
    ]);
  });

  it('offers only networks the connected accounts support', async () => {
    connectEvm();
    core.ConnectionsController.setActiveNamespace('eip155');

    expect(core.ConnectionsController.getAvailableNetworks()).toEqual([MAINNET, POLYGON]);
  });

  it('does not offer a network whose id is a prefix of a connected one', async () => {
    // Connected on eip155:137 only; eip155:1 must not match it
    connectEvm({ accounts: [EVM_EOA_POLYGON], caipNetwork: 'eip155:137' });
    core.ConnectionsController.setActiveNamespace('eip155');

    expect(core.ConnectionsController.getAvailableNetworks()).toEqual([POLYGON]);
    expect(core.ConnectionsController.getConnectedNetworks()).toEqual([POLYGON]);
  });

  it('offers every EVM network when the wallet can add chains', async () => {
    connectEvm({ accounts: [EVM_EOA], properties: { canAddEvmChain: true } });
    core.ConnectionsController.setActiveNamespace('eip155');

    expect(core.ConnectionsController.getAvailableNetworks()).toEqual([MAINNET, POLYGON, BASE]);
  });

  it('includes networks of other connected namespaces', async () => {
    connectEvm({ accounts: [EVM_EOA] });
    core.ConnectionsController.setConnection({
      namespace: 'solana',
      adapter: createAdapter(),
      accounts: [SOL_ADDRESS],
      caipNetwork: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
    });
    core.ConnectionsController.setActiveNamespace('eip155');

    expect(core.ConnectionsController.getAvailableNetworks()).toEqual([MAINNET, SOLANA]);
    expect(core.ConnectionsController.getConnectedNetworks()).toEqual([MAINNET, SOLANA]);
  });

  it('setActiveNetwork switches the network and activates its namespace', async () => {
    connectEvm();

    core.ConnectionsController.setActiveNetwork('eip155', 'eip155:137');

    await flush();
    expect(core.ConnectionsController.state.activeNamespace).toBe('eip155');
    expect(core.ConnectionsController.state.activeNetwork).toEqual(POLYGON);
    expect(core.ConnectionsController.state.activeAddress).toBe(EVM_EOA_POLYGON);
    expect(core.ConnectionsController.getActiveNetworkId()).toBe('eip155:137');
  });

  it('setActiveNetwork is a no-op for a namespace without a connection', async () => {
    connectEvm();
    core.ConnectionsController.setActiveNamespace('eip155');

    core.ConnectionsController.setActiveNetwork(
      'solana',
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
    );

    await flush();
    expect(core.ConnectionsController.state.activeNamespace).toBe('eip155');
    expect(core.ConnectionsController.state.activeNetwork).toEqual(MAINNET);
  });
});

// -- Accounts -----------------------------------------------------------------
describe('ConnectionsController.updateAccounts', () => {
  it('returns false when there is no connection for the namespace', async () => {
    expect(core.ConnectionsController.updateAccounts('eip155', [EVM_EOA])).toBe(false);
  });

  it('returns false when the accounts did not change', async () => {
    connectEvm({ accounts: [EVM_EOA] });

    expect(core.ConnectionsController.updateAccounts('eip155', [EVM_EOA])).toBe(false);
  });

  it('replaces the accounts and updates the active address', async () => {
    const other: CaipAddress = 'eip155:1:0x0000000000000000000000000000000000000002';
    connectEvm({ accounts: [EVM_EOA] });
    core.ConnectionsController.setActiveNamespace('eip155');

    expect(core.ConnectionsController.updateAccounts('eip155', [other])).toBe(true);
    await flush();
    expect(core.ConnectionsController.state.connection?.accounts).toEqual([other]);
    expect(core.ConnectionsController.state.activeAddress).toBe(other);
  });
});

// -- Active namespace persistence ---------------------------------------------
describe('ConnectionsController.setActiveNamespace', () => {
  it('persists the active namespace', async () => {
    core.ConnectionsController.setActiveNamespace('solana');
    await flush();

    await expect(core.StorageUtil.getActiveNamespace()).resolves.toBe('solana');
  });

  it('keeps the last namespace when switched quickly', async () => {
    core.ConnectionsController.setActiveNamespace('eip155');
    core.ConnectionsController.setActiveNamespace('solana');
    core.ConnectionsController.setActiveNamespace(undefined);
    core.ConnectionsController.setActiveNamespace('bip122');
    await flush();

    await expect(core.StorageUtil.getActiveNamespace()).resolves.toBe('bip122');
  });

  it('removes the persisted namespace when cleared', async () => {
    core.ConnectionsController.setActiveNamespace('solana');
    core.ConnectionsController.setActiveNamespace(undefined);
    await flush();

    await expect(core.StorageUtil.getActiveNamespace()).resolves.toBeUndefined();
  });

  it('does not write to storage when the namespace is unchanged', async () => {
    core.ConnectionsController.setActiveNamespace('solana');
    core.ConnectionsController.setActiveNamespace('solana');
    await flush();

    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });

  it('logs a storage failure without throwing', async () => {
    (storage.setItem as jest.Mock).mockRejectedValueOnce(new Error('write failed'));

    expect(() => core.ConnectionsController.setActiveNamespace('solana')).not.toThrow();
    await flush();

    await flush();
    expect(core.ConnectionsController.state.activeNamespace).toBe('solana');
    expect(core.LogController.sendError).toHaveBeenCalledWith(
      expect.any(Error),
      'StorageUtil.ts',
      'setActiveNamespace'
    );
  });
});

// -- Balance ------------------------------------------------------------------
describe('ConnectionsController.fetchBalance', () => {
  it('resolves without fetching when there is no connection', async () => {
    const getBalance = jest.spyOn(core.BlockchainApiController, 'getBalance');

    await expect(core.ConnectionsController.fetchBalance()).resolves.toBeUndefined();
    expect(getBalance).not.toHaveBeenCalled();
  });

  it('resolves without fetching when no account matches the active network', async () => {
    const getBalance = jest.spyOn(core.BlockchainApiController, 'getBalance');
    connectEvm({ caipNetwork: 'eip155:8453' });
    core.ConnectionsController.setActiveNamespace('eip155');

    await expect(core.ConnectionsController.fetchBalance()).resolves.toBeUndefined();
    expect(getBalance).not.toHaveBeenCalled();
  });

  it('does not leave an unhandled rejection when called without awaiting', async () => {
    const onUnhandled = jest.fn();
    process.on('unhandledRejection', onUnhandled);

    try {
      core.ConnectionsController.fetchBalance();
      await flush();
      await flush();
    } finally {
      process.off('unhandledRejection', onUnhandled);
    }

    expect(onUnhandled).not.toHaveBeenCalled();
  });

  it('stores the fetched balances for the active address', async () => {
    jest.spyOn(core.BlockchainApiController, 'getBalance').mockResolvedValue({
      balances: [
        {
          name: 'Ether',
          symbol: 'ETH',
          chainId: 'eip155:1',
          quantity: { decimals: '18', numeric: '1.5' },
          price: 2000,
          value: 3000,
          iconUrl: ''
        }
      ]
    } as any);
    connectEvm();
    core.ConnectionsController.setActiveNamespace('eip155');

    await core.ConnectionsController.fetchBalance();

    await flush();
    expect(core.ConnectionsController.state.activeBalance).toMatchObject({
      symbol: 'ETH',
      amount: '1.5'
    });
    await flush();
    expect(core.ConnectionsController.state.balances).toHaveLength(1);
  });

  it('shows an error when the balance request fails', async () => {
    jest
      .spyOn(core.BlockchainApiController, 'getBalance')
      .mockRejectedValue(new Error('network down'));
    connectEvm();
    core.ConnectionsController.setActiveNamespace('eip155');

    await expect(core.ConnectionsController.fetchBalance()).resolves.toBeUndefined();
    expect(core.SnackController.showError).toHaveBeenCalledWith('Failed to get account balance');
  });
});
