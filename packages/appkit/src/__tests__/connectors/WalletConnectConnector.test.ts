import UniversalProvider from '@walletconnect/universal-provider';
import type { Storage } from '@reown/appkit-common-react-native';
import { OptionsController, WcController } from '@reown/appkit-core-react-native';

import { WalletConnectConnector } from '../../connectors/WalletConnectConnector';
import { SIWXUtil } from '../../utils/SIWXUtil';

jest.mock('@walletconnect/universal-provider', () => ({
  __esModule: true,
  default: { init: jest.fn() }
}));

const storage: Storage = {
  getKeys: jest.fn().mockResolvedValue([]),
  getEntries: jest.fn().mockResolvedValue([]),
  getItem: jest.fn().mockResolvedValue(undefined),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined)
};

const metadata = {
  name: 'Test',
  description: 'Test',
  url: 'https://test.com',
  icons: []
};

describe('WalletConnectConnector', () => {
  it('removes the display_uri listener when the connection fails', async () => {
    const provider = {
      on: jest.fn(),
      off: jest.fn(),
      connect: jest.fn().mockRejectedValue(new Error('No internet connection'))
    };
    (UniversalProvider.init as jest.Mock).mockResolvedValue(provider);

    const connector = new WalletConnectConnector({ projectId: 'test-project-id' });
    await connector.init({ storage, metadata });

    await expect(
      connector.connect({
        namespaces: { solana: { chains: [], methods: [], events: [], rpcMap: {} } }
      })
    ).rejects.toThrow('No internet connection');

    expect(provider.on).toHaveBeenCalledWith('display_uri', expect.any(Function));
    expect(provider.off).toHaveBeenCalledWith('display_uri', provider.on.mock.calls[0][1]);
  });
});

const ACCOUNT = 'eip155:1:0x1234567890123456789012345678901234567890';

const createSession = (overrides: Record<string, unknown> = {}) => ({
  topic: 'session-topic',
  namespaces: {
    eip155: { accounts: [ACCOUNT], chains: ['eip155:1'], methods: [], events: [] }
  },
  peer: { metadata: { name: 'Test Wallet', icons: ['https://wallet.test/icon.png'] } },
  ...overrides
});

// A UniversalProvider stand-in with real event handling
const createUniversalProvider = (session?: ReturnType<typeof createSession>) => {
  const listeners = new Map<string, Set<(arg: unknown) => void>>();
  const provider = {
    session,
    on: jest.fn((event: string, fn: (arg: unknown) => void) => {
      listeners.set(event, (listeners.get(event) ?? new Set()).add(fn));
    }),
    off: jest.fn((event: string, fn: (arg: unknown) => void) => {
      listeners.get(event)?.delete(fn);
    }),
    emit: (event: string, arg: unknown) => listeners.get(event)?.forEach(fn => fn(arg)),
    listenerCount: (event: string) => listeners.get(event)?.size ?? 0,
    connect: jest.fn(),
    disconnect: jest.fn(),
    request: jest.fn().mockResolvedValue('0xresult'),
    setDefaultChain: jest.fn(),
    rpcProviders: { eip155: { getDefaultChain: jest.fn(() => '1') } } as Record<
      string,
      { getDefaultChain: () => string }
    >
  };
  provider.connect.mockImplementation(async () => {
    provider.session = createSession();

    return provider.session;
  });

  return provider;
};

