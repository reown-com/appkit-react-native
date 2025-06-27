import { ConnectionController, type ConnectionControllerClient } from '../../index';

// -- Setup --------------------------------------------------------------------
const walletConnectUri = 'wc://uri?=123';

const client: ConnectionControllerClient = {
  connectWalletConnect: async onUri => {
    onUri(walletConnectUri);
    await Promise.resolve();
  },
  disconnect: async () => Promise.resolve(),
  signMessage: function (): Promise<string> {
    throw new Error('Function not implemented.');
  },
  sendTransaction: function (): Promise<`0x${string}` | null> {
    throw new Error('Function not implemented.');
  },
  parseUnits: function (): bigint {
    throw new Error('Function not implemented.');
  },
  formatUnits: function (): string {
    throw new Error('Function not implemented.');
  },
  writeContract: function (): Promise<`0x${string}` | null> {
    throw new Error('Function not implemented.');
  },
  estimateGas: function (): Promise<bigint> {
    throw new Error('Function not implemented.');
  },
  getEnsAddress: function (): Promise<false | string> {
    throw new Error('Function not implemented.');
  },
  getEnsAvatar: function (): Promise<false | string> {
    throw new Error('Function not implemented.');
  }
};

// -- Tests --------------------------------------------------------------------
describe('ConnectionController', () => {
  it('should throw if client not set', () => {
    expect(ConnectionController._getClient).toThrow('ConnectionController client not set');
  });

  it('should have valid default state', () => {
    ConnectionController.setClient(client);

    expect(ConnectionController.state).toEqual({
      wcError: false,
      _client: ConnectionController._getClient()
    });
  });

  it('should update state correctly on disconnect()', async () => {
    await ConnectionController.disconnect();
    expect(ConnectionController.state.wcUri).toEqual(undefined);
    expect(ConnectionController.state.wcPairingExpiry).toEqual(undefined);
    expect(ConnectionController.state.wcPromise).toEqual(undefined);
  });

  it('should not throw on connectWalletConnect()', () => {
    ConnectionController.connectWalletConnect();
  });

  it('should update state correctly on resetWcConnection()', () => {
    ConnectionController.resetWcConnection();
    expect(ConnectionController.state.wcUri).toEqual(undefined);
    expect(ConnectionController.state.wcPairingExpiry).toEqual(undefined);
    expect(ConnectionController.state.wcPromise).toEqual(undefined);
  });
});
