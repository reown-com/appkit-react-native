import { solana, solanaDevnet, type Metadata } from '@reown/appkit-common-react-native';
import { PhantomConnector } from '../connectors/PhantomConnector';
import {
  createFakeWallet,
  createMemoryStorage,
  flushPromises,
  getDeeplinkMethod,
  setupDeeplinkEnvironment,
  track,
  type DeeplinkEnvironment,
  type FakeWallet
} from '../__fixtures__/deeplinkWallet';

const APP_SCHEME = 'appkittest://';
const PROVIDER_SESSION_KEY = '@appkit/phantom-provider-session';
const CONNECTOR_SESSION_KEY = '@appkit/phantom-connector-data';

const metadata: Metadata = {
  name: 'AppKit test',
  description: 'AppKit test',
  url: 'https://example.com',
  icons: [],
  redirect: { native: APP_SCHEME }
};

type WalletBehaviour = 'approve' | 'reject' | 'ignore';

describe('DeeplinkConnector', () => {
  let env: DeeplinkEnvironment;
  let wallet: FakeWallet;
  let storage: ReturnType<typeof createMemoryStorage>;
  let connector: PhantomConnector;
  let behaviour: Record<string, WalletBehaviour>;

  const openedMethods = () => env.openURL.mock.calls.map(([url]) => getDeeplinkMethod(url));

  beforeEach(() => {
    jest.useFakeTimers();
    env = setupDeeplinkEnvironment();
    wallet = createFakeWallet({
      appScheme: APP_SCHEME,
      encryptionKeyFieldName: 'phantom_encryption_public_key'
    });
    storage = createMemoryStorage();
    connector = new PhantomConnector();
    behaviour = { connect: 'approve', disconnect: 'approve' };

    // The wallet answers each deep link the app opens
    env.openURL.mockImplementation(async (url: string) => {
      const method = getDeeplinkMethod(url)!;
      const action = behaviour[method] ?? 'ignore';
      if (action === 'ignore') return;

      Promise.resolve().then(() => {
        if (action === 'reject') {
          env.sendUrl(wallet.errorReply());
        } else if (method === 'connect') {
          env.sendUrl(wallet.connectReply(url));
        } else if (method === 'disconnect') {
          env.sendUrl(wallet.disconnectReply());
        }
      });
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const connect = async () => {
    await connector.init({ storage: storage.storage, metadata });
    const result = track(connector.connect({ defaultNetwork: solana }));
    await flushPromises();
    expect(result.status).toBe('resolved');
  };

  describe('switchNetwork', () => {
    it('keeps the listeners on the provider and emits the new chain and account', async () => {
      await connect();
      const provider = connector.getProvider();
      const onChainChanged = jest.fn();
      const onAccountsChanged = jest.fn();
      const onDisconnect = jest.fn();
      provider.on('chainChanged', onChainChanged);
      provider.on('accountsChanged', onAccountsChanged);
      provider.on('disconnect', onDisconnect);

      const result = track(connector.switchNetwork(solanaDevnet));
      await flushPromises();

      expect(result.status).toBe('resolved');
      expect(connector.getChainId('solana')).toBe(solanaDevnet.caipNetworkId);
      expect(connector.getNamespaces()['solana']?.accounts).toEqual([
        `${solanaDevnet.caipNetworkId}:${wallet.userPublicKey}`
      ]);
      expect(onChainChanged).toHaveBeenCalledWith(solanaDevnet.id);
      expect(onAccountsChanged).toHaveBeenCalledWith([wallet.userPublicKey]);
      expect(onDisconnect).not.toHaveBeenCalled();

      // Listeners added by the adapter are still there for later events
      expect(provider.listenerCount('chainChanged')).toBe(1);
      expect(provider.listenerCount('accountsChanged')).toBe(1);
      expect(provider.listenerCount('disconnect')).toBe(1);
      expect(connector.getProvider()).toBe(provider);
    });

    it('keeps the previous connection when the wallet rejects the switch', async () => {
      await connect();
      const provider = connector.getProvider();
      const onDisconnect = jest.fn();
      provider.on('disconnect', onDisconnect);
      const namespacesBefore = connector.getNamespaces();
      behaviour = { connect: 'reject', disconnect: 'approve' };

      const result = track(connector.switchNetwork(solanaDevnet));
      await flushPromises();

      expect(result.status).toBe('rejected');
      expect(connector.isConnected()).toBe(true);
      expect(connector.getChainId('solana')).toBe(solana.caipNetworkId);
      expect(connector.getNamespaces()).toEqual(namespacesBefore);
      expect(provider.getCurrentCluster()).toBe('mainnet-beta');
      expect(storage.data.has(PROVIDER_SESSION_KEY)).toBe(true);
      expect(storage.data.has(CONNECTOR_SESSION_KEY)).toBe(true);
      expect(onDisconnect).not.toHaveBeenCalled();
      expect(provider.listenerCount('disconnect')).toBe(1);
    });
  });

  describe('restoreSession', () => {
    const storeCorruptedSession = () => {
      // A session the provider can read but that can't be used (no user public key)
      storage.data.set(PROVIDER_SESSION_KEY, {
        sessionToken: 'session-token',
        userPublicKey: null,
        walletEncryptionPublicKeyBs58: wallet.walletEncryptionPublicKeyBs58,
        cluster: 'mainnet-beta'
      });
      storage.data.set(CONNECTOR_SESSION_KEY, {
        namespaces: {},
        wallet: { name: 'Phantom' },
        currentCaipNetworkId: solana.caipNetworkId
      });
    };

    it('clears an invalid stored session without opening the wallet', async () => {
      storeCorruptedSession();

      const result = track(connector.init({ storage: storage.storage, metadata }));
      await flushPromises();
      jest.advanceTimersByTime(60_000);
      await flushPromises();

      expect(result.status).toBe('resolved');
      expect(env.openURL).not.toHaveBeenCalled();
      expect(connector.isConnected()).toBe(false);
      expect(storage.data.has(PROVIDER_SESSION_KEY)).toBe(false);
      expect(storage.data.has(CONNECTOR_SESSION_KEY)).toBe(false);
    });

    it("doesn't open the wallet when reading the stored session fails", async () => {
      storage.data.set(PROVIDER_SESSION_KEY, {
        sessionToken: 'session-token',
        userPublicKey: wallet.userPublicKey,
        walletEncryptionPublicKeyBs58: wallet.walletEncryptionPublicKeyBs58,
        cluster: 'mainnet-beta'
      });
      const getItem = storage.storage.getItem;
      storage.storage.getItem = jest.fn(async (key: string) => {
        if (key === CONNECTOR_SESSION_KEY) throw new Error('Storage error');

        return getItem(key);
      }) as typeof getItem;

      const result = track(connector.init({ storage: storage.storage, metadata }));
      await flushPromises();
      jest.advanceTimersByTime(60_000);
      await flushPromises();

      expect(result.status).toBe('resolved');
      expect(env.openURL).not.toHaveBeenCalled();
      expect(connector.isConnected()).toBe(false);
      expect(storage.data.has(PROVIDER_SESSION_KEY)).toBe(false);
    });

    it('restores a valid session without opening the wallet', async () => {
      await connect();
      env.openURL.mockClear();

      const restored = new PhantomConnector();
      await restored.init({ storage: storage.storage, metadata });

      expect(restored.isConnected()).toBe(true);
      expect(restored.getChainId('solana')).toBe(solana.caipNetworkId);
      expect(env.openURL).not.toHaveBeenCalled();
    });
  });

  describe('init', () => {
    it('destroys the previous provider when it creates a new one', async () => {
      await connector.init({ storage: storage.storage, metadata });
      const firstProvider = connector.getProvider();
      behaviour = { connect: 'ignore' };
      const pending = track(connector.connect({ defaultNetwork: solana }));
      await flushPromises();
      expect(env.urlListenerCount()).toBe(1);

      // AppKit calls init again before every connect
      await connector.init({ storage: storage.storage, metadata });
      await flushPromises();

      expect(connector.getProvider()).not.toBe(firstProvider);
      expect(pending.status).toBe('rejected');
      expect(env.urlListenerCount()).toBe(0);
    });
  });

  it('opens the wallet once to connect and disconnect', async () => {
    await connect();
    const result = track(connector.disconnect());
    await flushPromises();

    expect(result.status).toBe('resolved');
    expect(openedMethods()).toEqual(['connect', 'disconnect']);
    expect(connector.isConnected()).toBe(false);
    expect(storage.data.has(PROVIDER_SESSION_KEY)).toBe(false);
    expect(storage.data.has(CONNECTOR_SESSION_KEY)).toBe(false);
  });
});