describe('WalletConnectConnector flows', () => {
  const initConnector = async (session?: ReturnType<typeof createSession>) => {
    const provider = createUniversalProvider(session);
    (UniversalProvider.init as jest.Mock).mockResolvedValue(provider);
    const connector = new WalletConnectConnector({ projectId: 'test-project-id' });
    await connector.init({ storage, metadata });

    return { connector, provider };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    WcController.resetState();
    OptionsController.setSiwx(undefined);
  });

  it('throws when the provider is used before init', () => {
    const connector = new WalletConnectConnector({ projectId: 'test-project-id' });

    expect(() => connector.getProvider()).toThrow('Provider not initialized');
  });

  describe('restore', () => {
    it('restores the stored session on init', async () => {
      const { connector } = await initConnector(
        createSession({
          sessionProperties: { smartAccounts: JSON.stringify([ACCOUNT]) }
        })
      );

      expect(connector.getNamespaces()).toEqual(createSession().namespaces);
      expect(connector.getWalletInfo()).toEqual(
        expect.objectContaining({
          name: 'Test Wallet',
          icon: 'https://wallet.test/icon.png',
          type: 'walletconnect'
        })
      );
      expect(connector.getProperties()).toEqual(
        expect.objectContaining({ smartAccounts: [ACCOUNT], sessionTopic: 'session-topic' })
      );
      expect(connector.getChainId('eip155')).toBe('eip155:1');
    });

    it('has no namespaces when there is no stored session', async () => {
      const { connector } = await initConnector();

      expect(connector.getNamespaces()).toEqual({});
      expect(connector.getChainId('eip155')).toBeUndefined();
    });

    it('reuses the provider when init runs again', async () => {
      const { connector } = await initConnector();

      await connector.init({ storage, metadata });

      expect(UniversalProvider.init).toHaveBeenCalledTimes(1);
    });
  });

  describe('connect', () => {
    const namespaces = {
      eip155: { chains: ['eip155:1'], methods: [], events: [], rpcMap: {} }
    } as any;

    it('shares the pairing uri and returns the approved namespaces', async () => {
      const { connector, provider } = await initConnector();
      provider.connect.mockImplementationOnce(async () => {
        provider.emit('display_uri', 'wc:pairing-uri');
        provider.session = createSession();

        return provider.session;
      });

      const approved = await connector.connect({
        namespaces,
        defaultNetwork: { caipNetworkId: 'eip155:1' } as any
      });

      expect(WcController.state.wcUri).toBe('wc:pairing-uri');
      expect(approved).toEqual(createSession().namespaces);
      expect(provider.connect).toHaveBeenCalledWith({ optionalNamespaces: namespaces });
      expect(provider.setDefaultChain).toHaveBeenCalledWith('eip155:1');
      expect(connector.getWalletInfo()?.name).toBe('Test Wallet');
      expect(provider.listenerCount('display_uri')).toBe(0);
    });

    it('authenticates in one step when SIWX is set and only EVM is requested', async () => {
      const { connector, provider } = await initConnector();
      OptionsController.setSiwx({} as any);
      const authSpy = jest
        .spyOn(SIWXUtil, 'universalProviderAuthenticate')
        .mockResolvedValue(createSession() as any);

      await connector.connect({ namespaces });

      expect(authSpy).toHaveBeenCalledWith(
        expect.objectContaining({ chains: ['eip155:1'], universalProvider: provider })
      );
      expect(provider.connect).not.toHaveBeenCalled();
      authSpy.mockRestore();
    });

    it('connects without one-step auth when more than EVM is requested', async () => {
      const { connector, provider } = await initConnector();
      OptionsController.setSiwx({} as any);
      const authSpy = jest.spyOn(SIWXUtil, 'universalProviderAuthenticate');

      await connector.connect({
        namespaces: {
          ...namespaces,
          solana: { chains: [], methods: [], events: [], rpcMap: {} }
        }
      });

      expect(authSpy).not.toHaveBeenCalled();
      expect(provider.connect).toHaveBeenCalled();
      authSpy.mockRestore();
    });
  });

  describe('namespace provider', () => {
    it("sends requests to the namespace's current chain", async () => {
      const { connector, provider } = await initConnector(createSession());
      provider.rpcProviders['eip155']!.getDefaultChain = jest.fn(() => '137');

      await connector.getProvider('eip155').request({ method: 'eth_chainId' });

      expect(provider.request).toHaveBeenCalledWith({ method: 'eth_chainId' }, 'eip155:137');
    });

    it('uses the chain passed to the request when there is one', async () => {
      const { connector, provider } = await initConnector(createSession());

      await connector.getProvider('eip155').request({ method: 'eth_chainId' }, 'eip155:10');

      expect(provider.request).toHaveBeenCalledWith({ method: 'eth_chainId' }, 'eip155:10');
    });

    it('subscribes to the same underlying provider', async () => {
      const { connector, provider } = await initConnector(createSession());
      const listener = jest.fn();

      connector.getProvider('eip155').on('chainChanged', listener);
      provider.emit('chainChanged', '137');
      connector.getProvider('eip155').off('chainChanged', listener);
      provider.emit('chainChanged', '10');

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('switchNetwork', () => {
    it('sets the default chain from the CAIP id, or builds an EVM one from the id', async () => {
      const { connector, provider } = await initConnector(createSession());

      await connector.switchNetwork({ id: 137, caipNetworkId: 'eip155:137' } as any);
      await connector.switchNetwork({ id: 10 } as any);

      expect(provider.setDefaultChain).toHaveBeenNthCalledWith(1, 'eip155:137');
      expect(provider.setDefaultChain).toHaveBeenNthCalledWith(2, 'eip155:10');
    });
  });
});
