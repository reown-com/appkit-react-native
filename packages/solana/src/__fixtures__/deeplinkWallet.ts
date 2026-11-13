import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { Buffer } from 'buffer';
import type { Storage } from '@reown/appkit-common-react-native';

type UrlListener = (event: { url: string }) => void;
type AppStateListener = (state: string) => void;

/**
 * Replaces the `Linking` and `AppState` mocks from the shared setup with versions the tests can drive:
 * `sendUrl` delivers an incoming deep link, `setAppState` moves the app to the background or foreground.
 */
export function setupDeeplinkEnvironment() {
  const ReactNative = jest.requireMock('react-native');
  const urlListeners = new Set<UrlListener>();
  const appStateListeners = new Set<AppStateListener>();

  ReactNative.Linking.addEventListener = jest.fn((_type: string, listener: UrlListener) => {
    urlListeners.add(listener);

    return { remove: () => urlListeners.delete(listener) };
  });
  ReactNative.Linking.openURL = jest.fn().mockResolvedValue(undefined);
  ReactNative.AppState = {
    currentState: 'active',
    addEventListener: jest.fn((_type: string, listener: AppStateListener) => {
      appStateListeners.add(listener);

      return { remove: () => appStateListeners.delete(listener) };
    })
  };

  return {
    openURL: ReactNative.Linking.openURL as jest.Mock,
    sendUrl: (url: string) => [...urlListeners].forEach(listener => listener({ url })),
    setAppState: (state: 'active' | 'background' | 'inactive') => {
      ReactNative.AppState.currentState = state;
      [...appStateListeners].forEach(listener => listener(state));
    },
    urlListenerCount: () => urlListeners.size
  };
}

export type DeeplinkEnvironment = ReturnType<typeof setupDeeplinkEnvironment>;

/** In-memory `Storage`. */
export function createMemoryStorage(initial: Record<string, unknown> = {}) {
  const data = new Map<string, unknown>(Object.entries(initial));
  const storage: Storage = {
    getKeys: async () => [...data.keys()],
    getEntries: async <T>() => [...data.entries()] as [string, T][],
    getItem: async <T>(key: string) => data.get(key) as T | undefined,
    setItem: async <T>(key: string, value: T) => {
      data.set(key, value);
    },
    removeItem: async (key: string) => {
      data.delete(key);
    }
  };

  return { storage, data };
}

/** Lets pending promise callbacks run. Works with fake timers. */
export async function flushPromises(times = 30) {
  for (let i = 0; i < times; i++) {
    await Promise.resolve();
  }
}

/** Tracks whether a promise has settled, without awaiting it (so a hanging promise doesn't hang the test). */
export function track<T>(promise: Promise<T>) {
  const state: { status: 'pending' | 'resolved' | 'rejected'; value?: T; error?: Error } = {
    status: 'pending'
  };
  promise.then(
    value => {
      state.status = 'resolved';
      state.value = value;
    },
    error => {
      state.status = 'rejected';
      state.error = error;
    }
  );

  return state;
}

/**
 * Minimal Phantom-like wallet. It builds the encrypted redirects a real wallet sends back to the app.
 */
export function createFakeWallet({
  appScheme,
  encryptionKeyFieldName
}: {
  appScheme: string;
  encryptionKeyFieldName: string;
}) {
  const walletKeyPair = nacl.box.keyPair();
  const userPublicKey = bs58.encode(nacl.sign.keyPair().publicKey);
  let sessionCount = 0;

  const getParams = (url: string) => new URLSearchParams(url.substring(url.indexOf('?') + 1));

  const encrypt = (payload: unknown, dappPublicKeyBs58: string) => {
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const data = nacl.box(
      Buffer.from(JSON.stringify(payload), 'utf8'),
      nonce,
      bs58.decode(dappPublicKeyBs58),
      walletKeyPair.secretKey
    );

    return { nonce: bs58.encode(nonce), data: bs58.encode(data) };
  };

  return {
    userPublicKey,
    walletEncryptionPublicKeyBs58: bs58.encode(walletKeyPair.publicKey),

    /** The redirect for an approved `connect` request (`requestUrl` is the URL the app opened). */
    connectReply(requestUrl: string) {
      sessionCount += 1;
      const dappPublicKey = getParams(requestUrl).get('dapp_encryption_public_key')!;
      const { nonce, data } = encrypt(
        { public_key: userPublicKey, session: `session-${sessionCount}` },
        dappPublicKey
      );

      return `${appScheme}?${new URLSearchParams({
        [encryptionKeyFieldName]: bs58.encode(walletKeyPair.publicKey),
        nonce,
        data
      }).toString()}`;
    },

    /** The redirect for an approved signing request. */
    signReply(requestUrl: string, result: unknown) {
      const dappPublicKey = getParams(requestUrl).get('dapp_encryption_public_key')!;
      const { nonce, data } = encrypt(result, dappPublicKey);

      return `${appScheme}?${new URLSearchParams({ nonce, data }).toString()}`;
    },

    /** The redirect for a rejected request. */
    errorReply(code = '4001', message = 'User rejected the request.') {
      return `${appScheme}?${new URLSearchParams({
        errorCode: code,
        errorMessage: message
      }).toString()}`;
    },

    /** The redirect for a `disconnect` request. */
    disconnectReply() {
      return appScheme;
    }
  };
}

export type FakeWallet = ReturnType<typeof createFakeWallet>;

/** Method of a wallet deep link, e.g. `connect` for `https://phantom.app/ul/v1/connect?...`. */
export function getDeeplinkMethod(url: string) {
  return url.split('?')[0]!.split('/').pop();
}
