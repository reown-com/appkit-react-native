import nacl from 'tweetnacl';
import { DeeplinkProvider } from '../providers/DeeplinkProvider';
import {
  createFakeWallet,
  createMemoryStorage,
  flushPromises,
  setupDeeplinkEnvironment,
  track,
  type DeeplinkEnvironment,
  type FakeWallet
} from '../__fixtures__/deeplinkWallet';

const APP_SCHEME = 'appkittest://';
const SESSION_KEY = '@appkit/phantom-provider-session';
const RESPONSE_TIMEOUT_MS = 30_000;

describe('DeeplinkProvider', () => {
  let env: DeeplinkEnvironment;
  let wallet: FakeWallet;
  let storage: ReturnType<typeof createMemoryStorage>;
  let provider: DeeplinkProvider;

  const lastOpenedUrl = () => env.openURL.mock.calls[env.openURL.mock.calls.length - 1]![0];

  const createProvider = () =>
    new DeeplinkProvider({
      appScheme: APP_SCHEME,
      dappUrl: 'https://example.com',
      storage: storage.storage,
      type: 'phantom',
      cluster: 'mainnet-beta',
      dappEncryptionKeyPair: nacl.box.keyPair(),
      baseUrl: 'https://phantom.app/ul/v1',
      encryptionKeyFieldName: 'phantom_encryption_public_key'
    });

  const connect = async () => {
    const result = track(provider.connect());
    await flushPromises();
    env.sendUrl(wallet.connectReply(lastOpenedUrl()));
    await flushPromises();
    expect(result.status).toBe('resolved');
  };

  beforeEach(() => {
    jest.useFakeTimers();
    env = setupDeeplinkEnvironment();
    wallet = createFakeWallet({
      appScheme: APP_SCHEME,
      encryptionKeyFieldName: 'phantom_encryption_public_key'
    });
    storage = createMemoryStorage();
    provider = createProvider();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('connects with a wallet redirect', async () => {
    await connect();

    expect(provider.isConnected()).toBe(true);
    expect(provider.getUserPublicKey()).toBe(wallet.userPublicKey);
    expect(env.urlListenerCount()).toBe(0);
  });

  describe('superseded requests', () => {
    it('rejects the earlier request when a new one starts', async () => {
      const first = track(provider.connect());
      await flushPromises();
      const second = track(provider.connect());
      await flushPromises();

      expect(first.status).toBe('rejected');
      expect(first.error?.message).toMatch(/cancelled because a new request was sent/i);
      expect(second.status).toBe('pending');

      // The newer request still completes
      env.sendUrl(wallet.connectReply(lastOpenedUrl()));
      await flushPromises();
      expect(second.status).toBe('resolved');
      expect(env.urlListenerCount()).toBe(0);
    });

    it('rejects a pending request when the provider is destroyed', async () => {
      const pending = track(provider.connect());
      await flushPromises();

      provider.destroy();
      await flushPromises();

      expect(pending.status).toBe('rejected');
      expect(env.urlListenerCount()).toBe(0);
    });
  });

  describe('timeout', () => {
    it('rejects when the user comes back to the app without a wallet redirect', async () => {
      const pending = track(provider.connect());
      await flushPromises();

      // The wallet opens, then the user switches back to the app manually
      env.setAppState('background');
      jest.advanceTimersByTime(10 * 60_000);
      await flushPromises();
      expect(pending.status).toBe('pending');

      env.setAppState('active');
      jest.advanceTimersByTime(RESPONSE_TIMEOUT_MS - 1);
      await flushPromises();
      expect(pending.status).toBe('pending');

      jest.advanceTimersByTime(1);
      await flushPromises();
      expect(pending.status).toBe('rejected');
      expect(pending.error?.message).toMatch(/no response from the wallet/i);
      expect(env.urlListenerCount()).toBe(0);
    });

    it('rejects when the wallet never opens and the app stays in the foreground', async () => {
      const pending = track(provider.connect());
      await flushPromises();

      jest.advanceTimersByTime(RESPONSE_TIMEOUT_MS);
      await flushPromises();

      expect(pending.status).toBe('rejected');
      expect(pending.error?.message).toMatch(/no response from the wallet/i);
    });

    it("doesn't count the time spent in the wallet", async () => {
      const pending = track(provider.connect());
      await flushPromises();

      env.setAppState('background');
      jest.advanceTimersByTime(5 * 60_000);
      env.setAppState('active');
      env.sendUrl(wallet.connectReply(lastOpenedUrl()));
      await flushPromises();

      expect(pending.status).toBe('resolved');
    });
  });

  describe('incoming deep links', () => {
    it('ignores deep links that are not the wallet response', async () => {
      const pending = track(provider.connect());
      await flushPromises();

      env.sendUrl('https://example.com/some/page');
      env.sendUrl('otherapp://wc?uri=abc');
      env.sendUrl(`${APP_SCHEME}settings`);
      env.sendUrl(`${APP_SCHEME}?foo=bar`);
      await flushPromises();
      expect(pending.status).toBe('pending');

      env.sendUrl(wallet.connectReply(lastOpenedUrl()));
      await flushPromises();
      expect(pending.status).toBe('resolved');
    });

    it('rejects with the wallet error when the user rejects the request', async () => {
      const pending = track(provider.connect());
      await flushPromises();

      env.sendUrl(wallet.errorReply('4001', 'User rejected the request.'));
      await flushPromises();

      expect(pending.status).toBe('rejected');
      expect(pending.error?.message).toMatch(/User rejected the request\. \(Code: 4001\)/);
      expect(env.urlListenerCount()).toBe(0);
    });

    it('ignores unrelated deep links while a sign request is pending', async () => {
      await connect();

      const pending = track(
        provider.request<{ signature: string }>({
          method: 'solana_signMessage',
          params: { message: 'hello' }
        })
      );
      await flushPromises();

      env.sendUrl(`${APP_SCHEME}some/screen`);
      await flushPromises();
      expect(pending.status).toBe('pending');

      env.sendUrl(wallet.signReply(lastOpenedUrl(), { signature: 'sig' }));
      await flushPromises();
      expect(pending.status).toBe('resolved');
      expect(pending.value).toEqual({ signature: 'sig' });
    });
  });

  describe('disconnect', () => {
    it('emits disconnect and clears the stored session after the wallet redirect', async () => {
      await connect();
      expect(storage.data.has(SESSION_KEY)).toBe(true);
      const onDisconnect = jest.fn();
      provider.on('disconnect', onDisconnect);

      const pending = track(provider.disconnect());
      await flushPromises();
      env.sendUrl(wallet.disconnectReply());
      await flushPromises();

      expect(pending.status).toBe('resolved');
      expect(onDisconnect).toHaveBeenCalledTimes(1);
      expect(provider.isConnected()).toBe(false);
      expect(storage.data.has(SESSION_KEY)).toBe(false);
    });

    it('clears the local session and emits disconnect when the wallet redirect fails', async () => {
      await connect();
      const onDisconnect = jest.fn();
      provider.on('disconnect', onDisconnect);

      const pending = track(provider.disconnect());
      await flushPromises();
      env.sendUrl(wallet.errorReply('-32603', 'Internal error'));
      await flushPromises();

      expect(pending.status).toBe('rejected');
      expect(onDisconnect).toHaveBeenCalledTimes(1);
      expect(provider.isConnected()).toBe(false);
      expect(storage.data.has(SESSION_KEY)).toBe(false);
    });

    it('emits disconnect without opening the wallet when there is no session', async () => {
      const onDisconnect = jest.fn();
      provider.on('disconnect', onDisconnect);

      await provider.disconnect();

      expect(env.openURL).not.toHaveBeenCalled();
      expect(onDisconnect).toHaveBeenCalledTimes(1);
    });
  });

  it('keeps the current cluster when a connect fails', async () => {
    const pending = track(provider.connect({ cluster: 'devnet' }));
    await flushPromises();
    env.sendUrl(wallet.errorReply());
    await flushPromises();

    expect(pending.status).toBe('rejected');
    expect(provider.getCurrentCluster()).toBe('mainnet-beta');
  });
});
