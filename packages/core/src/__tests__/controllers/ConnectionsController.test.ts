import type { BlockchainAdapter } from '@reown/appkit-common-react-native';
import { ConnectionsController } from '../../index';

// -- Helpers ------------------------------------------------------------------
function createAdapter(connector: object) {
  return {
    connector,
    removeAllListeners: jest.fn(),
    disconnect: jest.fn().mockResolvedValue(undefined),
    removeConnector: jest.fn()
  } as unknown as BlockchainAdapter & {
    disconnect: jest.Mock;
    removeConnector: jest.Mock;
  };
}

// -- Tests --------------------------------------------------------------------
describe('ConnectionsController.disconnect', () => {
  it('detaches every adapter that shares the connector from the provider', async () => {
    const connector = { type: 'walletconnect' };
    const evmAdapter = createAdapter(connector);
    const solanaAdapter = createAdapter(connector);

    ConnectionsController.setConnection({
      namespace: 'eip155',
      adapter: evmAdapter,
      accounts: ['eip155:1:0x0000000000000000000000000000000000000001'],
      caipNetwork: 'eip155:1'
    });
    ConnectionsController.setConnection({
      namespace: 'solana',
      adapter: solanaAdapter,
      accounts: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:11111111111111111111111111111111'],
      caipNetwork: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
    });

    await ConnectionsController.disconnect('eip155');

    expect(evmAdapter.disconnect).toHaveBeenCalledTimes(1);
    expect(evmAdapter.removeConnector).toHaveBeenCalledTimes(1);
    expect(solanaAdapter.removeConnector).toHaveBeenCalledTimes(1);
    expect(ConnectionsController.state.connections.size).toBe(0);
  });

  it('also detaches the adapter when the wallet ended the session', async () => {
    const adapter = createAdapter({ type: 'walletconnect' });

    ConnectionsController.setConnection({
      namespace: 'eip155',
      adapter,
      accounts: ['eip155:1:0x0000000000000000000000000000000000000001'],
      caipNetwork: 'eip155:1'
    });

    await ConnectionsController.disconnect('eip155', false);

    expect(adapter.disconnect).not.toHaveBeenCalled();
    expect(adapter.removeConnector).toHaveBeenCalledTimes(1);
  });
});
