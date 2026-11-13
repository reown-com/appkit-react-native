import UniversalProvider from '@walletconnect/universal-provider';
import type { Storage } from '@reown/appkit-common-react-native';

import { WalletConnectConnector } from '../../connectors/WalletConnectConnector';

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
