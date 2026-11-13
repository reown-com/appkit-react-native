import { ModalController, OptionsController, StorageUtil } from '@reown/appkit-core-react-native';
import type { Storage } from '@reown/appkit-common-react-native';

import { AppKit } from '../AppKit';
import type { AppKitConfig } from '../types';

const mockInit = jest.fn();
const mockConnect = jest.fn();
const mockConnectorConstructor = jest.fn();

jest.mock('../connectors/WalletConnectConnector', () => ({
  WalletConnectConnector: jest.fn().mockImplementation(config => {
    mockConnectorConstructor(config);

    return {
      type: 'walletconnect',
      init: mockInit,
      connect: mockConnect,
      getNamespaces: jest.fn(() => ({})),
      getWalletInfo: jest.fn(),
      getProperties: jest.fn()
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
    expect(mockConnectorConstructor).toHaveBeenCalledTimes(2);
    expect(mockConnect).toHaveBeenCalledTimes(1);
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
