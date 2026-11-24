import { SafeStorageKeys, type Storage, type WcWallet } from '@reown/appkit-common-react-native';
import { LogController, OptionsController, StorageUtil } from '../../index';

// -- Helpers ------------------------------------------------------------------
// In-memory storage that resolves on a later macrotask, like AsyncStorage does,
// so concurrent callers can interleave between a read and the following write.
function createMemoryStorage() {
  const data = new Map<string, unknown>();
  const tick = () => new Promise(resolve => setImmediate(resolve));

  const storage: Storage = {
    getKeys: jest.fn(async () => {
      await tick();

      return Array.from(data.keys());
    }),
    getEntries: jest.fn(async () => {
      await tick();

      return Array.from(data.entries()) as [string, any][];
    }),
    getItem: jest.fn(async (key: string) => {
      await tick();

      return data.get(key) as any;
    }),
    setItem: jest.fn(async (key: string, value: unknown) => {
      await tick();
      data.set(key, value);
    }),
    removeItem: jest.fn(async (key: string) => {
      await tick();
      data.delete(key);
    })
  };

  return { storage, data };
}

function wallet(id: string): WcWallet {
  return { id, name: `Wallet ${id}` } as WcWallet;
}

let memory: ReturnType<typeof createMemoryStorage>;

beforeEach(() => {
  memory = createMemoryStorage();
  OptionsController.setStorage(memory.storage);
  jest.spyOn(LogController, 'sendError').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// -- Connected connectors -----------------------------------------------------
describe('StorageUtil connected connectors', () => {
  it('returns an empty list when nothing is stored', async () => {
    await expect(StorageUtil.getConnectedConnectors()).resolves.toEqual([]);
  });

  it('round-trips set, get and remove', async () => {
    await StorageUtil.setConnectedConnectors({
      type: 'walletconnect',
      namespaces: ['eip155', 'solana']
    });
    await StorageUtil.setConnectedConnectors({ type: 'phantom', namespaces: ['solana'] });

    await expect(StorageUtil.getConnectedConnectors()).resolves.toEqual([
      { type: 'walletconnect', namespaces: ['eip155', 'solana'] },
      { type: 'phantom', namespaces: ['solana'] }
    ]);

    await StorageUtil.removeConnectedConnectors('walletconnect');

    await expect(StorageUtil.getConnectedConnectors()).resolves.toEqual([
      { type: 'phantom', namespaces: ['solana'] }
    ]);
  });

  it('does not add the same connector type twice', async () => {
    await StorageUtil.setConnectedConnectors({ type: 'walletconnect', namespaces: ['eip155'] });
    await StorageUtil.setConnectedConnectors({ type: 'walletconnect', namespaces: ['solana'] });

    await expect(StorageUtil.getConnectedConnectors()).resolves.toEqual([
      { type: 'walletconnect', namespaces: ['eip155'] }
    ]);
  });

  it('removing a connector that is not stored keeps the others', async () => {
    await StorageUtil.setConnectedConnectors({ type: 'phantom', namespaces: ['solana'] });
    await StorageUtil.removeConnectedConnectors('walletconnect');

    await expect(StorageUtil.getConnectedConnectors()).resolves.toEqual([
      { type: 'phantom', namespaces: ['solana'] }
    ]);
  });

  it('keeps every connector when several are saved at the same time', async () => {
    await Promise.all([
      StorageUtil.setConnectedConnectors({ type: 'walletconnect', namespaces: ['eip155'] }),
      StorageUtil.setConnectedConnectors({ type: 'phantom', namespaces: ['solana'] }),
      StorageUtil.setConnectedConnectors({ type: 'coinbase', namespaces: ['eip155'] })
    ]);

    const stored = await StorageUtil.getConnectedConnectors();
    expect(stored.map(c => c.type).sort()).toEqual(['coinbase', 'phantom', 'walletconnect']);
  });

  it('does not bring back a connector removed while another one is being saved', async () => {
    await StorageUtil.setConnectedConnectors({ type: 'walletconnect', namespaces: ['eip155'] });

    await Promise.all([
      StorageUtil.removeConnectedConnectors('walletconnect'),
      StorageUtil.setConnectedConnectors({ type: 'phantom', namespaces: ['solana'] })
    ]);

    await expect(StorageUtil.getConnectedConnectors()).resolves.toEqual([
      { type: 'phantom', namespaces: ['solana'] }
    ]);
  });

  it('treats a corrupted stored value as an empty list and can still save', async () => {
    memory.data.set(SafeStorageKeys.CONNECTED_CONNECTORS, 'not-a-list');

    await expect(StorageUtil.getConnectedConnectors()).resolves.toEqual([]);

    await StorageUtil.setConnectedConnectors({ type: 'walletconnect', namespaces: ['eip155'] });
    await expect(StorageUtil.getConnectedConnectors()).resolves.toEqual([
      { type: 'walletconnect', namespaces: ['eip155'] }
    ]);
  });

  it('returns an empty list and logs when storage fails to read', async () => {
    (memory.storage.getItem as jest.Mock).mockRejectedValueOnce(new Error('read failed'));

    await expect(StorageUtil.getConnectedConnectors()).resolves.toEqual([]);
    expect(LogController.sendError).toHaveBeenCalled();
  });

  it('does not throw when storage fails to write', async () => {
    (memory.storage.setItem as jest.Mock).mockRejectedValueOnce(new Error('write failed'));

    await expect(
      StorageUtil.setConnectedConnectors({ type: 'walletconnect', namespaces: ['eip155'] })
    ).resolves.toBeUndefined();
    expect(LogController.sendError).toHaveBeenCalled();
  });
});

// -- Active namespace ---------------------------------------------------------
describe('StorageUtil active namespace', () => {
  it('returns undefined when nothing is stored', async () => {
    await expect(StorageUtil.getActiveNamespace()).resolves.toBeUndefined();
  });

  it('round-trips the active namespace', async () => {
    await StorageUtil.setActiveNamespace('solana');
    await expect(StorageUtil.getActiveNamespace()).resolves.toBe('solana');
  });

  it('clears the active namespace when set to undefined', async () => {
    await StorageUtil.setActiveNamespace('eip155');
    await StorageUtil.setActiveNamespace(undefined);

    await expect(StorageUtil.getActiveNamespace()).resolves.toBeUndefined();
    expect(memory.data.has(SafeStorageKeys.ACTIVE_NAMESPACE)).toBe(false);
  });

  it('removeActiveNamespace clears it', async () => {
    await StorageUtil.setActiveNamespace('eip155');
    await StorageUtil.removeActiveNamespace();

    await expect(StorageUtil.getActiveNamespace()).resolves.toBeUndefined();
  });

  it('returns undefined when the stored value is not a namespace string', async () => {
    memory.data.set(SafeStorageKeys.ACTIVE_NAMESPACE, { foo: 'bar' });

    await expect(StorageUtil.getActiveNamespace()).resolves.toBeUndefined();
  });

  it('returns undefined and logs when storage fails to read', async () => {
    (memory.storage.getItem as jest.Mock).mockRejectedValueOnce(new Error('read failed'));

    await expect(StorageUtil.getActiveNamespace()).resolves.toBeUndefined();
    expect(LogController.sendError).toHaveBeenCalled();
  });
});

// -- Recent wallets -----------------------------------------------------------
describe('StorageUtil recent wallets', () => {
  it('returns an empty list when nothing is stored', async () => {
    await expect(StorageUtil.getRecentWallets()).resolves.toEqual([]);
  });

  it('adds the newest wallet first and keeps at most two', async () => {
    await StorageUtil.addRecentWallet(wallet('a'));
    await StorageUtil.addRecentWallet(wallet('b'));
    const result = await StorageUtil.addRecentWallet(wallet('c'));

    expect(result?.map(w => w.id)).toEqual(['c', 'b']);
    await expect(StorageUtil.getRecentWallets()).resolves.toEqual([wallet('c'), wallet('b')]);
  });

  it('moves an existing wallet to the front instead of duplicating it', async () => {
    await StorageUtil.addRecentWallet(wallet('a'));
    await StorageUtil.addRecentWallet(wallet('b'));
    await StorageUtil.addRecentWallet(wallet('a'));

    await expect(StorageUtil.getRecentWallets()).resolves.toEqual([wallet('a'), wallet('b')]);
  });

  it('has saved the wallet by the time addRecentWallet resolves', async () => {
    await StorageUtil.addRecentWallet(wallet('a'));

    expect(memory.data.get(SafeStorageKeys.RECENT_WALLET)).toEqual([wallet('a')]);
  });

  it('catches and logs a failed write instead of leaving a rejected promise', async () => {
    (memory.storage.setItem as jest.Mock).mockRejectedValueOnce(new Error('write failed'));

    await expect(StorageUtil.addRecentWallet(wallet('a'))).resolves.toBeUndefined();
    expect(LogController.sendError).toHaveBeenCalledWith(
      expect.any(Error),
      'StorageUtil.ts',
      'addRecentWallet'
    );
  });

  it('treats a corrupted stored value as an empty list', async () => {
    memory.data.set(SafeStorageKeys.RECENT_WALLET, 'not-a-list');

    await expect(StorageUtil.getRecentWallets()).resolves.toEqual([]);
    await expect(StorageUtil.addRecentWallet(wallet('a'))).resolves.toEqual([wallet('a')]);
  });

  it('setRecentWallets overwrites the list', async () => {
    await StorageUtil.addRecentWallet(wallet('a'));
    await StorageUtil.setRecentWallets([wallet('z')]);

    await expect(StorageUtil.getRecentWallets()).resolves.toEqual([wallet('z')]);
  });
});
